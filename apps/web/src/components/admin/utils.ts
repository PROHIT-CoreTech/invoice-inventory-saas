import { Tenant, SubscriptionPlanConfig } from './types';

export const getPlanLabel = (planId?: string): string => {
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

export const getPlanPrice = (
  planId?: string,
  subscriptionPlans: SubscriptionPlanConfig[] = [],
  subscriptionAmount?: number | null
): string => {
  if (typeof subscriptionAmount === 'number') {
    return `₹${subscriptionAmount.toLocaleString('en-IN')}`;
  }
  if (!planId || planId === 'FREE' || planId === 'TRIAL') return '₹0';
  
  const planConfig = subscriptionPlans.find(p => p.planId === planId);
  if (planConfig) {
    const priceNum = typeof planConfig.effectivePrice === 'number'
      ? planConfig.effectivePrice
      : (typeof planConfig.regularPrice === 'number'
        ? planConfig.regularPrice
        : (parseFloat(String(planConfig.effectivePrice || planConfig.regularPrice || 0)) || 0));
    return `₹${priceNum.toLocaleString('en-IN')}`;
  }

  switch (planId) {
    case '1_MONTH': return '₹1,499';
    case '6_MONTHS': return '₹4,999';
    case '1_YEAR': return '₹9,999';
    case 'LIFETIME': return '₹20,000';
    default: return '₹0';
  }
};

export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const getEffectiveStatus = (t: Tenant): string => {
  const rawStatus = t.subscriptionStatus || 'INACTIVE';
  if (rawStatus === 'ACTIVE' && t.subscriptionExpiresAt) {
    if (new Date() > new Date(t.subscriptionExpiresAt)) {
      return 'EXPIRED';
    }
  }
  return rawStatus;
};

export const getTenantUrl = (tenantId: string): string => {
  const currentHost = window.location.host;
  const currentProtocol = window.location.protocol;
  if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${currentProtocol}//${tenantId}.localhost${port}`;
  }
  return `${currentProtocol}//${tenantId}.${currentHost}`;
};
