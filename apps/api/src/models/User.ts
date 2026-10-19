import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@vflow/shared';

export interface IUserDocument extends Document {
  supabaseId?: string;
  email: string;
  passwordHash?: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  emailVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  vehicles: Array<{
    licensePlate: string;
    model: string;
    type: 'two_wheeler' | 'hatchback' | 'sedan' | 'suv' | 'ev' | 'commercial';
    isDefault?: boolean;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    supabaseId: { type: String, sparse: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer',
      index: true,
    },
    profileImage: { type: String },
    emailVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    vehicles: [
      {
        licensePlate: { type: String, required: true },
        model: { type: String, required: true },
        type: {
          type: String,
          enum: ['two_wheeler', 'hatchback', 'sedan', 'suv', 'ev', 'commercial'],
          default: 'sedan',
        },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
