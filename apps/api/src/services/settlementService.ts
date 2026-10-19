import { FinancialLedgerModel, IFinancialLedgerDocument } from '../models/FinancialLedger';
import { PayoutModel, IPayoutDocument } from '../models/Payout';
import { ProviderModel } from '../models/Provider';
import { NotificationModel } from '../models/Notification';
import { AdminAuditLogModel } from '../models/AdminAuditLog';
import { IBookingDocument } from '../models/Booking';
import { IPaymentDocument } from '../models/Payment';
import { IRefundDocument } from '../models/Refund';
import { ProviderService } from './providerService';
import crypto from 'crypto';

export class SettlementService {
  /**
   * Calculate next calendar day cutoff string "YYYY-MM-DD"
   */
  static getNextCalendarDayDate(fromDate: Date = new Date()): string {
    const nextDay = new Date(fromDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const year = nextDay.getFullYear();
    const month = String(nextDay.getMonth() + 1).padStart(2, '0');
    const day = String(nextDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * When a payment is captured, record the earnings in the financial ledger
   */
  static async recordBookingPayment(booking: IBookingDocument, payment: IPaymentDocument) {
    const existingLedger = await FinancialLedgerModel.findOne({
      bookingId: booking._id.toString(),
      entryType: 'booking_earning'
    });

    if (existingLedger) return existingLedger;

    const completionDate = new Date(booking.endTime);
    const targetPayoutDate = this.getNextCalendarDayDate(completionDate);
    const eligibilityTimestamp = new Date(completionDate.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const ledgerEntry = await FinancialLedgerModel.create({
      providerId: booking.providerId,
      bookingId: booking._id.toString(),
      paymentId: payment._id.toString(),
      entryType: 'booking_earning',
      grossAmountPaise: booking.pricing.baseAmountPaise + (booking.pricing.chargingAmountPaise || 0),
      platformCommissionPaise: booking.pricing.platformCommissionPaise,
      netPayablePaise: booking.pricing.providerSharePaise,
      eligibilityTimestamp,
      targetPayoutDate,
      status: booking.status === 'completed' ? 'eligible' : 'pending',
      notes: `Booking ${booking.bookingNumber} payment earnings`
    });

    await ProviderService.recalculateTotals(booking.providerId);
    return ledgerEntry;
  }

  /**
   * When a booking is marked completed, promote ledger entry to eligible
   */
  static async onBookingCompleted(booking: IBookingDocument) {
    const ledgerEntry = await FinancialLedgerModel.findOne({
      bookingId: booking._id.toString(),
      entryType: 'booking_earning'
    });

    if (ledgerEntry && ledgerEntry.status === 'pending') {
      ledgerEntry.status = 'eligible';
      await ledgerEntry.save();
    }

    await ProviderService.recalculateTotals(booking.providerId);
  }

  /**
   * Record refund in financial ledger
   */
  static async recordRefund(booking: IBookingDocument, refund: IRefundDocument) {
    // Reverse or deduct from provider ledger
    const targetPayoutDate = this.getNextCalendarDayDate();

    await FinancialLedgerModel.create({
      providerId: booking.providerId,
      bookingId: booking._id.toString(),
      paymentId: refund.paymentId,
      entryType: 'refund_debit',
      grossAmountPaise: refund.amountPaise,
      platformCommissionPaise: 0,
      netPayablePaise: -refund.amountPaise,
      eligibilityTimestamp: new Date().toISOString(),
      targetPayoutDate,
      status: 'paid', // immediately reflected
      notes: `Refund debit for booking ${booking.bookingNumber}: ${refund.reason}`
    });

    // Mark original earning on_hold or reversed if not yet paid
    const originalEarning = await FinancialLedgerModel.findOne({
      bookingId: booking._id.toString(),
      entryType: 'booking_earning'
    });
    if (originalEarning && originalEarning.status !== 'paid') {
      originalEarning.status = 'reversed';
      await originalEarning.save();
    }

    await ProviderService.recalculateTotals(booking.providerId);
  }

  /**
   * Run the next-day payout calculation engine
   */
  static async processDailyPayouts(targetDate?: string): Promise<{
    processedCount: number;
    totalAmountPaise: number;
    payouts: any[];
  }> {
    const today = targetDate || new Date().toISOString().split('T')[0];
    console.log(`[SettlementEngine] Running next-day payout job for targetDate <= ${today}...`);

    // Find all eligible ledger items whose target payout date has arrived
    const eligibleEntries = await FinancialLedgerModel.find({
      status: 'eligible',
      targetPayoutDate: { $lte: today }
    });

    if (eligibleEntries.length === 0) {
      console.log(`[SettlementEngine] No eligible entries found for targetDate ${today}`);
      return { processedCount: 0, totalAmountPaise: 0, payouts: [] };
    }

    // Group entries by provider
    const providerMap = new Map<string, IFinancialLedgerDocument[]>();
    for (const entry of eligibleEntries) {
      const list = providerMap.get(entry.providerId) || [];
      list.push(entry);
      providerMap.set(entry.providerId, list);
    }

    const createdPayouts: any[] = [];
    let grandTotalPaise = 0;

    for (const [providerId, entries] of providerMap.entries()) {
      const provider = await ProviderModel.findById(providerId);
      if (!provider) continue;

      const totalPayablePaise = entries.reduce((acc, curr) => acc + curr.netPayablePaise, 0);
      if (totalPayablePaise <= 0) continue;

      const isRouteEnabled = process.env.RAZORPAY_ROUTE_ENABLED === 'true';
      const payoutMethod = isRouteEnabled && provider.payoutConfiguration?.razorpayFundAccountId
        ? 'razorpay_route'
        : 'manual_bank_transfer';

      const payoutRef = `PO-${today.replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // Create payout record
      const payout = await PayoutModel.create({
        providerId,
        amountPaise: totalPayablePaise,
        currency: 'INR',
        targetPayoutDate: today,
        status: isRouteEnabled ? 'processing' : 'eligible', // Ready for admin or automated dispatch
        payoutMethod,
        payoutReference: payoutRef,
        ledgerEntryIds: entries.map((e) => e._id.toString())
      });

      // Mark ledger entries as processing
      const entryIds = entries.map((e) => e._id);
      await FinancialLedgerModel.updateMany(
        { _id: { $in: entryIds } },
        { $set: { status: 'processing', payoutId: payout._id.toString() } }
      );

      // In development / simulated mode, if manual or auto-settle is desired:
      createdPayouts.push(payout);
      grandTotalPaise += totalPayablePaise;

      await NotificationModel.create({
        userId: provider.authUserId,
        title: 'Settlement Queued',
        message: `Payout ${payoutRef} for ₹${(totalPayablePaise / 100).toFixed(2)} is queued for next-day settlement.`,
        type: 'payout',
        linkUrl: '/provider/payouts'
      });
    }

    console.log(`[SettlementEngine] Queued ${createdPayouts.length} provider settlements totaling ₹${(grandTotalPaise / 100).toFixed(2)}`);

    return {
      processedCount: createdPayouts.length,
      totalAmountPaise: grandTotalPaise,
      payouts: createdPayouts
    };
  }

  /**
   * Admin executes or marks payout as completed with reference
   */
  static async executePayout(payoutId: string, adminId: string, referenceNumber: string) {
    const payout = await PayoutModel.findById(payoutId);
    if (!payout) throw new Error('Payout record not found');

    if (payout.status === 'paid') {
      return payout;
    }

    payout.status = 'paid';
    payout.payoutReference = referenceNumber;
    payout.processedAt = new Date().toISOString();
    payout.processedByAdminId = adminId;
    await payout.save();

    // Mark associated ledger entries as paid
    await FinancialLedgerModel.updateMany(
      { _id: { $in: payout.ledgerEntryIds } },
      { $set: { status: 'paid' } }
    );

    // Refresh provider canonical totals
    await ProviderService.recalculateTotals(payout.providerId);

    // Create Admin Audit Log
    await AdminAuditLogModel.create({
      adminId,
      action: 'EXECUTE_PAYOUT',
      targetCollection: 'payouts',
      targetId: payout._id.toString(),
      reason: `Settlement disbursed with reference ${referenceNumber}`,
      changes: { amountPaise: payout.amountPaise, status: 'paid', referenceNumber }
    });

    const provider = await ProviderModel.findById(payout.providerId);
    if (provider) {
      await NotificationModel.create({
        userId: provider.authUserId,
        title: 'Payout Disbursed!',
        message: `Your settlement of ₹${(payout.amountPaise / 100).toFixed(2)} has been successfully transferred. Ref: ${referenceNumber}`,
        type: 'payout',
        linkUrl: '/provider/payouts'
      });
    }

    return payout;
  }
}
