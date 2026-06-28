import { Schema, model, Document } from 'mongoose';
import { FinalInvoice } from '../types';
import { LineItemSchema } from './Quotation';

export interface FinalInvoiceDocument extends Omit<FinalInvoice, 'id'>, Document {}

const FinalInvoiceSchema = new Schema<FinalInvoiceDocument>({
  invoiceNumber: { type: String, required: true, unique: true },
  proformaRef: { type: Schema.Types.ObjectId, ref: 'ProformaInvoice' },
  status: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'VOID', 'OVERDUE'], default: 'DRAFT' },
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'], default: 'UNPAID' },
  paymentDate: { type: Date },
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

export const FinalInvoiceModel = model<FinalInvoiceDocument>('FinalInvoice', FinalInvoiceSchema);
export default FinalInvoiceModel;
