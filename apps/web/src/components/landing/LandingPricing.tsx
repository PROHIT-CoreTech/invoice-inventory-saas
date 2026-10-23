import React from 'react';

interface LandingPricingProps {
  dynamicPlans: Record<string, any>;
  onOpenCheckout: (planId: string, planName: string, price: number) => void;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '2rem',
  cursor: 'default',
  textAlign: 'left',
  boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.05)'
};

const pricingBtnStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  color: '#0f172a',
  padding: '0.75rem',
  borderRadius: '10px',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxSizing: 'border-box',
  marginTop: '1.5rem'
};

export const LandingPricing: React.FC<LandingPricingProps> = ({
  dynamicPlans,
  onOpenCheckout
}) => {
  return (
    <section
      id="pricing"
      style={{
        maxWidth: '1200px',
        margin: '6rem auto 4rem auto',
        padding: '0 1rem',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }}
    >
      <h2
        style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em'
        }}
      >
        Flexible Plans for Fast-Growing Teams
      </h2>
      <p
        style={{
          color: '#64748b',
          fontSize: '1.05rem',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem auto',
          lineHeight: 1.6
        }}
      >
        Upgrade your workspace in seconds. All plans feature secure routing, automatic offline capability, and instant client synchronization.
      </p>

      {/* Free Trial CTA Button */}
      <div style={{ marginBottom: '2.5rem' }}>
        <button
          type="button"
          onClick={() => onOpenCheckout('TRIAL', '10-Day Free Trial', 0)}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            padding: '0.85rem 2.5rem',
            borderRadius: '30px',
            fontSize: '1.05rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
          }}
        >
          ⚡ Start 10-Day Free Trial
        </button>
      </div>

      {/* Marquee Pricing Slider */}
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {[1, 2].map((loopIndex) => (
            <React.Fragment key={loopIndex}>
              {/* Plan 1: Monthly Starter */}
              {(() => {
                const plan = dynamicPlans['1_MONTH'];
                if (!plan || plan.isActive === false) return null;
                const isOffer = plan.isOfferActive;
                const price = plan.effectivePrice ?? plan.regularPrice;
                return (
                  <div
                    className="pricing-card marquee-card-item"
                    style={{
                      ...cardStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isOffer ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                      boxSizing: 'border-box',
                      position: 'relative',
                      textAlign: 'left'
                    }}
                  >
                    {isOffer && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '1.5rem',
                          backgroundColor: '#10b981',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '30px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        🔥 {plan.offerBadge || `${plan.savingsPercentage}% OFF`}
                      </div>
                    )}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>1 Month Plan</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: isOffer ? '#059669' : '#475569',
                            backgroundColor: isOffer ? 'rgba(16, 185, 129, 0.12)' : '#f1f5f9',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '30px',
                            fontWeight: 600
                          }}
                        >
                          {isOffer ? `Save ₹${plan.savingsAmount}` : 'Base Rate'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#059669' : '#0f172a' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ month</span>
                        </div>
                        {isOffer && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
                        <li>✓ Full Quotation &amp; Billing Engine</li>
                        <li>✓ Auto CGST / SGST Splitting</li>
                        <li>✓ Custom Branding &amp; Signature</li>
                        <li>✓ Subdomain Isolation</li>
                        <li>✓ PDF Export &amp; Print Templates</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCheckout('1_MONTH', plan.name || '1 Month Plan', price)}
                      style={pricingBtnStyle}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#e2e8f0';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                    >
                      Subscribe Starter
                    </button>
                  </div>
                );
              })()}

              {/* Plan 2: Bi-Annual Pro */}
              {(() => {
                const plan = dynamicPlans['6_MONTHS'];
                if (!plan || plan.isActive === false) return null;
                const isOffer = plan.isOfferActive;
                const price = plan.effectivePrice ?? plan.regularPrice;
                const monthlyEquivalent = plan.monthlyEquivalentPrice || Math.round(price / 6);
                const savingsVsMonthlyPct = plan.savingsVsMonthlyPercentage || 44;
                const savingsAmount = plan.savingsVsMonthlyAmount || (1499 * 6 - price);
                return (
                  <div
                    className="pricing-card marquee-card-item"
                    style={{
                      ...cardStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isOffer ? '1.5px solid #10b981' : '1.5px solid rgba(99, 102, 241, 0.4)',
                      position: 'relative',
                      boxSizing: 'border-box',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '1.5rem',
                        backgroundColor: isOffer ? '#10b981' : '#4f46e5',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '30px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {isOffer ? `🔥 ${plan.offerBadge || 'OFFER'}` : `Save ${savingsVsMonthlyPct}%`}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>6 Months Plan</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#15803d',
                            backgroundColor: '#dcfce7',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '30px',
                            fontWeight: 700
                          }}
                        >
                          Save ₹{savingsAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#059669' : '#0f172a' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 6 months</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>💡 Just ₹{monthlyEquivalent.toLocaleString('en-IN')}/mo</span>
                          <span style={{ opacity: 0.8, fontSize: '0.7rem' }}>(Save {savingsVsMonthlyPct}% vs Monthly)</span>
                        </div>
                        {isOffer && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
                        <li>✓ <strong>All Starter features included</strong></li>
                        <li>✓ Priority Database Syncing</li>
                        <li>✓ Multi-device Workspace Session</li>
                        <li>✓ Premium Document Layouts</li>
                        <li>✓ Dedicated Developer Support</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCheckout('6_MONTHS', plan.name || '6 Months Plan', price)}
                      style={{ ...pricingBtnStyle, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none' }}
                    >
                      Subscribe Pro
                    </button>
                  </div>
                );
              })()}

              {/* Plan 3: Annual Enterprise */}
              {(() => {
                const plan = dynamicPlans['1_YEAR'];
                if (!plan || plan.isActive === false) return null;
                const isOffer = plan.isOfferActive;
                const price = plan.effectivePrice ?? plan.regularPrice;
                const monthlyEquivalent = plan.monthlyEquivalentPrice || Math.round(price / 12);
                const savingsVsMonthlyPct = plan.savingsVsMonthlyPercentage || 44;
                const savingsAmount = plan.savingsVsMonthlyAmount || (1499 * 12 - price);
                return (
                  <div
                    className="pricing-card marquee-card-item"
                    style={{
                      ...cardStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isOffer ? '1.5px solid #10b981' : '1.5px solid rgba(234, 88, 12, 0.4)',
                      boxSizing: 'border-box',
                      position: 'relative',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '1.5rem',
                        backgroundColor: isOffer ? '#10b981' : '#ea580c',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '30px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {isOffer ? `🔥 ${plan.offerBadge || 'OFFER'}` : '🏆 Best Value (Save 44%)'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>1 Year Plan</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#c2410c',
                            backgroundColor: '#ffedd5',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '30px',
                            fontWeight: 700
                          }}
                        >
                          Save ₹{savingsAmount.toLocaleString('en-IN')}/yr
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#059669' : '#0f172a' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ year</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>💡 Just ₹{monthlyEquivalent.toLocaleString('en-IN')}/mo</span>
                          <span style={{ opacity: 0.8, fontSize: '0.7rem' }}>(Save {savingsVsMonthlyPct}% vs Monthly)</span>
                        </div>
                        {isOffer && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
                        <li>✓ <strong>All Pro features included</strong></li>
                        <li>✓ Zero Transaction Limits</li>
                        <li>✓ Advanced Analytics Dashboard</li>
                        <li>✓ Tally &amp; ERP Compliant Exports</li>
                        <li>✓ Premium 24/7 SLA Service</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCheckout('1_YEAR', plan.name || '1 Year Plan', price)}
                      style={{ ...pricingBtnStyle, background: 'linear-gradient(135deg, #ea580c, #c2410c)', color: '#fff', border: 'none' }}
                    >
                      Subscribe Enterprise
                    </button>
                  </div>
                );
              })()}

              {/* Plan 4: Lifetime Unlimited */}
              {(() => {
                const plan = dynamicPlans['LIFETIME'];
                if (!plan || plan.isActive === false) return null;
                const isOffer = plan.isOfferActive;
                const price = plan.effectivePrice ?? plan.regularPrice;
                return (
                  <div
                    className="pricing-card marquee-card-item"
                    style={{
                      ...cardStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isOffer ? '1.5px solid #10b981' : '1.5px solid rgba(168, 85, 247, 0.4)',
                      boxSizing: 'border-box',
                      position: 'relative',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '1.5rem',
                        backgroundColor: isOffer ? '#10b981' : '#a855f7',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '30px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {isOffer ? `🔥 ${plan.offerBadge || 'OFFER'}` : '⚡ Lifetime Deal'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Lifetime</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#7c3aed',
                            backgroundColor: 'rgba(168, 85, 247, 0.12)',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '30px',
                            fontWeight: 700
                          }}
                        >
                          Zero Renewal Fees
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#059669' : '#0f172a' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ one-time</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>⚡ Pays for itself in ~17 months</span>
                        </div>
                        {isOffer && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#475569' }}>
                        <li>✓ <strong>All Enterprise features included</strong></li>
                        <li>✓ Permanent Lifetime License</li>
                        <li>✓ No Recurring Subscriptions</li>
                        <li>✓ Future Platform Updates Free</li>
                        <li>✓ VIP Priority Line Support</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCheckout('LIFETIME', plan.name || 'Lifetime Plan', price)}
                      style={{ ...pricingBtnStyle, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', border: 'none' }}
                    >
                      Go Lifetime Unlimited
                    </button>
                  </div>
                );
              })()}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
