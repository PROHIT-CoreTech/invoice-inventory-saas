import { Schema, model, Document } from 'mongoose';
import { Client } from '../types';

export interface ClientDocument extends Omit<Client, 'id'>, Document {}

export const ClientSchema = new Schema<ClientDocument>({
  name: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  billingAddress: { type: String, required: true },
  taxId: { type: String, required: true },
  gstin: { type: String },
  pan: { type: String },
}, { timestamps: true });

export const ClientModel = model<ClientDocument>('Client', ClientSchema);
export default ClientModel;
