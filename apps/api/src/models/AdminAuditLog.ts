import mongoose, { Schema, Document } from 'mongoose';
import { IAdminAuditLog } from '@vflow/shared';

export interface IAdminAuditLogDocument extends Omit<IAdminAuditLog, '_id' | 'createdAt'>, Document {
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLogDocument>(
  {
    adminId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    targetCollection: { type: String, required: true },
    targetId: { type: String, required: true },
    reason: { type: String },
    changes: { type: Schema.Types.Mixed },
    ipAddress: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AdminAuditLogSchema.index({ targetCollection: 1, targetId: 1 });
AdminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLogModel = mongoose.model<IAdminAuditLogDocument>(
  'AdminAuditLog',
  AdminAuditLogSchema
);
