import React from 'react';
import { TenantProfile } from './types';
import { getPlanLabel, getPlanPrice, getPlanPriceNum, formatDateTime } from './utils';

interface SubscriptionSectionProps {
  tenantProfile: TenantProfile | null;
  dynamicPlansMap: Record<string, any>;
  onOpenRenewal: () => void;
  onOpenSettings: () => void;
  onSelectPlan: (planId: string) => void;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  tenantProfile,
  dynamicPlansMap,
  onOpenRenewal,
  onOpenSettings,
  onSelectPlan
}) => {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* Subscription Banner / Title */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            👑 Workspace Subscription & Billing Details
          </h2>
          <p style={{ margin: '0.35rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Comprehensive overview of your active plan, expiration timeline, and workspace tier settings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onOpenRenewal}
            style={{
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)'
            }}
          >
            ⚡ Renew / Upgrade Subscription
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            ⚙️ Workspace Profile
          </button>
        </div>
      </div>

      {/* Subscription KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="stat-header">
            <span>Active Plan</span>
            <span style={{ color: '#4f46e5', fontWeight: 700 }}>
              {getPlanPrice(tenantProfile?.subscriptionPlan || 'FREE', dynamicPlansMap, tenantProfile?.subscriptionAmount)}
            </span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem' }}>
            {getPlanLabel(tenantProfile?.subscriptionPlan || 'FREE')}
          </div>
          <div className="stat-footer">Billing Plan Tier</div>
        </div>

        <div className="stat-card" style={{ borderLeft: tenantProfile?.subscriptionStatus === 'EXPIRED' ? '4px solid #ef4444' : '4px solid #10b981' }}>
          <div className="stat-header">
            <span>Subscription Status</span>
            <span style={{ color: tenantProfile?.subscriptionStatus === 'EXPIRED' ? '#dc2626' : '#059669', fontWeight: 700 }}>
              {tenantProfile?.subscriptionStatus === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE'}
            </span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem', color: tenantProfile?.subscriptionStatus === 'EXPIRED' ? '#dc2626' : '#059669' }}>
            {tenantProfile?.subscriptionStatus === 'EXPIRED' ? 'Read-Only Mode' : 'Full Access'}
          </div>
          <div className="stat-footer">Current workspace state</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-header">
            <span>Expiration Date</span>
            <span style={{ color: '#d97706', fontWeight: 700 }}>Timeline</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            {tenantProfile?.subscriptionPlan === 'LIFETIME' ? 'Never (Lifetime)' : (tenantProfile?.subscriptionPlan === 'FREE' ? 'N/A' : formatDateTime(tenantProfile?.subscriptionExpiresAt))}
          </div>
          <div className="stat-footer">
            {tenantProfile?.subscriptionPlan === 'LIFETIME' 
              ? 'Unlimited validity' 
              : (tenantProfile?.subscriptionExpiresAt ? `${Math.max(0, Math.ceil((new Date(tenantProfile.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days Remaining` : 'Free Tier')}
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #a855f7' }}>
          <div className="stat-header">
            <span>Subdomain Workspace</span>
            <span style={{ color: '#7e22ce', fontWeight: 700 }}>Multi-Tenant</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: '#7e22ce' }}>
            {tenantProfile?.tenantId || 'default'}
          </div>
          <div className="stat-footer">Subdomain identifier</div>
        </div>
      </div>

      {/* Account Details & Feature Entitlements Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Account Profile Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
            🏢 Tenant Account Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Company Name:</span>
              <strong style={{ color: '#0f172a' }}>{tenantProfile?.companyName || 'Not Set'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Proprietor:</span>
              <span style={{ color: '#334155' }}>{tenantProfile?.proprietorName || 'Not Set'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>GSTIN / Tax ID:</span>
              <span style={{ color: '#334155', fontFamily: 'monospace' }}>{tenantProfile?.gstin || 'None'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>PAN Number:</span>
              <span style={{ color: '#334155', fontFamily: 'monospace' }}>{tenantProfile?.pan || 'None'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Primary Theme:</span>
              <span style={{ color: '#4f46e5', fontWeight: 600 }}>{tenantProfile?.theme || 'DEFAULT'}</span>
            </div>
          </div>
        </div>

        {/* Plan Entitlements Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
            🚀 Plan Features & Entitlements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
            <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span> <span style={{ color: '#334155' }}>Unlimited Quotation & Proforma Generation</span>
            </div>
            <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span> <span style={{ color: '#334155' }}>Final Invoices & Advance Payment Tracking</span>
            </div>
            <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span> <span style={{ color: '#334155' }}>Client Ledger Statements & Transaction History</span>
            </div>
            <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span> <span style={{ color: '#334155' }}>Instant Excel Report & CSV Data Exports</span>
            </div>
            <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span> <span style={{ color: '#334155' }}>WhatsApp & Email One-Click Invoice Sharing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Subscription Plan Options */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          💳 Select or Change Subscription Plan
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { 
              id: '1_MONTH', 
              name: dynamicPlansMap['1_MONTH']?.name || 'Monthly Starter', 
              price: `₹${getPlanPriceNum('1_MONTH', dynamicPlansMap).toLocaleString('en-IN')}`, 
              period: 'per month', 
              badge: dynamicPlansMap['1_MONTH']?.isOfferActive ? `🔥 ${dynamicPlansMap['1_MONTH']?.offerBadge || 'OFFER'}` : 'Popular' 
            },
            { 
              id: '6_MONTHS', 
              name: dynamicPlansMap['6_MONTHS']?.name || '6 Months Pro', 
              price: `₹${getPlanPriceNum('6_MONTHS', dynamicPlansMap).toLocaleString('en-IN')}`, 
              period: `for 6 months (₹${(dynamicPlansMap['6_MONTHS']?.monthlyEquivalentPrice || Math.round(getPlanPriceNum('6_MONTHS', dynamicPlansMap) / 6)).toLocaleString('en-IN')}/mo)`, 
              badge: dynamicPlansMap['6_MONTHS']?.isOfferActive ? `🔥 ${dynamicPlansMap['6_MONTHS']?.offerBadge || 'OFFER'}` : `Save ${dynamicPlansMap['6_MONTHS']?.savingsVsMonthlyPercentage || 44}%` 
            },
            { 
              id: '1_YEAR', 
              name: dynamicPlansMap['1_YEAR']?.name || '1 Year Enterprise', 
              price: `₹${getPlanPriceNum('1_YEAR', dynamicPlansMap).toLocaleString('en-IN')}`, 
              period: `per year (₹${(dynamicPlansMap['1_YEAR']?.monthlyEquivalentPrice || Math.round(getPlanPriceNum('1_YEAR', dynamicPlansMap) / 12)).toLocaleString('en-IN')}/mo)`, 
              badge: dynamicPlansMap['1_YEAR']?.isOfferActive ? `🔥 ${dynamicPlansMap['1_YEAR']?.offerBadge || 'OFFER'}` : `Best Value (Save ${dynamicPlansMap['1_YEAR']?.savingsVsMonthlyPercentage || 44}%)` 
            },
            { 
              id: 'LIFETIME', 
              name: dynamicPlansMap['LIFETIME']?.name || 'Lifetime Unlimited', 
              price: `₹${getPlanPriceNum('LIFETIME', dynamicPlansMap).toLocaleString('en-IN')}`, 
              period: 'one-time lifetime', 
              badge: dynamicPlansMap['LIFETIME']?.isOfferActive ? `🔥 ${dynamicPlansMap['LIFETIME']?.offerBadge || 'OFFER'}` : 'VIP Access' 
            }
          ]
          .filter(plan => {
            const planData = dynamicPlansMap[plan.id];
            const isCurrent = (tenantProfile?.subscriptionPlan || '1_MONTH') === plan.id;
            if (isCurrent) return true;
            if (!planData || planData.isActive === false) return false;
            return true;
          })
          .map((plan) => {
            const isCurrent = (tenantProfile?.subscriptionPlan || '1_MONTH') === plan.id;
            return (
              <div
                key={plan.id}
                style={{
                  backgroundColor: isCurrent ? '#f4f4ff' : '#f8fafc',
                  border: isCurrent ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                {isCurrent && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '12px',
                    backgroundColor: '#4f46e5',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '10px',
                    textTransform: 'uppercase'
                  }}>
                    Current Plan
                  </span>
                )}
                <div>
                  <span style={{ color: '#4f46e5', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{plan.badge}</span>
                  <div style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem' }}>{plan.name}</div>
                  <div style={{ color: '#059669', fontSize: '1.35rem', fontWeight: 900, fontFamily: 'monospace', margin: '0.35rem 0' }}>{plan.price}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{plan.period}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  style={{
                    backgroundColor: isCurrent ? '#059669' : '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    padding: '0.55rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                >
                  {isCurrent ? '🔄 Renew Current Plan' : `⚡ Select & Upgrade`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
