import { ProviderModel } from '../models/Provider';
import { ListingModel } from '../models/Listing';
import { BookingModel } from '../models/Booking';
import { PaymentModel } from '../models/Payment';
import { PayoutModel } from '../models/Payout';
import { FinancialLedgerModel } from '../models/FinancialLedger';
import { UserModel } from '../models/User';
import { AdminAuditLogModel } from '../models/AdminAuditLog';
import { ProviderVerificationStatus, ListingStatus } from '@vflow/shared';
import { SettlementService } from './settlementService';

export class AdminService {
  static async getPlatformMetrics() {
    const [
      totalUsers,
      totalProviders,
      totalListings,
      totalBookings,
      paymentsAgg,
      payoutsAgg,
      pendingPayoutsAgg
    ] = await Promise.all([
      UserModel.countDocuments(),
      ProviderModel.countDocuments(),
      ListingModel.countDocuments({ status: 'active' }),
      BookingModel.countDocuments(),
      PaymentModel.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, totalCaptured: { $sum: '$amountPaise' }, count: { $sum: 1 } } }
      ]),
      PayoutModel.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, totalPaidOut: { $sum: '$amountPaise' }, count: { $sum: 1 } } }
      ]),
      FinancialLedgerModel.aggregate([
        { $match: { status: { $in: ['pending', 'eligible', 'processing'] } } },
        { $group: { _id: null, totalPending: { $sum: '$netPayablePaise' } } }
      ])
    ]);

    const totalRevenuePaise = paymentsAgg[0]?.totalCaptured || 0;
    const totalPaidOutPaise = payoutsAgg[0]?.totalPaidOut || 0;
    const totalPendingPayoutPaise = pendingPayoutsAgg[0]?.totalPending || 0;

    return {
      totalUsers,
      totalProviders,
      totalListings,
      totalBookings,
      financials: {
        totalRevenuePaise,
        totalPaidOutPaise,
        totalPendingPayoutPaise,
        platformCommissionPaise: Math.round(totalRevenuePaise * 0.1) // Derived 10%
      }
    };
  }

  static async updateProviderStatus(
    providerId: string,
    status: ProviderVerificationStatus,
    adminId: string,
    reason?: string
  ) {
    const provider = await ProviderModel.findById(providerId);
    if (!provider) throw new Error('Provider not found');

    const prevStatus = provider.verificationStatus;
    provider.verificationStatus = status;
    await provider.save();

    await AdminAuditLogModel.create({
      adminId,
      action: 'UPDATE_PROVIDER_STATUS',
      targetCollection: 'providers',
      targetId: providerId,
      reason,
      changes: { previous: prevStatus, current: status }
    });

    return provider;
  }

  static async updateListingStatus(
    listingId: string,
    status: ListingStatus,
    adminId: string,
    reason?: string
  ) {
    const listing = await ListingModel.findById(listingId);
    if (!listing) throw new Error('Listing not found');

    const prevStatus = listing.status;
    listing.status = status;
    await listing.save();

    await AdminAuditLogModel.create({
      adminId,
      action: 'UPDATE_LISTING_STATUS',
      targetCollection: 'listings',
      targetId: listingId,
      reason,
      changes: { previous: prevStatus, current: status }
    });

    return listing;
  }

  static async getAuditLogs(limit: number = 50) {
    return await AdminAuditLogModel.find().sort({ createdAt: -1 }).limit(limit);
  }
}
