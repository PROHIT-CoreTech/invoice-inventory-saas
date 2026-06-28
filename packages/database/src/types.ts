export interface Client {
  id?: string;
  name: string;
  email: string;
  billingAddress: string;
  taxId: string;
  gstin?: string;
  pan?: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  price: number;
  taxRate: number; // Percentage, e.g. 18 for 18%
  taxAmount: number; // (Price * Quantity) * (TaxRate / 100)
  total: number; // (Price * Quantity) + TaxAmount
}

export interface BaseDocument {
  id?: string;
  clientRef: string; // ObjectId referencing the master Client
  clientInfo: Omit<Client, 'id'>; // Snapshot profile for historical consistency
  items: LineItem[];
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  issueDate: Date | string;
  dueDate: Date | string;
}

export type BillingDocumentType = 'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE';

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'CONVERTED' | 'EXPIRED';
export type ProformaStatus = 'DRAFT' | 'SENT' | 'CONVERTED' | 'EXPIRED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'VOID' | 'OVERDUE';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface Invoice extends BaseDocument {
  documentType: BillingDocumentType;
  documentNumber: string;
  status: QuotationStatus | ProformaStatus | InvoiceStatus;
  
  // Tracing fields
  quotationRef?: string; // Tracks source quote if converted to proforma or invoice
  proformaRef?: string;  // Tracks source proforma if converted to invoice
  
  // Type-specific optional fields
  validUntil?: Date | string; // For Quotation and Proforma Invoice
  paymentStatus?: PaymentStatus; // For Final Invoice
  paymentDate?: Date | string; // For Final Invoice
}
