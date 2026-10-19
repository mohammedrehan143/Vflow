import { ListingModel, IListingDocument } from '../models/Listing';
import { ParkingSpaceModel } from '../models/ParkingSpace';
import { ChargingPortModel } from '../models/ChargingPort';
import { ChargingStationModel } from '../models/ChargingStation';
import { VehicleModel } from '../models/Vehicle';
import { CompatibilityService } from './compatibilityService';
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
  chargerType?: 'AC' | 'DC' | 'DC_Fast';
  minPowerKw?: number;
  maxPowerKw?: number;
  isParkingIncluded?: boolean;
  speedCategory?: 'slow' | 'fast' | 'rapid';
  vehicleId?: string;
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
      chargingStations?: Array<{
        stationName: string;
        manufacturer?: string;
        model?: string;
        chargerType: 'AC' | 'DC' | 'DC_Fast';
        ratedPowerKw: number;
        totalPorts?: number;
        status?: 'operational' | 'maintenance' | 'offline';
      }>;
      chargingPorts?: Array<{
        portIdentifier: string;
        chargerType: any;
        connectorType: any;
        powerKw: number;
        ratedPowerKw?: number;
        pricingModel: any;
        pricePerUnitPaise: number;
        chargerManufacturer?: string;
        chargerModel?: string;
        isParkingIncluded?: boolean;
        requiresSimultaneousParking?: boolean;
        operatingHours?: string;
        stationId?: string;
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

    // Create charging stations if configured
    const createdStations: Record<string, string> = {};
    if (data.chargingStations && data.chargingStations.length > 0) {
      for (const st of data.chargingStations) {
        const stationDoc = await ChargingStationModel.create({
          listingId,
          providerId,
          stationName: st.stationName,
          manufacturer: st.manufacturer,
          model: st.model,
          chargerType: st.chargerType,
          ratedPowerKw: st.ratedPowerKw,
          totalPorts: st.totalPorts || 1,
          status: st.status || 'operational'
        });
        createdStations[st.stationName] = stationDoc._id.toString();
      }
    }

    // Create charging ports if charging or combined
    if (data.chargingPorts && data.chargingPorts.length > 0) {
      for (let i = 0; i < data.chargingPorts.length; i++) {
        const portData = data.chargingPorts[i];
        const linkedSpace = createdParkingSpaces[i] || createdParkingSpaces[0];
        const stationId = portData.stationId || Object.values(createdStations)[0];

        const port = await ChargingPortModel.create({
          listingId,
          providerId,
          stationId,
          portIdentifier: portData.portIdentifier || `Charger Gun #${i + 1}`,
          chargerType: portData.chargerType,
          connectorType: portData.connectorType,
          powerKw: portData.powerKw,
          ratedPowerKw: portData.ratedPowerKw || portData.powerKw,
          chargerManufacturer: portData.chargerManufacturer,
          chargerModel: portData.chargerModel,
          pricingModel: portData.pricingModel,
          pricePerUnitPaise: portData.pricePerUnitPaise,
          attachedParkingSpaceId: linkedSpace ? linkedSpace._id.toString() : undefined,
          isParkingIncluded: portData.isParkingIncluded ?? false,
          requiresSimultaneousParking: portData.requiresSimultaneousParking ?? false,
          operatingHours: portData.operatingHours || '24/7',
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

    const [parkingSpaces, chargingPorts, chargingStations] = await Promise.all([
      ParkingSpaceModel.find({ listingId: listing._id.toString() }),
      ChargingPortModel.find({ listingId: listing._id.toString() }),
      ChargingStationModel.find({ listingId: listing._id.toString() })
    ]);

    // Format spec badge
    let specBadge = '';
    if (chargingPorts.length > 0) {
      const topPort = chargingPorts.reduce((max, p) => (p.powerKw > (max?.powerKw || 0) ? p : max), chargingPorts[0]);
      const parts: string[] = [];
      if (topPort.powerKw) parts.push(`${topPort.powerKw} kW ${topPort.chargerType || 'AC'}`);
      if (topPort.connectorType) parts.push(topPort.connectorType);
      if (topPort.isParkingIncluded || listing.isCovered) parts.push('Parking Available');
      specBadge = parts.join(' · ');
    }

    return {
      listing,
      parkingSpaces,
      chargingPorts,
      chargingStations,
      specBadge
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

    // Charger-specific filtering
    const portQuery: any = { status: { $ne: 'offline' } };
    let hasPortFilter = false;

    if (filters.chargerType) {
      hasPortFilter = true;
      if (filters.chargerType === 'DC') {
        portQuery.chargerType = { $in: ['DC', 'DC_Fast'] };
      } else {
        portQuery.chargerType = filters.chargerType;
      }
    }

    if (filters.connectorType) {
      hasPortFilter = true;
      portQuery.connectorType = filters.connectorType;
    }

    if (filters.isParkingIncluded !== undefined) {
      hasPortFilter = true;
      portQuery.isParkingIncluded = filters.isParkingIncluded;
    }

    if (filters.minPowerKw !== undefined || filters.maxPowerKw !== undefined) {
      hasPortFilter = true;
      portQuery.powerKw = {};
      if (filters.minPowerKw !== undefined) portQuery.powerKw.$gte = Number(filters.minPowerKw);
      if (filters.maxPowerKw !== undefined) portQuery.powerKw.$lte = Number(filters.maxPowerKw);
    }

    if (filters.speedCategory) {
      hasPortFilter = true;
      portQuery.powerKw = portQuery.powerKw || {};
      if (filters.speedCategory === 'slow') {
        portQuery.powerKw.$lt = 11;
      } else if (filters.speedCategory === 'fast') {
        portQuery.powerKw.$gte = 11;
        portQuery.powerKw.$lte = 50;
      } else if (filters.speedCategory === 'rapid') {
        portQuery.powerKw.$gt = 50;
      }
    }

    if (hasPortFilter) {
      const matchingListingIds = await ChargingPortModel.distinct('listingId', portQuery);
      query._id = { $in: matchingListingIds };
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

    // Fetch customer vehicle if vehicleId supplied
    let customerVehicle: any = null;
    if (filters.vehicleId) {
      customerVehicle = await VehicleModel.findById(filters.vehicleId);
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const [listings, totalCount] = await Promise.all([
      ListingModel.find(query).skip(skip).limit(limit).lean(),
      ListingModel.countDocuments(query)
    ]);

    // Attach brief resource counts, spec badges, and compatibility
    const enrichedListings = await Promise.all(
      listings.map(async (item) => {
        const [spacesCount, ports, stations] = await Promise.all([
          ParkingSpaceModel.countDocuments({ listingId: item._id.toString() }),
          ChargingPortModel.find({ listingId: item._id.toString() }).lean(),
          ChargingStationModel.find({ listingId: item._id.toString() }).lean()
        ]);

        // Prominent spec badge
        let specBadge = '';
        if (ports.length > 0) {
          const topPort = ports.reduce((max, p) => (p.powerKw > (max?.powerKw || 0) ? p : max), ports[0]);
          const parts: string[] = [];
          if (topPort.powerKw) parts.push(`${topPort.powerKw} kW ${topPort.chargerType || 'AC'}`);
          if (topPort.connectorType) parts.push(topPort.connectorType);
          if (topPort.isParkingIncluded || item.isCovered) parts.push('Parking Available');
          specBadge = parts.join(' · ');
        }

        // Compatibility analysis
        let compatibility: any = null;
        if (customerVehicle && ports.length > 0) {
          const checks = ports.map((p) =>
            CompatibilityService.checkCompatibility(customerVehicle, {
              chargerType: p.chargerType as any,
              connectorType: p.connectorType as any,
              powerKw: p.powerKw
            })
          );
          const compatibleCheck = checks.find((c) => c.isCompatible);
          if (compatibleCheck) {
            compatibility = {
              compatible: true,
              maxChargerPowerKw: compatibleCheck.chargerRatedPowerKw,
              maxVehiclePowerKw: compatibleCheck.vehicleMaxSupportedPowerKw,
              effectivePowerKw: compatibleCheck.effectiveChargingPowerKw,
              isSpeedThrottled:
                (compatibleCheck.effectiveChargingPowerKw || 0) < (compatibleCheck.chargerRatedPowerKw || 0),
              warning:
                compatibleCheck.warning ||
                ((compatibleCheck.effectiveChargingPowerKw || 0) < (compatibleCheck.chargerRatedPowerKw || 0)
                  ? `Vehicle max charging speed is ${compatibleCheck.effectiveChargingPowerKw} kW (charger rated ${compatibleCheck.chargerRatedPowerKw} kW)`
                  : undefined)
            };
          } else {
            compatibility = {
              compatible: false,
              reasons: [checks[0]?.reason || 'Connector or powertrain incompatible']
            };
          }
        }

        return {
          ...item,
          availableSpacesCount: spacesCount,
          chargingPorts: ports,
          chargingStations: stations,
          specBadge,
          compatibility
        };
      })
    );

    // If filtering with a vehicle, sort compatible ones to top
    if (customerVehicle) {
      enrichedListings.sort((a, b) => {
        const aCompat = a.compatibility?.compatible ? 1 : 0;
        const bCompat = b.compatibility?.compatible ? 1 : 0;
        return bCompat - aCompat;
      });
    }

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

  static async getProviderListings(providerId: string): Promise<any[]> {
    const listings = await ListingModel.find({ providerId }).sort({ createdAt: -1 });
    return listings;
  }

  static async getProviderResources(providerId: string): Promise<{
    spaces: any[];
    stations: any[];
    ports: any[];
  }> {
    const [spaces, stations, ports] = await Promise.all([
      ParkingSpaceModel.find({ providerId }).lean(),
      ChargingStationModel.find({ providerId }).lean(),
      ChargingPortModel.find({ providerId }).lean()
    ]);
    return { spaces, stations, ports };
  }

  static async updateParkingSpace(spaceId: string, providerId: string, updates: any): Promise<any> {
    const space = await ParkingSpaceModel.findOneAndUpdate(
      { _id: spaceId, providerId },
      { $set: updates },
      { new: true }
    );
    if (!space) throw new Error('Parking space not found or unauthorized');
    return space;
  }

  static async updateChargingPort(portId: string, providerId: string, updates: any): Promise<any> {
    const port = await ChargingPortModel.findOneAndUpdate(
      { _id: portId, providerId },
      { $set: updates },
      { new: true }
    );
    if (!port) throw new Error('Charging port not found or unauthorized');
    return port;
  }

  static async updateChargingStation(stationId: string, providerId: string, updates: any): Promise<any> {
    const station = await ChargingStationModel.findOneAndUpdate(
      { _id: stationId, providerId },
      { $set: updates },
      { new: true }
    );
    if (!station) throw new Error('Charging station not found or unauthorized');
    return station;
  }
}
