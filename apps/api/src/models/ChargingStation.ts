import mongoose, { Schema, Document } from 'mongoose';
import { IChargingStation, ChargerType } from '@vflow/shared';

export interface IChargingStationDocument extends Omit<Document, 'model'>, Omit<IChargingStation, '_id' | 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

const ChargingStationSchema = new Schema<IChargingStationDocument>(
  {
    listingId: { type: String, required: true, index: true },
    providerId: { type: String, required: true, index: true },
    stationName: { type: String, required: true },
    manufacturer: { type: String },
    model: { type: String },
    chargerType: {
      type: String,
      enum: ['AC', 'DC', 'DC_Fast'],
      required: true,
    },
    ratedPowerKw: { type: Number, required: true, min: 1 },
    totalPorts: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'offline'],
      default: 'operational',
      index: true,
    },
  },
  { timestamps: true }
);

ChargingStationSchema.index({ listingId: 1, providerId: 1 });

export const ChargingStationModel = mongoose.model<IChargingStationDocument>(
  'ChargingStation',
  ChargingStationSchema
);
