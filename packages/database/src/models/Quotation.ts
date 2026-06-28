import { Schema, model, Document } from 'mongoose';
import { Quotation, LineItem } from '../types';

export const LineItemSchema = new Schema<LineItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },
});

export interface QuotationDocument extends Omit<Quotation, 'id'>, Document {}

const QuotationSchema = new Schema<QuotationDocument>({
  quoteNumber: { type: String, required: true, unique: true },
  validUntil: { type: Date, required: true },
  status: { type: String, enum: ['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED'], default: 'DRAFT' },
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

export const QuotationModel = model<QuotationDocument>('Quotation', QuotationSchema);
export default QuotationModel;
