import mongoose, { Schema, Document } from 'mongoose';
import { IFinancialLedger, LedgerEntryType, PayoutStatus } from '@vflow/shared';

export interface IFinancialLedgerDocument extends Omit<IFinancialLedger, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const FinancialLedgerSchema = new Schema<IFinancialLedgerDocument>(
  {
    providerId: { type: String, required: true, index: true },
    bookingId: { type: String, index: true },
    chargingSessionId: { type: String, index: true },
    paymentId: { type: String, index: true },
    entryType: {
      type: String,
      enum: ['booking_earning', 'platform_commission', 'refund_debit', 'payout_disbursement', 'adjustment'],
      required: true
    },
    grossAmountPaise: { type: Number, required: true },
    platformCommissionPaise: { type: Number, required: true },
    netPayablePaise: { type: Number, required: true },
    eligibilityTimestamp: { type: String, required: true }, // Next-day cutoff ISO string
    targetPayoutDate: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    status: {
      type: String,
      enum: ['pending', 'eligible', 'processing', 'paid', 'failed', 'on_hold', 'reversed'],
      default: 'pending',
      index: true
    },
    payoutId: { type: String, index: true },
    notes: { type: String }
  },
  { timestamps: true }
);

// Indexes for settlement queries and provider earnings calculations
FinancialLedgerSchema.index({ providerId: 1, status: 1, targetPayoutDate: 1 });
FinancialLedgerSchema.index({ status: 1, targetPayoutDate: 1 });

export const FinancialLedgerModel = mongoose.model<IFinancialLedgerDocument>(
  'FinancialLedger',
  FinancialLedgerSchema
);
