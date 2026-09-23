import React from 'react';
import { TenantProfile } from '../types';
import { getPlanLabel, getPlanPriceNum, getRenewalUpiUrl, getRenewalUpiNote } from '../utils';

interface SubscriptionModalProps {
  tenantProfile: TenantProfile | null;
  selectedPlan: string;
  setSelectedPlan: (planId: string) => void;
  renewalUtr: string;
  setRenewalUtr: (utr: string) => void;
  renewalLoading: boolean;
  renewalStatus: string;
  dynamicPlansMap: Record<string, any>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  tenantProfile,
  selectedPlan,
  setSelectedPlan,
  renewalUtr,
  setRenewalUtr,
  renewalLoading,
  renewalStatus,
  dynamicPlansMap,
  onClose,
  onSubmit
}) => {
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-card" style={{ maxWidth: '780px', padding: '1.5rem', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.85rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚡ Renew or Change Workspace Subscription
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
              Scan QR code via any UPI App & enter the 12-digit UTR reference number for instant verification.
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Plan selector pills across top - 3-Column Horizontal Row */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              SELECT / CHANGE SUBSCRIPTION PLAN:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
              {[
                { id: '1_MONTH', label: dynamicPlansMap['1_MONTH']?.name || 'Monthly Starter', price: `₹${getPlanPriceNum('1_MONTH', dynamicPlansMap).toLocaleString('en-IN')} / mo` },
                { id: '6_MONTHS', label: dynamicPlansMap['6_MONTHS']?.name || '6 Months Pro', price: `₹${getPlanPriceNum('6_MONTHS', dynamicPlansMap).toLocaleString('en-IN')} / 6 mos` },
                { id: '1_YEAR', label: dynamicPlansMap['1_YEAR']?.name || '1 Year Enterprise', price: `₹${getPlanPriceNum('1_YEAR', dynamicPlansMap).toLocaleString('en-IN')} / yr` },
                { id: 'LIFETIME', label: dynamicPlansMap['LIFETIME']?.name || 'Lifetime Unlimited', price: `₹${getPlanPriceNum('LIFETIME', dynamicPlansMap).toLocaleString('en-IN')} one-time` }
              ]
              .filter(plan => {
                const planData = dynamicPlansMap[plan.id];
                const isCurrent = (tenantProfile?.subscriptionPlan || '1_MONTH') === plan.id;
                if (isCurrent) return true;
                if (!planData || planData.isActive === false) return false;
                return true;
              })
              .map((plan) => {
                const isSelected = (selectedPlan || tenantProfile?.subscriptionPlan || '1_MONTH') === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    style={{
                      backgroundColor: isSelected ? '#4f46e5' : '#1e293b',
                      border: isSelected ? '2px solid #6366f1' : '1px solid #334155',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none'
                    }}
                  >
                    <div style={{ color: isSelected ? '#ffffff' : '#f8fafc', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{plan.label}</span>
                      {isSelected && <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>}
                    </div>
                    <div style={{ color: isSelected ? '#e0e7ff' : '#94a3b8', fontSize: '0.78rem', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                      {plan.price}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal 2-Column Side-by-Side Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Selected Plan Banner + Dynamic UPI QR Code */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Selected Target Plan Banner */}
              <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SELECTED TARGET PLAN</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{getPlanLabel(selectedPlan || tenantProfile?.subscriptionPlan || '1_MONTH')}</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>
                    ₹{getPlanPriceNum(selectedPlan || tenantProfile?.subscriptionPlan || '1_MONTH', dynamicPlansMap).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* QR Code Container */}
              <div style={{ textAlign: 'center', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '1rem' }}>
                <p style={{ color: '#cbd5e1', fontSize: '0.75rem', margin: '0 0 0.65rem 0', fontWeight: 700 }}>
                  Scan via GPay / PhonePe / Paytm / BHIM
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '0.65rem', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=165x165&margin=4&data=${encodeURIComponent(getRenewalUpiUrl(tenantProfile, selectedPlan, dynamicPlansMap))}`} 
                      alt="UPI QR Code" 
                      style={{ display: 'block', width: '165px', height: '165px' }} 
                    />
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block', fontWeight: 500 }}>
                  ⚡ Amount auto-filled in your UPI App
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Payee Details + UTR Input + Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Dark Payee Details Box */}
              <div style={{ backgroundColor: '#0b0f19', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', textAlign: 'left' }}>
                <div><span style={{ color: '#94a3b8' }}>Payee Name:</span> <strong style={{ color: '#ffffff' }}>ROHIT BARGE</strong></div>
                <div><span style={{ color: '#94a3b8' }}>VPA Address:</span> <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>rohitbarge22-3@okaxis</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Amount to Pay:</span> <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>₹{getPlanPriceNum(selectedPlan || tenantProfile?.subscriptionPlan || '1_MONTH', dynamicPlansMap).toLocaleString()}</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Transaction Note:</span> <strong style={{ color: '#fbbf24', fontFamily: 'monospace', backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{getRenewalUpiNote(tenantProfile, selectedPlan)}</strong></div>
              </div>

              {/* UTR Input Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  ENTER 12-DIGIT UPI REF / UTR NUMBER *
                </label>
                <input 
                  type="text" 
                  required
                  pattern="\d{12}"
                  maxLength={12}
                  placeholder="e.g. 123456789012"
                  value={renewalUtr}
                  onChange={(e) => setRenewalUtr(e.target.value.replace(/\D/g, '').substring(0, 12))}
                  style={{
                    width: '100%',
                    backgroundColor: '#0b0f19',
                    border: '1.5px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '0.7rem 0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                  Check 12-digit Ref / UTR code on your UPI payment receipt.
                </span>
              </div>

              {renewalStatus && (
                <div style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontSize: '0.8rem',
                  color: '#f8fafc',
                  lineHeight: 1.4
                }}>
                  {renewalStatus}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button 
                  type="button" 
                  onClick={onClose}
                  style={{
                    flex: 1,
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#cbd5e1',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={renewalLoading}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: renewalLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    opacity: renewalLoading ? 0.7 : 1
                  }}
                >
                  {renewalLoading ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};
