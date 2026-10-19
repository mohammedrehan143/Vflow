import mongoose, { Schema, Document } from 'mongoose';
import { IListing, ListingStatus, ParkingType, ServiceType, CancellationPolicyType } from '@vflow/shared';

export interface IListingDocument extends Omit<IListing, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2,
        message: 'Coordinates must be [longitude, latitude]'
      }
    }
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    landmark: { type: String }
  },
  { _id: false }
);

const PricingSchema = new Schema(
  {
    hourlyRatePaise: { type: Number, required: true, min: 0 },
    dailyRatePaise: { type: Number, min: 0 },
    overnightRatePaise: { type: Number, min: 0 },
    monthlyRatePaise: { type: Number, min: 0 },
    chargingRatePerKwhPaise: { type: Number, min: 0 },
    chargingFlatRatePaise: { type: Number, min: 0 }
  },
  { _id: false }
);

const ListingSchema = new Schema<IListingDocument>(
  {
    providerId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    serviceType: {
      type: String,
      enum: ['parking', 'charging', 'combined'],
      required: true,
      index: true
    },
    parkingType: {
      type: String,
      enum: [
        'home',
        'residential_apartment',
        'commercial_building',
        'office',
        'shopping_area',
        'airport',
        'long_duration',
        'event'
      ],
      index: true
    },
    address: { type: AddressSchema, required: true },
    location: { type: LocationSchema, required: true },
    amenities: [{ type: String }],
    photos: [{ type: String }],
    pricing: { type: PricingSchema, required: true },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'flexible'
    },
    instantBooking: { type: Boolean, default: true },
    entryExitInstructions: { type: String },
    houseRules: [{ type: String }],
    isCovered: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'active', 'suspended'],
      default: 'active',
      index: true
    },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 2dsphere index for geospatial searches (finding parking & EV charging near coordinates)
ListingSchema.index({ location: '2dsphere' });
ListingSchema.index({ 'address.city': 1, status: 1 });

export const ListingModel = mongoose.model<IListingDocument>('Listing', ListingSchema);
