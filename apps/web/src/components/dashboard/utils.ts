import { TenantProfile, DocumentData } from './types';
import { type Quotation, type ProformaInvoice, type FinalInvoice } from '@procash-invoices/database';

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  return 'http://localhost:5001/api';
};

export const getPlanLabel = (planId: string | undefined | null): string => {
  switch (planId) {
    case 'TRIAL': return '10-Day Free Trial';
    case '1_MONTH': return 'Monthly Starter';
    case '6_MONTHS': return '6 Months Pro';
    case '1_YEAR': return '1 Year Enterprise';
    case 'LIFETIME': return 'Lifetime Unlimited';
    case 'FREE': return 'Free Tier';
    default: return 'Free Tier';
  }
};

export const getPlanPriceNum = (planId: string, dynamicPlansMap: Record<string, any> = {}): number => {
  if (dynamicPlansMap[planId]) {
    const p = dynamicPlansMap[planId];
    return p.effectivePrice ?? p.regularPrice;
  }
  switch (planId) {
    case '1_MONTH': return 1499;
    case '6_MONTHS': return 4999;
    case '1_YEAR': return 9999;
    case 'LIFETIME': return 20000;
    case 'TRIAL': return 0;
    case 'FREE': return 0;
    default: return 1499;
  }
};

export const getPlanPrice = (planId: string | undefined | null, dynamicPlansMap: Record<string, any> = {}): string => {
  if (!planId) return '₹0';
  const num = getPlanPriceNum(planId, dynamicPlansMap);
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '₹0.00';
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDateTime = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};

export const formatDate = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
};

export const getFinancialYear = (date: Date = new Date()): string => {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth(); // 0-indexed, April is 3
  const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${String(endYear).padStart(2, '0')}`;
};

export const getRenewalUpiUrl = (tenantProfile: TenantProfile | null, targetPlan: string, dynamicPlansMap: Record<string, any> = {}): string => {
  if (!tenantProfile) return '';
  const formattedTenant = tenantProfile.tenantId.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const planId = targetPlan || tenantProfile.subscriptionPlan || '1_MONTH';
  
  let planCode = 'MON';
  if (planId === '6_MONTHS') planCode = 'PRO';
  else if (planId === '1_YEAR') planCode = 'ENT';
  else if (planId === 'LIFETIME') planCode = 'LIF';
  else if (planId === 'TRIAL') planCode = 'TRL';

  const tn = `SUB-${planCode}-${formattedTenant}`.substring(0, 35);
  const amount = getPlanPriceNum(planId, dynamicPlansMap);
  
  return `upi://pay?pa=rohitbarge22-3@okaxis&pn=ROHIT%20BARGE&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(tn)}`;
};

export const getRenewalUpiNote = (tenantProfile: TenantProfile | null, targetPlan: string): string => {
  if (!tenantProfile) return '';
  const formattedTenant = tenantProfile.tenantId.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const planId = targetPlan || tenantProfile.subscriptionPlan || '1_MONTH';
  let planCode = 'MON';
  if (planId === '6_MONTHS') planCode = 'PRO';
  else if (planId === '1_YEAR') planCode = 'ENT';
  else if (planId === 'LIFETIME') planCode = 'LIF';
  else if (planId === 'TRIAL') planCode = 'TRL';
  return `SUB-${planCode}-${formattedTenant}`.substring(0, 35);
};

export const getDocumentData = (doc: Quotation | ProformaInvoice | FinalInvoice, tenantProfile: TenantProfile | null): DocumentData => {
  return {
    documentType: doc.documentType as any,
    documentNumber: doc.documentNumber || (doc as any).quoteNumber || (doc as any).proformaNumber || (doc as any).invoiceNumber || '',
    issueDate: doc.issueDate,
    dueDate: (doc as any).dueDate,
    validUntil: (doc as any).validUntil,
    clientInfo: {
      name: doc.clientInfo?.name || '',
      email: doc.clientInfo?.email,
      billingAddress: doc.clientInfo?.billingAddress,
      billingAndShippingAddress: doc.clientInfo?.billingAddress,
      gstin: doc.clientInfo?.gstin,
      stateName: (doc.clientInfo as any)?.stateName || 'Maharashtra',
      stateCode: (doc.clientInfo as any)?.stateCode || '27',
    },
    items: (doc.items || []).map(item => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      taxRate: item.taxRate,
      hsnSac: (item as any).hsnSac || '998311',
      per: (item as any).per || 'nos',
      discountPercent: (item as any).discountPercent || 0,
    })),
    notes: doc.notes,
    currency: doc.currency,
    applyGst: (doc as any).applyGst !== false,
    logoUrl: tenantProfile?.logoUrl || (doc as any).logoUrl || `${window.location.origin}/images/hero.png`,
    tenantProfile: tenantProfile || undefined,
  };
};

export const isToday = (dateStr?: Date | string): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};
