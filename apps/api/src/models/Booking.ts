import mongoose, { Schema, Document } from 'mongoose';
import { IBooking, BookingStatus, ServiceType, PaymentStatus } from '@vflow/shared';

export interface IBookingDocument extends Omit<IBooking, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const PricingBreakdownSchema = new Schema(
  {
    baseAmountPaise: { type: Number, required: true },
    chargingAmountPaise: { type: Number, default: 0 },
    platformCommissionPaise: { type: Number, required: true },
    gstPaise: { type: Number, default: 0 },
    totalAmountPaise: { type: Number, required: true },
    providerSharePaise: { type: Number, required: true },
  },
  { _id: false }
);

const VehicleDetailsSchema = new Schema(
  {
    licensePlate: { type: String },
    model: { type: String, required: true },
    type: { type: String },
    manufacturer: { type: String },
    powertrain: { type: String },
    connectorType: { type: String },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBookingDocument>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    providerId: { type: String, required: true, index: true },
    listingId: { type: String, required: true, index: true },
    serviceType: {
      type: String,
      enum: ['parking', 'charging', 'combined'],
      required: true,
    },
    parkingSpaceId: { type: String, index: true },
    chargingPortId: { type: String, index: true },
    vehicleId: { type: String, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'draft',
        'pending_payment',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'expired',
        'disputed',
      ],
      default: 'pending_payment',
      index: true,
    },
    pricing: { type: PricingBreakdownSchema, required: true },
    paymentId: { type: String, index: true },
    paymentStatus: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    accessPin: { type: String },
    vehicleDetails: { type: VehicleDetailsSchema },
    cancellationReason: { type: String },
    cancelledAt: { type: String },
  },
  { timestamps: true }
);

// Concurrency & lookup indexes
BookingSchema.index({ listingId: 1, parkingSpaceId: 1, startTime: 1, endTime: 1, status: 1 });
BookingSchema.index({ listingId: 1, chargingPortId: 1, startTime: 1, endTime: 1, status: 1 });
BookingSchema.index({ providerId: 1, status: 1, createdAt: -1 });
BookingSchema.index({ customerId: 1, createdAt: -1 });

export const BookingModel = mongoose.model<IBookingDocument>('Booking', BookingSchema);
