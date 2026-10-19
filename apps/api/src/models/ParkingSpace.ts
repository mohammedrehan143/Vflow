import mongoose, { Schema, Document } from 'mongoose';
import { IParkingSpace, VehicleRestriction } from '@vflow/shared';

export interface IParkingSpaceDocument extends Omit<IParkingSpace, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ParkingSpaceSchema = new Schema<IParkingSpaceDocument>(
  {
    listingId: { type: String, required: true, index: true },
    providerId: { type: String, required: true, index: true },
    spaceIdentifier: { type: String, required: true },
    dimensions: {
      lengthMeters: { type: Number },
      widthMeters: { type: Number },
      heightMeters: { type: Number }
    },
    vehicleRestrictions: [
      {
        type: String,
        enum: ['two_wheeler', 'hatchback', 'sedan', 'suv', 'ev', 'commercial']
      }
    ],
    isCovered: { type: Boolean, default: false },
    isAttachedToCharger: { type: Boolean, default: false },
    attachedChargingPortId: { type: String },
    status: {
      type: String,
      enum: ['available', 'maintenance', 'occupied', 'inactive'],
      default: 'available',
      index: true
    }
  },
  { timestamps: true }
);

ParkingSpaceSchema.index({ listingId: 1, status: 1 });

export const ParkingSpaceModel = mongoose.model<IParkingSpaceDocument>('ParkingSpace', ParkingSpaceSchema);
