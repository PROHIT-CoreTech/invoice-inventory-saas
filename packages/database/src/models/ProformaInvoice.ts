import { Schema, model, Document } from 'mongoose';
import { ProformaInvoice } from '../types';
import { LineItemSchema } from './Quotation';

export interface ProformaInvoiceDocument extends Omit<ProformaInvoice, 'id'>, Document {}

const ProformaInvoiceSchema = new Schema<ProformaInvoiceDocument>({
  proformaNumber: { type: String, required: true, unique: true },
  quotationRef: { type: Schema.Types.ObjectId, ref: 'Quotation' },
  validUntil: { type: Date, required: true },
  status: { type: String, enum: ['DRAFT', 'SENT', 'CONVERTED', 'EXPIRED'], default: 'DRAFT' },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientAddress: { type: String },
  items: [LineItemSchema],
  subTotal: { type: Number, required: true, default: 0 },
  taxAmount: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  currency: { type: String, required: true, default: 'USD' },
  notes: { type: String },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
}, { timestamps: true });

export const ProformaInvoiceModel = model<ProformaInvoiceDocument>('ProformaInvoice', ProformaInvoiceSchema);
export default ProformaInvoiceModel;
