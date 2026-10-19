import { z } from 'zod';

export const UserRegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  role: z.enum(['customer', 'provider', 'admin']).default('customer')
});

export const UserLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const AddressSchema = z.object({
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().default('India'),
  landmark: z.string().optional()
});

export const PayoutConfigurationSchema = z.object({
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  bankAccountNumber: z.string().min(8, 'Bank account number is required').optional(),
  ifscCode: z.string().min(4, 'IFSC code is required').optional(),
  upiId: z.string().optional(),
  payoutMethod: z.enum(['razorpay_route', 'manual_bank_transfer']).default('manual_bank_transfer')
});

export const ProviderRegistrationSchema = z.object({
  providerType: z.enum(['individual', 'business', 'parking_operator', 'ev_operator']),
  displayName: z.string().min(2, 'Display name is required'),
  email: z.string().email(),
  phone: z.string().min(10),
  businessName: z.string().optional(),
  address: AddressSchema,
  serviceAreas: z.array(z.string()).min(1, 'Select at least one service area/city'),
  serviceTypes: z.array(z.enum(['parking', 'charging', 'combined'])).min(1, 'Select at least one service type'),
  payoutConfiguration: PayoutConfigurationSchema.optional()
});

export const ListingPricingSchema = z.object({
  hourlyRatePaise: z.number().nonnegative(),
  dailyRatePaise: z.number().nonnegative().optional(),
  overnightRatePaise: z.number().nonnegative().optional(),
  monthlyRatePaise: z.number().nonnegative().optional(),
  chargingRatePerKwhPaise: z.number().nonnegative().optional(),
  chargingFlatRatePaise: z.number().nonnegative().optional()
});

export const CreateVehicleSchema = z.object({
  vehicleType: z.enum([
    'electric_car',
    'petrol_car',
    'diesel_car',
    'hybrid_car',
    'electric_two_wheeler',
    'petrol_two_wheeler',
    'electric_three_wheeler',
    'other'
  ]),
  powertrain: z.enum(['electric', 'petrol', 'diesel', 'hybrid', 'other']),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  registrationNumber: z.string().optional(),
  supportedConnectorTypes: z.array(z.string()).default([]),
  maxAcPowerKw: z.number().nonnegative().optional(),
  maxDcPowerKw: z.number().nonnegative().optional(),
  batteryCapacityKwh: z.number().nonnegative().optional(),
  isDefault: z.boolean().default(false)
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial();

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

export const RoleSelectionSchema = z.object({
  role: z.enum(['customer', 'provider'])
});

export const CreateListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(15, 'Description must be at least 15 characters'),
  serviceType: z.enum(['parking', 'charging', 'combined']),
  parkingType: z.enum([
    'home',
    'residential_apartment',
    'commercial_building',
    'office',
    'shopping_area',
    'airport',
    'long_duration',
    'event'
  ]).optional(),
  address: AddressSchema,
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]) // [lng, lat]
  }),
  amenities: z.array(z.string()).default([]),
  photos: z.array(z.string()).default([]),
  pricing: ListingPricingSchema,
  cancellationPolicy: z.enum(['flexible', 'moderate', 'strict']).default('flexible'),
  instantBooking: z.boolean().default(true),
  entryExitInstructions: z.string().optional(),
  houseRules: z.array(z.string()).optional(),
  isCovered: z.boolean().default(false),
  isParkingIncluded: z.boolean().optional(),
  requiresSimultaneousParking: z.boolean().optional(),
  // Explicit resources setup
  parkingSpacesCount: z.number().int().min(0).default(1),
  chargingStations: z.array(z.object({
    stationName: z.string(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    chargerType: z.enum(['AC', 'DC', 'DC_Fast']),
    ratedPowerKw: z.number().positive(),
    totalPorts: z.number().int().min(1).default(1),
    status: z.enum(['operational', 'maintenance', 'offline']).default('operational')
  })).optional(),
  chargingPorts: z.array(z.object({
    portIdentifier: z.string(),
    chargerType: z.enum(['AC', 'DC', 'DC_Fast']),
    connectorType: z.string(),
    powerKw: z.number().positive(),
    pricingModel: z.enum(['per_kwh', 'per_hour', 'flat_session', 'parking_plus_charging']),
    pricePerUnitPaise: z.number().nonnegative(),
    chargerManufacturer: z.string().optional(),
    chargerModel: z.string().optional(),
    isParkingIncluded: z.boolean().optional(),
    requiresSimultaneousParking: z.boolean().optional(),
    operatingHours: z.string().optional()
  })).optional()
});

export const CreateBookingSchema = z.object({
  listingId: z.string(),
  serviceType: z.enum(['parking', 'charging', 'combined']),
  parkingSpaceId: z.string().optional(),
  chargingPortId: z.string().optional(),
  vehicleId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  vehicleDetails: z.object({
    licensePlate: z.string().optional(),
    model: z.string(),
    type: z.string().optional(),
    manufacturer: z.string().optional(),
    powertrain: z.string().optional(),
    connectorType: z.string().optional()
  }).optional()
});

export const VerifyPaymentSchema = z.object({
  bookingId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string()
});

export const WaitlistSubmissionSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  city: z.string().min(2, 'City is required'),
  vehicleModel: z.string().optional(),
  interestedIn: z.enum(['valet_parking', 'valet_charging', 'fleet_services']).default('valet_parking'),
  notes: z.string().optional()
});

export const ReviewSubmissionSchema = z.object({
  listingId: z.string(),
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, 'Review comment must be at least 3 characters')
});

export const NearbySearchQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radiusKm: z.coerce.number().default(3),
  category: z.string().optional()
});
