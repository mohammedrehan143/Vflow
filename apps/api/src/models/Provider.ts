import mongoose, { Schema, Document } from 'mongoose';
import { IProvider, ProviderType, ProviderVerificationStatus, ServiceType } from '@vflow/shared';

export interface IProviderDocument extends Omit<IProvider, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    landmark: { type: String }
  },
  { _id: false }
);

const PayoutConfigurationSchema = new Schema(
  {
    accountHolderName: { type: String, required: true },
    bankAccountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String },
    payoutMethod: {
      type: String,
      enum: ['razorpay_route', 'manual_bank_transfer'],
      default: 'manual_bank_transfer'
    },
    razorpayContactId: { type: String },
    razorpayFundAccountId: { type: String }
  },
  { _id: false }
);

const ProviderSchema = new Schema<IProviderDocument>(
  {
    authUserId: { type: String, required: true, unique: true, index: true },
    providerType: {
      type: String,
      enum: ['individual', 'business', 'parking_operator', 'ev_operator'],
      required: true
    },
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    profileImage: { type: String },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
      index: true
    },
    businessName: { type: String },
    address: { type: AddressSchema, required: true },
    serviceAreas: [{ type: String, required: true }],
    serviceTypes: [
      {
        type: String,
        enum: ['parking', 'charging', 'combined'],
        required: true
      }
    ],
    payoutAccountStatus: {
      type: String,
      enum: ['unconfigured', 'pending_verification', 'active', 'suspended'],
      default: 'unconfigured'
    },
    payoutConfiguration: { type: PayoutConfigurationSchema },

    // Financial & Booking Aggregates (in integer paise)
    totalParkingBookings: { type: Number, default: 0 },
    totalChargingSessions: { type: Number, default: 0 },
    totalCompletedBookings: { type: Number, default: 0 },
    totalCancelledBookings: { type: Number, default: 0 },
    grossRevenue: { type: Number, default: 0 },
    platformCommission: { type: Number, default: 0 },
    refundTotal: { type: Number, default: 0 },
    netEarnings: { type: Number, default: 0 },
    pendingPayoutAmount: { type: Number, default: 0 },
    paidOutAmount: { type: Number, default: 0 },
    lastPayoutDate: { type: String }
  },
  { timestamps: true }
);

export const ProviderModel = mongoose.model<IProviderDocument>('Provider', ProviderSchema);
