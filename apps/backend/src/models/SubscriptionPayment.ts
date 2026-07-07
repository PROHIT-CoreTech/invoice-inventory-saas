import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionPayment extends Document {
  tenantId: string;
  planTier: string;
  amountPaid: number;
  utrNumber: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: Date;
}

const SubscriptionPaymentSchema: Schema = new Schema({
  tenantId: { type: String, required: true },
  planTier: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  utrNumber: { type: String, required: true, unique: true },
  verificationStatus: { type: String, required: true, default: 'PENDING' },
  submittedAt: { type: Date, required: true, default: Date.now }
});

export default mongoose.models.SubscriptionPayment || mongoose.model<ISubscriptionPayment>('SubscriptionPayment', SubscriptionPaymentSchema);
