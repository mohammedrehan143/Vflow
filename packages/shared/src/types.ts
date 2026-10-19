export type UserRole = 'customer' | 'provider' | 'admin';

export type ProviderVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended';

export type ProviderType = 'individual' | 'business' | 'parking_operator' | 'ev_operator';

export type ServiceType = 'parking' | 'charging' | 'combined';

export type ListingStatus = 'draft' | 'pending_approval' | 'active' | 'suspended';

export type ParkingType =
  | 'home'
  | 'residential_apartment'
  | 'commercial_building'
  | 'office'
  | 'shopping_area'
  | 'airport'
  | 'long_duration'
  | 'event';

export type VehicleRestriction = 'two_wheeler' | 'hatchback' | 'sedan' | 'suv' | 'ev' | 'commercial';

export type CancellationPolicyType = 'flexible' | 'moderate' | 'strict';

export type CustomerVehicleType =
  | 'electric_car'
  | 'petrol_car'
  | 'diesel_car'
  | 'hybrid_car'
  | 'electric_two_wheeler'
  | 'petrol_two_wheeler'
  | 'electric_three_wheeler'
  | 'other';

export type PowertrainType = 'electric' | 'petrol' | 'diesel' | 'hybrid' | 'other';

export type ChargerType = 'AC' | 'DC' | 'DC_Fast';

export type ConnectorType =
  | 'Type 2'
  | 'CCS2'
  | 'CHAdeMO'
  | 'GB/T'
  | '15A 3-Pin'
  | 'Bharat AC-001'
  | 'Bharat DC-001'
  | string;

export type ChargingPricingModel = 'per_kwh' | 'per_hour' | 'flat_session' | 'parking_plus_charging';

export type BookingStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'disputed';

export type ChargingSessionStatus = 'scheduled' | 'plugged_in' | 'charging' | 'completed' | 'stopped';

export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';

export type PayoutStatus =
  | 'pending'
  | 'eligible'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'on_hold'
  | 'reversed';

export type LedgerEntryType =
  | 'booking_earning'
  | 'platform_commission'
  | 'refund_debit'
  | 'payout_disbursement'
  | 'adjustment';

export type PayoutMethod = 'razorpay_route' | 'manual_bank_transfer';

export type HangoutCategory =
  | 'cafe'
  | 'restaurant'
  | 'mall'
  | 'gaming_zone'
  | 'park'
  | 'shopping'
  | 'coworking'
  | 'cinema'
  | 'tourist_attraction';

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
}

export interface PayoutConfiguration {
  accountHolderName: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  payoutMethod: PayoutMethod;
  razorpayContactId?: string;
  razorpayFundAccountId?: string;
}

// Canonical Provider Interface (Section 5)
export interface IProvider {
  _id: string;
  authUserId: string; // reference to Supabase or Auth user
  providerType: ProviderType;
  displayName: string;
  email: string;
  phone: string;
  profileImage?: string;
  verificationStatus: ProviderVerificationStatus;
  businessName?: string;
  address: Address;
  serviceAreas: string[];
  serviceTypes: ServiceType[];
  payoutAccountStatus: 'unconfigured' | 'pending_verification' | 'active' | 'suspended';
  payoutConfiguration?: PayoutConfiguration;
  // Provider Totals (Derived reporting data)
  totalParkingBookings: number;
  totalChargingSessions: number;
  totalCompletedBookings: number;
  totalCancelledBookings: number;
  grossRevenue: number; // in paise
  platformCommission: number; // in paise
  refundTotal: number; // in paise
  netEarnings: number; // in paise
  pendingPayoutAmount: number; // in paise
  paidOutAmount: number; // in paise
  lastPayoutDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IParkingSpace {
  _id: string;
  listingId: string;
  providerId: string;
  spaceIdentifier: string; // e.g. "Slot A-14"
  dimensions?: { lengthMeters: number; widthMeters: number; heightMeters: number };
  vehicleRestrictions: VehicleRestriction[];
  isCovered: boolean;
  isAttachedToCharger: boolean;
  attachedChargingPortId?: string;
  status: 'available' | 'maintenance' | 'occupied' | 'inactive';
}

export interface IVehicle {
  _id: string;
  userId: string;
  vehicleType: CustomerVehicleType;
  powertrain: PowertrainType;
  manufacturer: string;
  model: string;
  registrationNumber?: string;
  supportedConnectorTypes: ConnectorType[];
  maxAcPowerKw?: number;
  maxDcPowerKw?: number;
  batteryCapacityKwh?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IChargingStation {
  _id: string;
  listingId: string;
  providerId: string;
  stationName: string;
  manufacturer?: string;
  model?: string;
  chargerType: ChargerType;
  ratedPowerKw: number;
  totalPorts: number;
  status: 'operational' | 'maintenance' | 'offline';
  createdAt: string;
  updatedAt: string;
}

export interface IChargingPort {
  _id: string;
  listingId: string;
  providerId: string;
  stationId?: string;
  portIdentifier: string; // e.g. "Gun #1"
  chargerType: ChargerType;
  connectorType: ConnectorType;
  powerKw: number;
  ratedPowerKw?: number;
  chargerManufacturer?: string;
  chargerModel?: string;
  pricingModel: ChargingPricingModel;
  pricePerUnitPaise: number; // paise per kWh or per hour or flat
  attachedParkingSpaceId?: string;
  isParkingIncluded?: boolean;
  requiresSimultaneousParking?: boolean;
  operatingHours?: string;
  status: 'available' | 'charging' | 'offline' | 'maintenance';
}

export interface IListingPricing {
  hourlyRatePaise: number;
  dailyRatePaise?: number;
  overnightRatePaise?: number;
  monthlyRatePaise?: number;
  chargingRatePerKwhPaise?: number;
  chargingFlatRatePaise?: number;
}

export interface IListing {
  _id: string;
  providerId: string;
  title: string;
  description: string;
  serviceType: ServiceType;
  parkingType?: ParkingType;
  address: Address;
  location: GeoLocation;
  amenities: string[];
  photos: string[];
  pricing: IListingPricing;
  cancellationPolicy: CancellationPolicyType;
  instantBooking: boolean;
  entryExitInstructions?: string;
  houseRules?: string[];
  isCovered?: boolean;
  isParkingIncluded?: boolean;
  requiresSimultaneousParking?: boolean;
  status: ListingStatus;
  averageRating: number;
  reviewCount: number;
  chargingPorts?: IChargingPort[];
  chargingStations?: IChargingStation[];
  parkingSpaces?: IParkingSpace[];
  createdAt: string;
  updatedAt: string;
}

export interface IPricingBreakdown {
  baseAmountPaise: number;
  chargingAmountPaise?: number;
  platformCommissionPaise: number;
  gstPaise: number;
  totalAmountPaise: number; // Customer pays this
  providerSharePaise: number; // baseAmount - commission
}

export interface IBooking {
  _id: string;
  bookingNumber: string;
  customerId: string;
  providerId: string;
  listingId: string;
  serviceType: ServiceType;
  parkingSpaceId?: string;
  chargingPortId?: string;
  vehicleId?: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  status: BookingStatus;
  pricing: IPricingBreakdown;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  accessPin?: string;
  vehicleDetails?: {
    licensePlate?: string;
    model: string;
    type?: string;
    manufacturer?: string;
    powertrain?: string;
    connectorType?: string;
  };
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IChargingSession {
  _id: string;
  sessionId: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  chargingPortId: string;
  startTime: string;
  endTime?: string;
  initialKwh?: number;
  finalKwh?: number;
  totalKwhConsumed?: number;
  unitRatePaise: number;
  totalChargePaise: number;
  status: ChargingSessionStatus;
  providerVerifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayment {
  _id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: PaymentStatus;
  method?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFinancialLedger {
  _id: string;
  providerId: string;
  bookingId?: string;
  chargingSessionId?: string;
  paymentId?: string;
  entryType: LedgerEntryType;
  grossAmountPaise: number;
  platformCommissionPaise: number;
  netPayablePaise: number;
  eligibilityTimestamp: string; // Next calendar day target cutoff
  targetPayoutDate: string; // e.g. "YYYY-MM-DD"
  status: PayoutStatus;
  payoutId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayout {
  _id: string;
  providerId: string;
  amountPaise: number;
  currency: string;
  targetPayoutDate: string;
  status: PayoutStatus;
  payoutMethod: PayoutMethod;
  payoutReference?: string;
  ledgerEntryIds: string[];
  processedAt?: string;
  processedByAdminId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRefund {
  _id: string;
  paymentId: string;
  bookingId: string;
  amountPaise: number;
  reason: string;
  razorpayRefundId?: string;
  status: 'pending' | 'processed' | 'failed';
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IHangoutPlace {
  id: string;
  name: string;
  category: HangoutCategory;
  distanceMeters: number;
  walkingMinutes: number;
  drivingMinutes: number;
  address: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  websiteUrl?: string;
  mapDirectionsUrl: string;
  imageUrl?: string;
}

export interface IWaitlistEntry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  vehicleModel?: string;
  interestedIn: 'valet_parking' | 'valet_charging' | 'fleet_services';
  notes?: string;
  createdAt: string;
}

export interface IAdminAuditLog {
  _id: string;
  adminId: string;
  action: string;
  targetCollection: string;
  targetId: string;
  reason?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}
