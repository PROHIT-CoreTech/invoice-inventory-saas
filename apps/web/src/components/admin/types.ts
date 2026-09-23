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
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
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
