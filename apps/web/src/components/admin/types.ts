export interface Tenant {
  id: string;
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
  subscriptionAmount?: number | null;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionHistoryRecord {
  id: string;
  tenantId: string;
  planId: string;
  planName: string;
  amount: number;
  paymentStatus: string;
  paymentMode?: string;
  utrNumber?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  mrr: number;
  activePayingCount: number;
  freeTrialCount: number;
  arpu: number;
  revenueByPlan: {
    planId: string;
    planName: string;
    totalAmount: number;
    count: number;
  }[];
  subscriptionLogs: SubscriptionHistoryRecord[];
}

export interface SubscriptionPlanConfig {
  id: string;
  planId: string;
  name: string;
  description?: string;
  regularPrice: number;
  offerPrice?: number | null;
  offerBadge?: string | null;
  offerStartDate?: string | null;
  offerEndDate?: string | null;
  futurePrice?: number | null;
  futurePriceEffectiveDate?: string | null;
  isActive: boolean;
  billingCycleMonths?: number | null;
  effectivePrice?: number;
  isOfferActive?: boolean;
  savingsAmount?: number;
  savingsPercentage?: number;
  monthlyEquivalentPrice?: number | null;
  savingsVsMonthlyAmount?: number;
  savingsVsMonthlyPercentage?: number;
  comparedToMonthlyText?: string;
  isBestValue?: boolean;
}

export interface PendingPayment {
  id: string;
  tenantId: string;
  planTier: string;
  amountPaid: number;
  utrNumber: string;
  verificationStatus: string;
  submittedAt: string;
}
