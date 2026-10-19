import mongoose, { Schema, Document } from 'mongoose';
import { IVehicle, CustomerVehicleType, PowertrainType, ConnectorType } from '@vflow/shared';

export interface IVehicleDocument extends Omit<Document, 'model'>, Omit<IVehicle, '_id' | 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicleDocument>(
  {
    userId: { type: String, required: true, index: true },
    vehicleType: {
      type: String,
      enum: [
        'electric_car',
        'petrol_car',
        'diesel_car',
        'hybrid_car',
        'electric_two_wheeler',
        'petrol_two_wheeler',
        'electric_three_wheeler',
        'other',
      ],
      required: true,
      index: true,
    },
    powertrain: {
      type: String,
      enum: ['electric', 'petrol', 'diesel', 'hybrid', 'other'],
      required: true,
      index: true,
    },
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    registrationNumber: { type: String }, // Optional where possible
    supportedConnectorTypes: {
      type: [String],
      default: [],
    },
    maxAcPowerKw: { type: Number, min: 0 },
    maxDcPowerKw: { type: Number, min: 0 },
    batteryCapacityKwh: { type: Number, min: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

VehicleSchema.index({ userId: 1, isDefault: 1 });

export const VehicleModel = mongoose.model<IVehicleDocument>('Vehicle', VehicleSchema);
