import React from 'react';

interface LandingPricingProps {
  dynamicPlans: Record<string, any>;
  onOpenCheckout: (planId: string, planName: string, price: number) => void;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(21, 28, 47, 0.45)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '18px',
  padding: '2rem',
  cursor: 'default',
  textAlign: 'left'
};

const pricingBtnStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#fff',
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
          color: '#fff',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em'
        }}
      >
        Flexible Plans for Fast-Growing Teams
      </h2>
      <p
        style={{
          color: '#94a3b8',
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
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.4)';
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
                      border: isOffer ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)',
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
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>1 Month Plan</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: isOffer ? '#34d399' : '#94a3b8',
                            backgroundColor: isOffer ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.06)',
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
                          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#34d399' : '#fff' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ month</span>
                        </div>
                        {isOffer && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                            Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <li>✓ Full Quotation & Billing Engine</li>
                        <li>✓ Auto CGST / SGST Splitting</li>
                        <li>✓ Custom Branding & Signature</li>
                        <li>✓ Subdomain Isolation</li>
                        <li>✓ PDF Export & Print Templates</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCheckout('1_MONTH', plan.name || '1 Month Plan', price)}
                      style={pricingBtnStyle}
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
                      border: isOffer ? '1px solid #10b981' : '1px solid rgba(99, 102, 241, 0.4)',
                      position: 'relative',
                      backgroundColor: 'rgba(21, 28, 47, 0.6)',
                      boxSizing: 'border-box',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '1.5rem',
                        backgroundColor: isOffer ? '#10b981' : '#6366f1',
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
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>6 Months Plan</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#34d399',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
                          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#34d399' : '#fff' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 6 months</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>💡 Just ₹{monthlyEquivalent.toLocaleString('en-IN')}/mo</span>
                          <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>(Save {savingsVsMonthlyPct}% vs Monthly)</span>
                        </div>
                        {isOffer && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                            Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
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
                      style={{ ...pricingBtnStyle, background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
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
                      border: isOffer ? '1px solid #10b981' : '1px solid rgba(251, 146, 60, 0.4)',
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
                        backgroundColor: isOffer ? '#10b981' : '#f97316',
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
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>1 Year Plan</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#fb923c',
                            backgroundColor: 'rgba(251, 146, 60, 0.15)',
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
                          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#34d399' : '#fff' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ year</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#fb923c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>💡 Just ₹{monthlyEquivalent.toLocaleString('en-IN')}/mo</span>
                          <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>(Save {savingsVsMonthlyPct}% vs Monthly)</span>
                        </div>
                        {isOffer && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                            Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <li>✓ <strong>All Pro features included</strong></li>
                        <li>✓ Zero Transaction Limits</li>
                        <li>✓ Advanced Analytics Dashboard</li>
                        <li>✓ Tally & ERP Compliant Exports</li>
                        <li>✓ Premium 24/7 SLA Service</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCheckout('1_YEAR', plan.name || '1 Year Plan', price)}
                      style={{ ...pricingBtnStyle, background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}
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
                      border: isOffer ? '1px solid #10b981' : '1px solid rgba(168, 85, 247, 0.4)',
                      backgroundColor: 'rgba(26, 21, 47, 0.55)',
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
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Lifetime</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#c084fc',
                            backgroundColor: 'rgba(168, 85, 247, 0.2)',
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
                          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#34d399' : '#fff' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ one-time</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>⚡ Pays for itself in ~17 months</span>
                        </div>
                        {isOffer && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                            Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
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
                      style={{ ...pricingBtnStyle, background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
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
