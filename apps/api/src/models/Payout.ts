import mongoose, { Schema, Document } from 'mongoose';
import { IPayout, PayoutStatus, PayoutMethod } from '@vflow/shared';

export interface IPayoutDocument extends Omit<IPayout, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayoutDocument>(
  {
    providerId: { type: String, required: true, index: true },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    targetPayoutDate: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'eligible', 'processing', 'paid', 'failed', 'on_hold', 'reversed'],
      default: 'pending',
      index: true
    },
    payoutMethod: {
      type: String,
      enum: ['razorpay_route', 'manual_bank_transfer'],
      required: true
    },
    payoutReference: { type: String },
    ledgerEntryIds: [{ type: String }],
    processedAt: { type: String },
    processedByAdminId: { type: String },
    failureReason: { type: String }
  },
  { timestamps: true }
);

PayoutSchema.index({ providerId: 1, createdAt: -1 });

export const PayoutModel = mongoose.model<IPayoutDocument>('Payout', PayoutSchema);
