import mongoose, { Schema, Document } from 'mongoose';
import { IWaitlistEntry } from '@vflow/shared';

export interface IWaitlistEntryDocument extends Omit<IWaitlistEntry, '_id' | 'createdAt'>, Document {
  createdAt: Date;
}

const WaitlistEntrySchema = new Schema<IWaitlistEntryDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    vehicleModel: { type: String },
    interestedIn: {
      type: String,
      enum: ['valet_parking', 'valet_charging', 'fleet_services'],
      default: 'valet_parking'
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export const WaitlistEntryModel = mongoose.model<IWaitlistEntryDocument>(
  'WaitlistEntry',
  WaitlistEntrySchema
);
