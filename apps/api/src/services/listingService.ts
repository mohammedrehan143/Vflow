import { ListingModel, IListingDocument } from '../models/Listing';
import { ParkingSpaceModel } from '../models/ParkingSpace';
import { ChargingPortModel } from '../models/ChargingPort';
import { ServiceType, ParkingType, VehicleRestriction, ConnectorType } from '@vflow/shared';

export interface ListingFilterOptions {
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  serviceType?: ServiceType;
  parkingType?: ParkingType;
  vehicleType?: VehicleRestriction;
  connectorType?: ConnectorType;
  minPricePaise?: number;
  maxPricePaise?: number;
  instantBookingOnly?: boolean;
  isCovered?: boolean;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export class ListingService {
  static async createListing(
    providerId: string,
    data: {
      title: string;
      description: string;
      serviceType: ServiceType;
      parkingType?: ParkingType;
      address: any;
      location: { type: 'Point'; coordinates: [number, number] };
      amenities?: string[];
      photos?: string[];
      pricing: any;
      cancellationPolicy?: any;
      instantBooking?: boolean;
      entryExitInstructions?: string;
      houseRules?: string[];
      isCovered?: boolean;
      parkingSpacesCount?: number;
      chargingPorts?: Array<{
        portIdentifier: string;
        chargerType: any;
        connectorType: any;
        powerKw: number;
        pricingModel: any;
        pricePerUnitPaise: number;
      }>;
    }
  ): Promise<IListingDocument> {
    const listing = await ListingModel.create({
      providerId,
      title: data.title,
      description: data.description,
      serviceType: data.serviceType,
      parkingType: data.parkingType || 'commercial_building',
      address: data.address,
      location: data.location,
      amenities: data.amenities || [],
      photos: data.photos && data.photos.length > 0 ? data.photos : [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80'
      ],
      pricing: data.pricing,
      cancellationPolicy: data.cancellationPolicy || 'flexible',
      instantBooking: data.instantBooking ?? true,
      entryExitInstructions: data.entryExitInstructions,
      houseRules: data.houseRules || [],
      isCovered: data.isCovered || false,
      status: 'active'
    });

    const listingId = listing._id.toString();

    // Create explicit parking spaces if parking or combined
    const createdParkingSpaces = [];
    const spacesCount = data.parkingSpacesCount ?? (data.serviceType !== 'charging' ? 1 : 0);
    for (let i = 1; i <= spacesCount; i++) {
      const space = await ParkingSpaceModel.create({
        listingId,
        providerId,
        spaceIdentifier: `Slot ${i}`,
        vehicleRestrictions: ['hatchback', 'sedan', 'suv', 'ev'],
        isCovered: data.isCovered || false,
        status: 'available'
      });
      createdParkingSpaces.push(space);
    }

    // Create charging ports if charging or combined
    if (data.chargingPorts && data.chargingPorts.length > 0) {
      for (let i = 0; i < data.chargingPorts.length; i++) {
        const portData = data.chargingPorts[i];
        // If combined, link to the first available parking space to enforce shared resource
        const linkedSpace = createdParkingSpaces[i] || createdParkingSpaces[0];

        const port = await ChargingPortModel.create({
          listingId,
          providerId,
          portIdentifier: portData.portIdentifier || `Charger Gun #${i + 1}`,
          chargerType: portData.chargerType,
          connectorType: portData.connectorType,
          powerKw: portData.powerKw,
          pricingModel: portData.pricingModel,
          pricePerUnitPaise: portData.pricePerUnitPaise,
          attachedParkingSpaceId: linkedSpace ? linkedSpace._id.toString() : undefined,
          status: 'available'
        });

        if (linkedSpace) {
          linkedSpace.isAttachedToCharger = true;
          linkedSpace.attachedChargingPortId = port._id.toString();
          await linkedSpace.save();
        }
      }
    }

    return listing;
  }

  static async getListingDetails(listingId: string) {
    const listing = await ListingModel.findById(listingId);
    if (!listing) return null;

    const parkingSpaces = await ParkingSpaceModel.find({ listingId: listing._id.toString() });
    const chargingPorts = await ChargingPortModel.find({ listingId: listing._id.toString() });

    return {
      listing,
      parkingSpaces,
      chargingPorts
    };
  }

  static async searchListings(filters: ListingFilterOptions): Promise<{
    listings: any[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }> {
    const query: any = { status: 'active' };

    if (filters.serviceType) {
      if (filters.serviceType === 'parking') {
        query.serviceType = { $in: ['parking', 'combined'] };
      } else if (filters.serviceType === 'charging') {
        query.serviceType = { $in: ['charging', 'combined'] };
      } else {
        query.serviceType = filters.serviceType;
      }
    }

    if (filters.city) {
      query['address.city'] = { $regex: new RegExp(filters.city, 'i') };
    }

    if (filters.parkingType) {
      query.parkingType = filters.parkingType;
    }

    if (filters.isCovered !== undefined) {
      query.isCovered = filters.isCovered;
    }

    if (filters.instantBookingOnly) {
      query.instantBooking = true;
    }

    if (filters.amenities && filters.amenities.length > 0) {
      query.amenities = { $all: filters.amenities };
    }

    if (filters.minPricePaise || filters.maxPricePaise) {
      query['pricing.hourlyRatePaise'] = {};
      if (filters.minPricePaise) query['pricing.hourlyRatePaise'].$gte = filters.minPricePaise;
      if (filters.maxPricePaise) query['pricing.hourlyRatePaise'].$lte = filters.maxPricePaise;
    }

    // Geospatial search if coordinates provided
    if (filters.lat !== undefined && filters.lng !== undefined) {
      const radiusMeters = (filters.radiusKm || 15) * 1000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.lng, filters.lat]
          },
          $maxDistance: radiusMeters
        }
      };
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const [listings, totalCount] = await Promise.all([
      ListingModel.find(query).skip(skip).limit(limit).lean(),
      ListingModel.countDocuments(query)
    ]);

    // Attach brief resource counts
    const enrichedListings = await Promise.all(
      listings.map(async (item) => {
        const [spacesCount, ports] = await Promise.all([
          ParkingSpaceModel.countDocuments({ listingId: item._id.toString() }),
          ChargingPortModel.find({ listingId: item._id.toString() }).select('connectorType powerKw').lean()
        ]);
        return {
          ...item,
          availableSpacesCount: spacesCount,
          chargingPorts: ports
        };
      })
    );

    return {
      listings: enrichedListings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  static async getProviderListings(providerId: string) {
    const listings = await ListingModel.find({ providerId }).sort({ createdAt: -1 });
    return listings;
  }
}
