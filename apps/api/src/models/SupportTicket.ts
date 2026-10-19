import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicketDocument extends Document {
  ticketNumber: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'booking' | 'payment' | 'host_issue' | 'charger_malfunction' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicketDocument>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ['booking', 'payment', 'host_issue', 'charger_malfunction', 'general'],
      default: 'general'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  { timestamps: true }
);

export const SupportTicketModel = mongoose.model<ISupportTicketDocument>(
  'SupportTicket',
  SupportTicketSchema
);
