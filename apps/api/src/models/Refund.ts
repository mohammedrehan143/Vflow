import mongoose, { Schema, Document } from 'mongoose';
import { IRefund } from '@vflow/shared';

export interface IRefundDocument extends Omit<IRefund, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefundDocument>(
  {
    paymentId: { type: String, required: true, index: true },
    bookingId: { type: String, required: true, index: true },
    amountPaise: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
    razorpayRefundId: { type: String, sparse: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
      index: true
    },
    processedAt: { type: String }
  },
  { timestamps: true }
);

export const RefundModel = mongoose.model<IRefundDocument>('Refund', RefundSchema);
