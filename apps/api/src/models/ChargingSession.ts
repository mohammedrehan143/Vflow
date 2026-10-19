import mongoose, { Schema, Document } from 'mongoose';
import { IChargingSession, ChargingSessionStatus } from '@vflow/shared';

export interface IChargingSessionDocument extends Omit<IChargingSession, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ChargingSessionSchema = new Schema<IChargingSessionDocument>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, index: true },
    providerId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    chargingPortId: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    initialKwh: { type: Number },
    finalKwh: { type: Number },
    totalKwhConsumed: { type: Number, default: 0 },
    unitRatePaise: { type: Number, required: true },
    totalChargePaise: { type: Number, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'plugged_in', 'charging', 'completed', 'stopped'],
      default: 'scheduled',
      index: true
    },
    providerVerifiedBy: { type: String }
  },
  { timestamps: true }
);

ChargingSessionSchema.index({ providerId: 1, createdAt: -1 });
ChargingSessionSchema.index({ customerId: 1, createdAt: -1 });

export const ChargingSessionModel = mongoose.model<IChargingSessionDocument>('ChargingSession', ChargingSessionSchema);
