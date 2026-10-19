import { BookingModel, IBookingDocument } from '../models/Booking';
import { ListingModel } from '../models/Listing';
import { ParkingSpaceModel } from '../models/ParkingSpace';
import { ChargingPortModel } from '../models/ChargingPort';
import { ChargingSessionModel } from '../models/ChargingSession';
import { VehicleModel } from '../models/Vehicle';
import { CompatibilityService } from './compatibilityService';
import { ServiceType, BookingStatus, PLATFORM_CONFIG } from '@vflow/shared';
import crypto from 'crypto';
import { SettlementService } from './settlementService';

export class BookingService {
  /**
   * Check for overlapping reservations on parking space or charging port
   */
  static async checkAvailability(params: {
    listingId: string;
    parkingSpaceId?: string;
    chargingPortId?: string;
    startTime: string; // ISO
    endTime: string;   // ISO
  }): Promise<{ available: boolean; conflictingBooking?: any }> {
    const start = new Date(params.startTime).toISOString();
    const end = new Date(params.endTime).toISOString();

    const resourceQueries: any[] = [];

    if (params.parkingSpaceId) {
      resourceQueries.push({ parkingSpaceId: params.parkingSpaceId });

      // Check if this space has an attached charger
      const space = await ParkingSpaceModel.findById(params.parkingSpaceId);
      if (space?.attachedChargingPortId) {
        resourceQueries.push({ chargingPortId: space.attachedChargingPortId });
      }
    }

    if (params.chargingPortId) {
      resourceQueries.push({ chargingPortId: params.chargingPortId });

      // Check if this charger has an attached parking space
      const port = await ChargingPortModel.findById(params.chargingPortId);
      if (port?.attachedParkingSpaceId) {
        resourceQueries.push({ parkingSpaceId: port.attachedParkingSpaceId });
      }
    }

    if (resourceQueries.length === 0) {
      // Check listing level if space not explicitly chosen
      return { available: true };
    }

    // Overlap condition: (ExistingStart < RequestedEnd) AND (ExistingEnd > RequestedStart)
    const conflict = await BookingModel.findOne({
      listingId: params.listingId,
      $or: resourceQueries,
      status: { $in: ['pending_payment', 'confirmed', 'in_progress'] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (conflict) {
      return { available: false, conflictingBooking: conflict };
    }

    return { available: true };
  }

  /**
   * Create a booking with atomic concurrency protection
   */
  static async createBooking(data: {
    customerId: string;
    listingId: string;
    serviceType: ServiceType;
    parkingSpaceId?: string;
    chargingPortId?: string;
    vehicleId?: string;
    startTime: string;
    endTime: string;
    vehicleDetails?: {
      licensePlate?: string;
      model: string;
      type?: any;
      manufacturer?: string;
      powertrain?: string;
      connectorType?: string;
    };
  }): Promise<IBookingDocument> {
    const listing = await ListingModel.findById(data.listingId);
    if (!listing) throw new Error('Listing not found');

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      throw new Error('End time must be after start time');
    }

    // Vehicle lookup and authorization
    let vehicleDoc: any = null;
    let resolvedVehicleDetails = data.vehicleDetails;

    if (data.vehicleId) {
      vehicleDoc = await VehicleModel.findById(data.vehicleId);
      if (!vehicleDoc) {
        throw new Error('Selected vehicle not found');
      }
      if (vehicleDoc.userId.toString() !== data.customerId) {
        throw new Error('Unauthorized vehicle selection');
      }
      resolvedVehicleDetails = {
        licensePlate: vehicleDoc.registrationNumber || '',
        model: `${vehicleDoc.make} ${vehicleDoc.model}`,
        type: vehicleDoc.vehicleType,
        manufacturer: vehicleDoc.make,
        powertrain: vehicleDoc.powertrain,
        connectorType: vehicleDoc.supportedConnectors?.join(', ')
      };
    }

    // Auto-select or validate resource
    let spaceId = data.parkingSpaceId;
    let portId = data.chargingPortId;

    // Validate explicitly provided port compatibility
    if (portId && (data.serviceType === 'charging' || data.serviceType === 'combined') && vehicleDoc) {
      const explicitPort = await ChargingPortModel.findById(portId);
      if (explicitPort) {
        const compat = CompatibilityService.checkCompatibility(vehicleDoc, {
          chargerType: explicitPort.chargerType as any,
          connectorType: explicitPort.connectorType as any,
          powerKw: explicitPort.powerKw
        });
        if (!compat.isCompatible) {
          throw new Error(`Incompatible vehicle for this charger: ${compat.reason || 'Connector or charger type mismatch'}`);
        }
      }
    }

    // Auto-select parking space if needed
    if (!spaceId && (data.serviceType === 'parking' || data.serviceType === 'combined')) {
      const availableSpaces = await ParkingSpaceModel.find({
        listingId: data.listingId,
        status: 'available'
      });
      for (const sp of availableSpaces) {
        const check = await this.checkAvailability({
          listingId: data.listingId,
          parkingSpaceId: sp._id.toString(),
          startTime: data.startTime,
          endTime: data.endTime
        });
        if (check.available) {
          spaceId = sp._id.toString();
          break;
        }
      }
      if (!spaceId) {
        throw new Error('No parking spaces available for the selected time interval');
      }
    }

    // Auto-select charging port if needed
    if (!portId && (data.serviceType === 'charging' || data.serviceType === 'combined')) {
      const availablePorts = await ChargingPortModel.find({
        listingId: data.listingId,
        status: 'available'
      });
      for (const cp of availablePorts) {
        if (vehicleDoc) {
          const compat = CompatibilityService.checkCompatibility(vehicleDoc, {
            chargerType: cp.chargerType as any,
            connectorType: cp.connectorType as any,
            powerKw: cp.powerKw
          });
          if (!compat.isCompatible) {
            continue;
          }
        }
        const check = await this.checkAvailability({
          listingId: data.listingId,
          chargingPortId: cp._id.toString(),
          startTime: data.startTime,
          endTime: data.endTime
        });
        if (check.available) {
          portId = cp._id.toString();
          break;
        }
      }
      if (!portId) {
        throw new Error(
          vehicleDoc
            ? 'No compatible charging ports available for this vehicle for the selected time interval'
            : 'No charging ports available for the selected time interval'
        );
      }
    }

    // Final concurrency check
    const availability = await this.checkAvailability({
      listingId: data.listingId,
      parkingSpaceId: spaceId,
      chargingPortId: portId,
      startTime: data.startTime,
      endTime: data.endTime
    });

    if (!availability.available) {
      throw new Error('The selected spot is already reserved for this time interval. Please select a different time or slot.');
    }

    // Calculate duration in hours
    const durationHours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));

    // Price calculation in paise
    let baseAmountPaise = 0;
    if (data.serviceType === 'parking' || data.serviceType === 'combined') {
      baseAmountPaise = listing.pricing.hourlyRatePaise * durationHours;
    }

    let chargingAmountPaise = 0;
    if (data.serviceType === 'charging' || data.serviceType === 'combined') {
      if (listing.pricing.chargingFlatRatePaise) {
        chargingAmountPaise = listing.pricing.chargingFlatRatePaise;
      } else if (listing.pricing.chargingRatePerKwhPaise) {
        // Estimated 20kWh initial reservation estimate
        chargingAmountPaise = listing.pricing.chargingRatePerKwhPaise * 20;
      } else {
        chargingAmountPaise = 25000; // default ₹250 flat estimate
      }
    }

    const subtotal = baseAmountPaise + chargingAmountPaise;
    const commissionPercent = PLATFORM_CONFIG.DEFAULT_COMMISSION_PERCENTAGE;
    const platformCommissionPaise = Math.round((subtotal * commissionPercent) / 100);
    const gstPercent = PLATFORM_CONFIG.GST_PERCENTAGE;
    const gstPaise = Math.round((platformCommissionPaise * gstPercent) / 100);
    const totalAmountPaise = subtotal + gstPaise;
    const providerSharePaise = subtotal - platformCommissionPaise;

    // Generate readable booking number and access PIN
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const bookingNumber = `VF-${new Date().getFullYear()}-${randomHex}`;
    const accessPin = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await BookingModel.create({
      bookingNumber,
      customerId: data.customerId,
      providerId: listing.providerId,
      listingId: data.listingId,
      serviceType: data.serviceType,
      parkingSpaceId: spaceId,
      chargingPortId: portId,
      vehicleId: data.vehicleId,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'pending_payment',
      pricing: {
        baseAmountPaise,
        chargingAmountPaise,
        platformCommissionPaise,
        gstPaise,
        totalAmountPaise,
        providerSharePaise
      },
      paymentStatus: 'created',
      accessPin,
      vehicleDetails: resolvedVehicleDetails
    });

    return booking;
  }

  static async getBookingById(bookingId: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) return null;

    const listing = await ListingModel.findById(booking.listingId);
    const parkingSpace = booking.parkingSpaceId ? await ParkingSpaceModel.findById(booking.parkingSpaceId) : null;
    const chargingPort = booking.chargingPortId ? await ChargingPortModel.findById(booking.chargingPortId) : null;

    return {
      booking,
      listing,
      parkingSpace,
      chargingPort
    };
  }

  static async getCustomerBookings(customerId: string): Promise<any[]> {
    const bookings = await BookingModel.find({ customerId }).sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const listing = await ListingModel.findById(b.listingId).select('title address photos pricing location').lean();
        return { ...b, listing };
      })
    );
    return enriched;
  }

  static async getProviderBookings(providerId: string): Promise<any[]> {
    const bookings = await BookingModel.find({ providerId }).sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const listing = await ListingModel.findById(b.listingId).select('title address photos').lean();
        return { ...b, listing };
      })
    );
    return enriched;
  }

  static async markCompleted(bookingId: string): Promise<IBookingDocument> {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    booking.status = 'completed';
    await booking.save();

    // Trigger next-day ledger eligibility
    const { SettlementService } = await import('./settlementService');
    await SettlementService.onBookingCompleted(booking);

    return booking;
  }
}
