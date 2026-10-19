import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  listingId: string;
  bookingId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    listingId: { type: String, required: true, index: true },
    bookingId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const ReviewModel = mongoose.model<IReviewDocument>('Review', ReviewSchema);
