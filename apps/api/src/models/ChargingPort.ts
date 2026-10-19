import mongoose, { Schema, Document } from 'mongoose';
import { IChargingPort, ChargerType, ConnectorType, ChargingPricingModel } from '@vflow/shared';

export interface IChargingPortDocument extends Omit<IChargingPort, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ChargingPortSchema = new Schema<IChargingPortDocument>(
  {
    listingId: { type: String, required: true, index: true },
    providerId: { type: String, required: true, index: true },
    stationId: { type: String, index: true },
    portIdentifier: { type: String, required: true },
    chargerType: {
      type: String,
      enum: ['AC', 'DC', 'DC_Fast'],
      required: true,
    },
    connectorType: {
      type: String,
      required: true,
      index: true,
    },
    powerKw: { type: Number, required: true, min: 1 },
    ratedPowerKw: { type: Number },
    chargerManufacturer: { type: String },
    chargerModel: { type: String },
    pricingModel: {
      type: String,
      enum: ['per_kwh', 'per_hour', 'flat_session', 'parking_plus_charging'],
      required: true,
    },
    pricePerUnitPaise: { type: Number, required: true, min: 0 },
    attachedParkingSpaceId: { type: String },
    isParkingIncluded: { type: Boolean, default: false },
    requiresSimultaneousParking: { type: Boolean, default: false },
    operatingHours: { type: String },
    status: {
      type: String,
      enum: ['available', 'charging', 'offline', 'maintenance'],
      default: 'available',
      index: true,
    },
  },
  { timestamps: true }
);

ChargingPortSchema.index({ listingId: 1, status: 1 });
ChargingPortSchema.index({ connectorType: 1, powerKw: 1 });

export const ChargingPortModel = mongoose.model<IChargingPortDocument>('ChargingPort', ChargingPortSchema);
