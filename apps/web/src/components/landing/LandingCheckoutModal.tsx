import React from 'react';

interface LandingCheckoutModalProps {
  showCheckoutModal: boolean;
  selectedPlan: { id: string; name: string; price: number } | null;
  setSelectedPlan: (plan: { id: string; name: string; price: number }) => void;
  checkoutStep: 'STEP1' | 'STEP2' | 'STEP3_PAYMENT';
  setCheckoutStep: (step: 'STEP1' | 'STEP2' | 'STEP3_PAYMENT') => void;
  checkoutForm: {
    tenant: string;
    companyName: string;
    name: string;
    email: string;
    phone: string;
    gstin: string;
    pan: string;
    bankName: string;
    bankAccHolder: string;
    bankAccNumber: string;
    bankIfsc: string;
  };
  setCheckoutForm: React.Dispatch<React.SetStateAction<any>>;
  paymentLoading: boolean;
  paymentStatusMessage: string;
  setPaymentStatusMessage: (msg: string) => void;
  utrNumber: string;
  setUtrNumber: (utr: string) => void;
  dynamicPlans: Record<string, any>;
  getSuffix: () => string;
  getUpiUrl: () => string;
  getUpiNote: () => string;
  onClose: () => void;
  onStep1Next: (e: React.FormEvent) => void;
  onStep2Next: (e: React.FormEvent) => void;
  onUtrSubmit: (e: React.FormEvent) => void;
}

export const LandingCheckoutModal: React.FC<LandingCheckoutModalProps> = ({
  showCheckoutModal,
  selectedPlan,
  setSelectedPlan,
  checkoutStep,
  setCheckoutStep,
  checkoutForm,
  setCheckoutForm,
  paymentLoading,
  paymentStatusMessage,
  setPaymentStatusMessage,
  utrNumber,
  setUtrNumber,
  dynamicPlans,
  getSuffix,
  getUpiUrl,
  getUpiNote,
  onClose,
  onStep1Next,
  onStep2Next,
  onUtrSubmit
}) => {
  if (!showCheckoutModal || !selectedPlan) return null;

  return (
    <div
      className="checkout-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(7, 10, 19, 0.85)',
        backdropFilter: 'blur(16px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}
    >
      <div
        className="onboarding-modal-card"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          width: '100%',
          maxWidth: checkoutStep === 'STEP3_PAYMENT' ? '820px' : '560px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          boxSizing: 'border-box',
          textAlign: 'left',
          color: '#0f172a',
          transition: 'max-width 0.3s ease-in-out'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚡</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Subscription Setup & Checkout
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* 3-Step Wizard Progress Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            backgroundColor: '#f8fafc',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: checkoutStep === 'STEP1' ? '#4f46e5' : '#e2e8f0',
                color: checkoutStep === 'STEP1' ? '#fff' : '#64748b',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              1
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: checkoutStep === 'STEP1' ? 700 : 500,
                color: checkoutStep === 'STEP1' ? '#4f46e5' : '#64748b'
              }}
            >
              Subdomain & Profile
            </span>
          </div>

          <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>→</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: checkoutStep === 'STEP2' ? '#4f46e5' : '#e2e8f0',
                color: checkoutStep === 'STEP2' ? '#fff' : '#64748b',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              2
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: checkoutStep === 'STEP2' ? 700 : 500,
                color: checkoutStep === 'STEP2' ? '#4f46e5' : '#64748b'
              }}
            >
              Tax & Bank Credentials
            </span>
          </div>

          <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>→</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: checkoutStep === 'STEP3_PAYMENT' ? '#059669' : '#e2e8f0',
                color: checkoutStep === 'STEP3_PAYMENT' ? '#fff' : '#64748b',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              3
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: checkoutStep === 'STEP3_PAYMENT' ? 700 : 500,
                color: checkoutStep === 'STEP3_PAYMENT' ? '#059669' : '#64748b'
              }}
            >
              QR Payment
            </span>
          </div>
        </div>

        {/* STEP 1 */}
        {checkoutStep === 'STEP1' && (
          <form onSubmit={onStep1Next} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                Workspace Subdomain *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. company-a"
                  value={checkoutForm.tenant}
                  onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, tenant: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                />
                <span style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 700 }}>{getSuffix()}</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Your subscription will be linked to this workspace.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                Company / Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp Invoices"
                value={checkoutForm.companyName}
                onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, companyName: e.target.value }))}
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                Full Name / Proprietor Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={checkoutForm.name}
                onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, name: e.target.value }))}
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, email: e.target.value }))}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9988776655"
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, phone: e.target.value }))}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: 'none',
                color: '#fff',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '0.5rem',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
            >
              Next: Tax & Bank Credentials →
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {checkoutStep === 'STEP2' && (
          <form onSubmit={onStep2Next} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                  GSTIN Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={checkoutForm.gstin}
                  onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                  PAN Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={checkoutForm.pan}
                  onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                Settlement Bank Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank / ICICI Bank"
                value={checkoutForm.bankName}
                onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, bankName: e.target.value }))}
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                  Account Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50100123456789"
                  value={checkoutForm.bankAccNumber}
                  onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, bankAccNumber: e.target.value }))}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                  IFSC Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={checkoutForm.bankIfsc}
                  onChange={(e) => setCheckoutForm((prev: any) => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCheckoutStep('STEP1')}
                style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={paymentLoading}
                style={{ flex: 2, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700, cursor: paymentLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
              >
                {selectedPlan.id === 'TRIAL' ? 'Activate 10-Day Free Trial →' : 'Next: Proceed to QR Payment →'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {checkoutStep === 'STEP3_PAYMENT' && (
          <form onSubmit={onUtrSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.keys(dynamicPlans).length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  SELECT / CHANGE SUBSCRIPTION PLAN:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  {Object.values(dynamicPlans)
                    .filter((p: any) => p && p.isActive !== false)
                    .map((plan: any) => {
                      const isSelected = selectedPlan?.id === plan.planId;
                      const priceNum = typeof plan.effectivePrice === 'number'
                        ? plan.effectivePrice
                        : (typeof plan.regularPrice === 'number'
                          ? plan.regularPrice
                          : (typeof plan.price === 'number' ? plan.price : (parseFloat(plan.effectivePrice || plan.regularPrice || plan.price || 0) || 0)));
                      const durationText = plan.billingCycleMonths
                        ? (plan.billingCycleMonths === 1 ? 'mo' : `${plan.billingCycleMonths} mos`)
                        : (plan.planId === 'LIFETIME' ? 'one-time' : 'period');
                      return (
                        <button
                          key={plan.planId}
                          type="button"
                          onClick={() => setSelectedPlan({ id: plan.planId, name: plan.name, price: priceNum })}
                          style={{
                            backgroundColor: isSelected ? '#4f46e5' : '#f8fafc',
                            border: isSelected ? '2px solid #4338ca' : '1.5px solid #cbd5e1',
                            borderRadius: '10px',
                            padding: '0.65rem 0.85rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none'
                          }}
                        >
                          <div style={{ color: isSelected ? '#ffffff' : '#0f172a', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{plan.name}</span>
                            {isSelected && <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>}
                          </div>
                          <div style={{ color: isSelected ? '#e0e7ff' : '#64748b', fontSize: '0.78rem', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                            ₹{priceNum.toLocaleString('en-IN')} / {durationText}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 100%)', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SELECTED TARGET PLAN</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{selectedPlan?.name || ''}</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669', fontFamily: 'monospace' }}>
                      ₹{(selectedPlan?.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <p style={{ color: '#475569', fontSize: '0.75rem', margin: '0 0 0.65rem 0', fontWeight: 700 }}>
                    Scan via GPay / PhonePe / Paytm / BHIM
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '0.65rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=165x165&margin=4&data=${encodeURIComponent(getUpiUrl())}`}
                        alt="UPI QR Code"
                        style={{ display: 'block', width: '165px', height: '165px' }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem', display: 'block', fontWeight: 500 }}>
                    ⚡ Amount auto-filled in your UPI App
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', textAlign: 'left', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.15)' }}>
                  <div><span style={{ color: '#94a3b8' }}>Payee Name:</span> <strong style={{ color: '#ffffff' }}>ROHIT BARGE</strong></div>
                  <div><span style={{ color: '#94a3b8' }}>VPA Address:</span> <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>rohitbarge22-3@okaxis</strong></div>
                  <div><span style={{ color: '#94a3b8' }}>Amount to Pay:</span> <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>₹{(selectedPlan?.price || 0).toLocaleString('en-IN')}</strong></div>
                  <div><span style={{ color: '#94a3b8' }}>Transaction Note:</span> <strong style={{ color: '#fbbf24', fontFamily: 'monospace', backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{getUpiNote()}</strong></div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                    ENTER 12-DIGIT UPI REF / UTR NUMBER *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="\d{12}"
                    maxLength={12}
                    placeholder="e.g. 123456789012"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').substring(0, 12))}
                    style={{
                      width: '100%',
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      padding: '0.7rem 0.85rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                    Check 12-digit Ref / UTR code on your UPI payment receipt.
                  </span>
                </div>

                {paymentStatusMessage && (
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem', fontSize: '0.8rem', color: '#0f172a', lineHeight: 1.4 }}>
                    {paymentStatusMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep('STEP2');
                      setPaymentStatusMessage('');
                    }}
                    style={{ flex: 1, backgroundColor: '#ffffff', border: '1.5px solid #cbd5e1', color: '#475569', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    style={{ flex: 2, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#ffffff', padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700, cursor: paymentLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)', opacity: paymentLoading ? 0.7 : 1 }}
                  >
                    {paymentLoading ? 'Submitting...' : 'Submit Payment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
