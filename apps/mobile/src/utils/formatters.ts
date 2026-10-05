// Indian Currency Formatter
export const formatINR = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Calculate Indian Financial Year (e.g., Apr 2026 -> 2026-27)
export const getCurrentFinancialYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  if (month >= 4) {
    const nextYearSuffix = String(year + 1).slice(-2);
    return `${year}-${nextYearSuffix}`;
  } else {
    const currentYearSuffix = String(year).slice(-2);
    return `${year - 1}-${currentYearSuffix}`;
  }
};

// Auto-generate Document Number Format: FY/CFS-PREFIX-001
export const generateDocumentNumber = (
  type: 'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE',
  existingCount: number = 0
): string => {
  const fy = getCurrentFinancialYear();
  const seq = String(existingCount + 1).padStart(3, '0');
  
  let prefix = 'QT';
  if (type === 'PROFORMA') prefix = 'PRO';
  if (type === 'FINAL_INVOICE') prefix = 'INV';

  return `${fy}/CFS-${prefix}-${seq}`;
};
