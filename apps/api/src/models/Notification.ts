import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'payout' | 'session' | 'system';
  isRead: boolean;
  linkUrl?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking', 'payment', 'payout', 'session', 'system'],
      default: 'system'
    },
    isRead: { type: Boolean, default: false, index: true },
    linkUrl: { type: String }
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
