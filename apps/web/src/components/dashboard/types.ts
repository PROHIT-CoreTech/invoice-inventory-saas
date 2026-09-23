import { type Quotation, type ProformaInvoice, type FinalInvoice } from '@procash-invoices/database';

export interface TenantProfile {
  id?: string;
  tenantId: string;
  companyName: string;
  logoUrl?: string;
  proprietorName?: string;
  address: string;
  gstin?: string;
  pan?: string;
  bankName?: string;
  bankAccHolder?: string;
  bankAccType?: string;
  bankAccNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  signatureUrl?: string;
  theme?: string;
  tier?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  billingAddress?: string;
  shippingAddress?: string;
  gstin?: string;
  pan?: string;
  taxId?: string;
}

export interface DocumentItem {
  description: string;
  quantity: number | undefined;
  price: number;
  taxRate: number;
  hsnSac?: string;
  per?: string;
  discountPercent?: number;
}

export interface DocumentData {
  documentType: 'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE';
  documentNumber: string;
  issueDate: string | Date;
  dueDate?: string | Date;
  validUntil?: string | Date;
  clientInfo: {
    name: string;
    email?: string;
    billingAddress?: string;
    billingAndShippingAddress?: string;
    gstin?: string;
    stateName?: string;
    stateCode?: string;
  };
  items: DocumentItem[];
  notes?: string;
  currency?: string;
  applyGst?: boolean;
  logoUrl?: string;
  tenantProfile?: TenantProfile;
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  invoiceId?: string;
  amount: number;
  type: 'PAYMENT_RECEIVED' | 'ADVANCE_PAYMENT' | 'REFUND';
  paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface ClientLedger {
  client: Client;
  totalInvoiced: number;
  totalPaid: number;
  balanceDue: number;
  invoices: FinalInvoice[];
  payments: PaymentRecord[];
}

export type ViewMode = 'daily' | 'history' | 'ledger' | 'subscription';
