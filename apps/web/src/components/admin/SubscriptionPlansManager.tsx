import React from 'react';
import { SubscriptionPlanConfig } from './types';
import { formatDate as defaultFormatDate } from './utils';

interface SubscriptionPlansManagerProps {
  subscriptionPlans: SubscriptionPlanConfig[];
  formatDate?: (dateStr?: string | null) => string;
  actionLoadingId: string | null;
  onOpenEditPlan: (plan: SubscriptionPlanConfig) => void;
  onApplyFuturePrice: (planId: string) => void;
  onClearOffer: (planId: string) => void;
}

export const SubscriptionPlansManager: React.FC<SubscriptionPlansManagerProps> = ({
  subscriptionPlans,
  formatDate = defaultFormatDate,
  actionLoadingId,
  onOpenEditPlan,
  onApplyFuturePrice,
  onClearOffer
}) => {
  const activeOffersCount = subscriptionPlans.filter(p => p.isOfferActive).length;
  const scheduledCount = subscriptionPlans.filter(p => p.futurePrice !== null && p.futurePrice !== undefined).length;
  const uniquePlans = subscriptionPlans.filter((plan, index, self) => self.findIndex(p => p.planId === plan.planId) === index);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            🏷️ Subscription Charges & Promotional Offers Management
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Set current promotional prices, offer discount badges, or schedule upcoming future price updates with effective dates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
            🔥 Active Offers: {activeOffersCount}
          </span>
          <span style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
            🗓️ Scheduled Changes: {scheduledCount}
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {uniquePlans.map((plan) => {
          const isOfferActive = plan.isOfferActive;
          const hasFuturePrice = plan.futurePrice !== null && plan.futurePrice !== undefined;
          return (
            <div
              key={plan.id || plan.planId}
              style={{
                backgroundColor: '#ffffff',
                border: isOfferActive ? '2px solid #10b981' : hasFuturePrice ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                position: 'relative'
              }}
            >
              <div>
                {/* Top Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '20px',
                      backgroundColor: plan.isActive === false ? '#fef2f2' : isOfferActive ? '#d1fae5' : '#f1f5f9',
                      color: plan.isActive === false ? '#991b1b' : isOfferActive ? '#065f46' : '#475569',
                      border: plan.isActive === false ? '1px solid #fecaca' : isOfferActive ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
                    }}
                  >
                    {plan.isActive === false ? '🚫 DISABLED / HIDDEN' : isOfferActive ? '🔥 PROMO OFFER ACTIVE' : '⚡ STANDARD PRICING'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>
                    ID: {plan.planId}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {plan.name}
                </h4>
                <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.825rem', minHeight: '36px' }}>
                  {plan.description || 'No description provided.'}
                </p>

                {/* Price Section */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Current Effective Price
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {isOfferActive && (
                      <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: '#94a3b8', fontWeight: 600 }}>
                        ₹{plan.regularPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span style={{ fontSize: '1.85rem', fontWeight: 900, color: isOfferActive ? '#059669' : '#4f46e5' }}>
                      ₹{(plan.effectivePrice ?? plan.regularPrice).toLocaleString('en-IN')}
                    </span>
                    {plan.billingCycleMonths && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        / {plan.billingCycleMonths} {plan.billingCycleMonths === 1 ? 'month' : 'months'}
                      </span>
                    )}
                    {!plan.billingCycleMonths && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {plan.planId === 'LIFETIME' ? 'one-time lifetime' : 'free trial'}
                      </span>
                    )}
                  </div>

                  {isOfferActive && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          SAVE {plan.savingsPercentage}% (₹{plan.savingsAmount?.toLocaleString('en-IN')})
                        </span>
                        {plan.offerBadge && (
                          <span style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            🏷️ {plan.offerBadge}
                          </span>
                        )}
                      </div>
                      {(plan.offerStartDate || plan.offerEndDate) && (
                        <div style={{ fontSize: '0.725rem', color: '#047857', fontWeight: 600, marginTop: '0.15rem' }}>
                          📅 Validity: {plan.offerStartDate ? formatDate(plan.offerStartDate) : 'Now'} to {plan.offerEndDate ? formatDate(plan.offerEndDate) : 'Ongoing'}
                        </div>
                      )}
                    </div>
                  )}

                  {plan.planId !== '1_MONTH' && plan.planId !== 'TRIAL' && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                          💡 Vs Monthly Plan (₹1,499/mo)
                        </span>
                        {plan.monthlyEquivalentPrice !== null && plan.monthlyEquivalentPrice !== undefined && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', backgroundColor: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            ₹{plan.monthlyEquivalentPrice.toLocaleString('en-IN')}/mo
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', marginTop: '0.1rem' }}>
                        {plan.comparedToMonthlyText || (
                          plan.billingCycleMonths ? (
                            `Save ${plan.savingsVsMonthlyPercentage || 44}% (₹${(plan.savingsVsMonthlyAmount || (1499 * plan.billingCycleMonths - (plan.effectivePrice ?? plan.regularPrice))).toLocaleString('en-IN')}) vs Monthly Starter`
                          ) : 'Pays for itself in ~17 months (Zero recurring fees)'
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {hasFuturePrice && (
                  <div
                    style={{
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fcd34d',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>🗓️ Scheduled Future Price Update</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400e', marginTop: '0.2rem' }}>
                      Future Price: ₹{plan.futurePrice?.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#78350f', marginTop: '0.15rem' }}>
                      Takes effect on: {plan.futurePriceEffectiveDate ? formatDate(plan.futurePriceEffectiveDate) : 'Immediate next cycle'}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => onOpenEditPlan(plan)}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)'
                  }}
                >
                  ✏️ Edit Pricing & Offer
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {hasFuturePrice && (
                    <button
                      type="button"
                      disabled={actionLoadingId === plan.planId}
                      onClick={() => onApplyFuturePrice(plan.planId)}
                      style={{
                        flex: 1,
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      🚀 Apply Future Price Now
                    </button>
                  )}

                  {isOfferActive && (
                    <button
                      type="button"
                      disabled={actionLoadingId === plan.planId}
                      onClick={() => onClearOffer(plan.planId)}
                      style={{
                        flex: 1,
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Clear Offer
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
