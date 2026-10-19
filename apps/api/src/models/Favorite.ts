import mongoose, { Schema, Document } from 'mongoose';

export interface IFavoriteDocument extends Document {
  userId: string;
  listingId: string;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavoriteDocument>(
  {
    userId: { type: String, required: true, index: true },
    listingId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

export const FavoriteModel = mongoose.model<IFavoriteDocument>('Favorite', FavoriteSchema);
