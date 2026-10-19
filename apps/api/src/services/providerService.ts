import { ProviderModel, IProviderDocument } from '../models/Provider';
import { UserModel } from '../models/User';
import { BookingModel } from '../models/Booking';
import { ChargingSessionModel } from '../models/ChargingSession';
import { FinancialLedgerModel } from '../models/FinancialLedger';
import { PayoutModel } from '../models/Payout';
import { ListingModel } from '../models/Listing';
import { ParkingSpaceModel } from '../models/ParkingSpace';
import { ChargingPortModel } from '../models/ChargingPort';
import { ChargingStationModel } from '../models/ChargingStation';
import { ProviderType, ServiceType } from '@vflow/shared';

export class ProviderService {
  /**
   * Register or return existing canonical provider
   */
  static async registerOrGetProvider(
    authUserId: string,
    data: {
      providerType: ProviderType;
      displayName: string;
      email: string;
      phone: string;
      businessName?: string;
      address: any;
      serviceAreas: string[];
      serviceTypes: ServiceType[];
      payoutConfiguration?: any;
    }
  ): Promise<IProviderDocument> {
    let provider = await ProviderModel.findOne({ authUserId });

    if (!provider) {
      provider = await ProviderModel.create({
        authUserId,
        providerType: data.providerType,
        displayName: data.displayName,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName,
        address: data.address,
        serviceAreas: data.serviceAreas,
        serviceTypes: data.serviceTypes,
        payoutAccountStatus: data.payoutConfiguration ? 'active' : 'unconfigured',
        payoutConfiguration: data.payoutConfiguration,
        verificationStatus: 'verified' // Auto-verify in development/pilot or set to pending in prod
      });

      // Update user role to provider if not admin
      const user = await UserModel.findById(authUserId);
      if (user && user.role !== 'admin') {
        user.role = 'provider';
        await user.save();
      }
    } else {
      // Update details
      provider.displayName = data.displayName || provider.displayName;
      provider.phone = data.phone || provider.phone;
      provider.businessName = data.businessName ?? provider.businessName;
      if (data.address) provider.address = data.address;
      if (data.serviceAreas) provider.serviceAreas = data.serviceAreas;
      if (data.serviceTypes) provider.serviceTypes = data.serviceTypes;
      if (data.payoutConfiguration) {
        provider.payoutConfiguration = data.payoutConfiguration;
        provider.payoutAccountStatus = 'active';
      }
      await provider.save();
    }

    return provider;
  }

  static async getProviderByAuthId(authUserId: string): Promise<IProviderDocument | null> {
    const provider = await ProviderModel.findOne({ authUserId });
    if (provider) {
      // Refresh derived totals
      await this.recalculateTotals(provider._id.toString());
      return await ProviderModel.findById(provider._id);
    }
    return null;
  }

  static async getProviderById(providerId: string): Promise<IProviderDocument | null> {
    return await ProviderModel.findById(providerId);
  }

  /**
   * Recalculate derived totals from authoritative collections
   */
  static async recalculateTotals(providerId: string): Promise<void> {
    const provider = await ProviderModel.findById(providerId);
    if (!provider) return;

    // 1. Booking counts
    const parkingBookingsCount = await BookingModel.countDocuments({
      providerId,
      serviceType: { $in: ['parking', 'combined'] }
    });
    const chargingSessionsCount = await ChargingSessionModel.countDocuments({
      providerId
    });
    const completedBookingsCount = await BookingModel.countDocuments({
      providerId,
      status: 'completed'
    });
    const cancelledBookingsCount = await BookingModel.countDocuments({
      providerId,
      status: 'cancelled'
    });

    // 2. Financial totals from Financial Ledger
    const ledgerAgg = await FinancialLedgerModel.aggregate([
      { $match: { providerId } },
      {
        $group: {
          _id: '$entryType',
          totalGross: { $sum: '$grossAmountPaise' },
          totalCommission: { $sum: '$platformCommissionPaise' },
          totalNet: { $sum: '$netPayablePaise' }
        }
      }
    ]);

    let grossRevenue = 0;
    let platformCommission = 0;
    let refundTotal = 0;
    let netEarnings = 0;

    for (const item of ledgerAgg) {
      if (item._id === 'booking_earning') {
        grossRevenue += item.totalGross;
        platformCommission += item.totalCommission;
        netEarnings += item.totalNet;
      } else if (item._id === 'refund_debit') {
        refundTotal += item.totalGross;
        netEarnings -= item.totalGross;
      }
    }

    // 3. Payout totals
    const paidOutAgg = await PayoutModel.aggregate([
      { $match: { providerId, status: 'paid' } },
      { $group: { _id: null, totalPaid: { $sum: '$amountPaise' } } }
    ]);
    const paidOutAmount = paidOutAgg[0]?.totalPaid || 0;

    // Pending payout = eligible or pending ledger entries not yet paid
    const pendingLedgerAgg = await FinancialLedgerModel.aggregate([
      { $match: { providerId, status: { $in: ['pending', 'eligible', 'processing'] } } },
      { $group: { _id: null, totalPending: { $sum: '$netPayablePaise' } } }
    ]);
    const pendingPayoutAmount = pendingLedgerAgg[0]?.totalPending || 0;

    const lastPayout = await PayoutModel.findOne({ providerId, status: 'paid' }).sort({ processedAt: -1 });

    provider.totalParkingBookings = parkingBookingsCount;
    provider.totalChargingSessions = chargingSessionsCount;
    provider.totalCompletedBookings = completedBookingsCount;
    provider.totalCancelledBookings = cancelledBookingsCount;
    provider.grossRevenue = grossRevenue;
    provider.platformCommission = platformCommission;
    provider.refundTotal = refundTotal;
    provider.netEarnings = netEarnings;
    provider.pendingPayoutAmount = Math.max(0, pendingPayoutAmount);
    provider.paidOutAmount = paidOutAmount;
    if (lastPayout?.processedAt) {
      provider.lastPayoutDate = lastPayout.processedAt;
    }

    await provider.save();
  }

  static async getProviderDashboardOverview(providerId: string) {
    const provider = await ProviderModel.findById(providerId);
    if (!provider) throw new Error('Provider not found');

    await this.recalculateTotals(providerId);
    const refreshed = await ProviderModel.findById(providerId);

    const listings = await ListingModel.find({ providerId });
    const listingIds = listings.map((l) => l._id.toString());

    const parkingSpaces = await ParkingSpaceModel.find({ providerId });
    const chargingPorts = await ChargingPortModel.find({ providerId });
    const chargingStations = await ChargingStationModel.find({ providerId });

    // Upcoming vs Completed vs Cancelled bookings
    const upcomingBookings = await BookingModel.find({
      providerId,
      status: { $in: ['confirmed', 'in_progress', 'pending_payment'] }
    })
      .sort({ startTime: 1 })
      .limit(20)
      .lean();

    const completedBookings = await BookingModel.find({
      providerId,
      status: 'completed'
    })
      .sort({ endTime: -1 })
      .limit(20)
      .lean();

    // Payout categories
    const [pendingPayouts, completedPayouts, failedPayouts, heldPayouts] = await Promise.all([
      PayoutModel.find({ providerId, status: 'pending' }).sort({ createdAt: -1 }),
      PayoutModel.find({ providerId, status: 'paid' }).sort({ createdAt: -1 }),
      PayoutModel.find({ providerId, status: 'failed' }).sort({ createdAt: -1 }),
      PayoutModel.find({ providerId, status: 'held' }).sort({ createdAt: -1 })
    ]);

    // Ledger entries
    const pendingLedgerEntries = await FinancialLedgerModel.find({
      providerId,
      status: { $in: ['pending', 'eligible', 'processing'] }
    }).sort({ targetPayoutDate: 1 });

    return {
      provider: refreshed,
      resources: {
        totalListings: listings.length,
        totalParkingSpaces: parkingSpaces.length,
        totalChargingStations: chargingStations.length,
        totalChargingPorts: chargingPorts.length,
        listings,
        parkingSpaces,
        chargingStations,
        chargingPorts
      },
      bookings: {
        total: (refreshed?.totalParkingBookings || 0) + (refreshed?.totalChargingSessions || 0),
        totalParkingBookings: refreshed?.totalParkingBookings || 0,
        totalChargingSessions: refreshed?.totalChargingSessions || 0,
        completed: refreshed?.totalCompletedBookings || 0,
        cancelled: refreshed?.totalCancelledBookings || 0,
        upcoming: upcomingBookings,
        completedList: completedBookings,
        recent: upcomingBookings.concat(completedBookings).slice(0, 10)
      },
      financials: {
        grossRevenue: refreshed?.grossRevenue || 0,
        platformCommission: refreshed?.platformCommission || 0,
        refundTotal: refreshed?.refundTotal || 0,
        netEarnings: refreshed?.netEarnings || 0,
        pendingPayoutAmount: refreshed?.pendingPayoutAmount || 0,
        paidOutAmount: refreshed?.paidOutAmount || 0,
        lastPayoutDate: refreshed?.lastPayoutDate,
        pendingLedgerEntries,
        payouts: {
          pending: pendingPayouts,
          completed: completedPayouts,
          failed: failedPayouts,
          held: heldPayouts
        },
        recentPayouts: completedPayouts.concat(pendingPayouts).slice(0, 10)
      }
    };
  }
}
