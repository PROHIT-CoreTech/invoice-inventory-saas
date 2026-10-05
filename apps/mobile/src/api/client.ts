import axios from 'axios';
import { getApiBaseUrl } from './config';

let currentTenantId: string = 'cfs-enterprise'; // Default fallback workspace

export const setTenantId = (tenantId: string) => {
  currentTenantId = tenantId;
};

export const getTenantId = () => currentTenantId;

const getClient = () => {
  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': currentTenantId,
    },
  });
};

// OTP Authentication APIs
export const sendOtp = async (phone: string) => {
  const res = await getClient().post('/auth/send-otp', { phone });
  return res.data;
};

export const verifyOtp = async (phone: string, otp: string) => {
  const res = await getClient().post('/auth/verify-otp', { phone, otp });
  if (res.data?.user?.tenantId) {
    setTenantId(res.data.user.tenantId);
  }
  return res.data;
};

export interface ClientData {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  companyName?: string;
}

export interface LineItem {
  description: string;
  hsnCode?: string;
  quantity?: number;
  rate: number;
  discountPercent?: number;
  gstRate?: number;
  amount: number;
}

export interface DocumentData {
  _id?: string;
  documentNumber: string;
  documentType: 'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE';
  client: ClientData | string;
  items: LineItem[];
  subtotal: number;
  totalDiscount: number;
  totalGst: number;
  grandTotal: number;
  status?: string;
  isPaid?: boolean;
  notes?: string;
  date?: string;
  dueDate?: string;
  convertedFromId?: string;
}

// Health check API connection
export const checkApiHealth = async () => {
  try {
    const res = await getClient().get('/health');
    return res.data?.status === 'OK';
  } catch {
    return false;
  }
};

// Quotations API
export const fetchQuotations = async (): Promise<DocumentData[]> => {
  const res = await getClient().get('/quotations');
  return res.data;
};

export const createQuotation = async (data: Partial<DocumentData>): Promise<DocumentData> => {
  const res = await getClient().post('/quotations', data);
  return res.data;
};

export const deleteQuotation = async (id: string) => {
  const res = await getClient().delete(`/quotations/${id}`);
  return res.data;
};

// Proforma Invoices API
export const fetchProformas = async (): Promise<DocumentData[]> => {
  const res = await getClient().get('/proforma-invoices');
  return res.data;
};

export const createProforma = async (data: Partial<DocumentData>): Promise<DocumentData> => {
  const res = await getClient().post('/proforma-invoices', data);
  return res.data;
};

export const deleteProforma = async (id: string) => {
  const res = await getClient().delete(`/proforma-invoices/${id}`);
  return res.data;
};

// Final Invoices API
export const fetchFinalInvoices = async (): Promise<DocumentData[]> => {
  const res = await getClient().get('/final-invoices');
  return res.data;
};

export const createFinalInvoice = async (data: Partial<DocumentData>): Promise<DocumentData> => {
  const res = await getClient().post('/final-invoices', data);
  return res.data;
};

export const markInvoicePaid = async (id: string): Promise<DocumentData> => {
  const res = await getClient().put(`/final-invoices/${id}/mark-paid`);
  return res.data;
};

export const deleteFinalInvoice = async (id: string) => {
  const res = await getClient().delete(`/final-invoices/${id}`);
  return res.data;
};

// Clients API
export const fetchClients = async (): Promise<ClientData[]> => {
  const res = await getClient().get('/clients');
  return res.data;
};

export const createClient = async (data: ClientData): Promise<ClientData> => {
  const res = await getClient().post('/clients', data);
  return res.data;
};

// Conversion Flow APIs
export const convertQuotationToProforma = async (quotationId: string): Promise<DocumentData> => {
  const res = await getClient().post('/convert/quotation-to-proforma', { quotationId });
  return res.data;
};

export const convertProformaToFinal = async (proformaId: string): Promise<DocumentData> => {
  const res = await getClient().post('/convert/proforma-to-final', { proformaId });
  return res.data;
};

export const convertQuotationToFinalDirect = async (quotationId: string): Promise<DocumentData> => {
  const res = await getClient().post('/convert/quotation-to-final', { quotationId });
  return res.data;
};
