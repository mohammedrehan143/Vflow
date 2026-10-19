import mongoose, { Schema, Document } from 'mongoose';
import { IPayment, PaymentStatus } from '@vflow/shared';

export interface IPaymentDocument extends Omit<IPayment, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    bookingId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    providerId: { type: String, required: true, index: true },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, sparse: true, index: true },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true
    },
    method: { type: String },
    failureReason: { type: String }
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
