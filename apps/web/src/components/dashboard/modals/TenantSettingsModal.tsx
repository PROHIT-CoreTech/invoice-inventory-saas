import React from 'react';
import { TenantProfile } from '../types';
import { getPlanLabel, getPlanPrice, formatDateTime } from '../utils';

interface TenantSettingsModalProps {
  tenantProfile: TenantProfile | null;
  settingsData: any;
  setSettingsData: React.Dispatch<React.SetStateAction<any>>;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignatureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TenantSettingsModal: React.FC<TenantSettingsModalProps> = ({
  tenantProfile,
  settingsData,
  setSettingsData,
  onLogoUpload,
  onSignatureUpload,
  onClose,
  onSubmit
}) => {
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-card" style={{ maxWidth: '650px', padding: '1.75rem', overflowY: 'auto', backgroundColor: '#ffffff', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              ⚙️ Workspace Settings & Company Profile
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
              Configure your business details, tax numbers, and settlement bank credentials.
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', outline: 'none' }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Part 1: Company Profile & Logo/Signature Uploads */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', textAlign: 'left' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              1. Company Profile & Logo Uploads
            </h4>
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Company / Business Name *</label>
                <input 
                  type="text" 
                  required
                  value={settingsData.companyName}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, companyName: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  placeholder="e.g. Rohit Tech Solutions"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Proprietor / Contact Name</label>
                <input 
                  type="text" 
                  value={settingsData.proprietorName}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, proprietorName: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  placeholder="e.g. Rohit Barge"
                />
              </div>
            </div>

            <div className="grid-col-3" style={{ marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Billing & Office Address *</label>
                <textarea 
                  required
                  value={settingsData.address}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, address: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box', height: '70px', resize: 'none' }}
                  placeholder="e.g. Office 202, Tech Park, Mumbai"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Company Logo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={onLogoUpload}
                  style={{ width: '100%', padding: '0.35rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
                {settingsData.logoUrl && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={settingsData.logoUrl} alt="Preview" style={{ height: '24px', maxWidth: '80px', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ Logo Uploaded</span>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Digital Signature (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={onSignatureUpload}
                  style={{ width: '100%', padding: '0.35rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
                {settingsData.signatureUrl && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={settingsData.signatureUrl} alt="Preview" style={{ height: '24px', maxWidth: '80px', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ Signature Uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Part 2: Tax Details */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', textAlign: 'left' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              2. Tax Details
            </h4>
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>GSTIN / Tax ID</label>
                <input 
                  type="text" 
                  value={settingsData.gstin}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  placeholder="e.g. 27ALQPB3481K1ZR"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>PAN Number</label>
                <input 
                  type="text" 
                  value={settingsData.pan}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  placeholder="e.g. ALQPB3481K"
                />
              </div>
            </div>
          </div>

          {/* Part 3: Bank Details */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', textAlign: 'left' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              3. Bank Account Details
            </h4>
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Account Holder Name</label>
                <input 
                  type="text"
                  value={settingsData.bankAccHolder}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankAccHolder: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  placeholder="e.g. Rohit Tech Solutions"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Bank Name</label>
                <input 
                  type="text"
                  value={settingsData.bankName}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankName: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  placeholder="e.g. HDFC BANK"
                />
              </div>
            </div>

            <div className="grid-col-3" style={{ marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Account Number</label>
                <input 
                  type="text"
                  value={settingsData.bankAccNumber}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankAccNumber: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  placeholder="e.g. 5010023456789"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>IFSC Code</label>
                <input 
                  type="text"
                  value={settingsData.bankIfsc}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  placeholder="e.g. HDFC0000212"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Branch Name</label>
                <input 
                  type="text"
                  value={settingsData.bankBranch}
                  onChange={(e) => setSettingsData((prev: any) => ({ ...prev, bankBranch: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  placeholder="e.g. Mumbai Central"
                />
              </div>
            </div>
          </div>

          {/* Part 4: Active Subscription Details */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.45rem' }}>Active Subscription Details</label>
            <div className="grid-col-2" style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              fontSize: '0.85rem',
              boxSizing: 'border-box',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Plan</span>
                <strong style={{ color: '#0f172a' }}>
                  {getPlanLabel(tenantProfile?.subscriptionPlan || 'FREE')}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Amount</span>
                <strong style={{ color: '#0f172a' }}>
                  {getPlanPrice(tenantProfile?.subscriptionPlan || 'FREE')}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Start/Sync Date</span>
                <span style={{ color: '#334155', fontWeight: 500 }}>
                  {formatDateTime(tenantProfile?.updatedAt)}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Expires On</span>
                <span style={{ 
                  color: tenantProfile?.subscriptionStatus === 'EXPIRED' ? '#dc2626' : '#059669', 
                  fontWeight: 700 
                }}>
                  {tenantProfile?.subscriptionPlan === 'LIFETIME' ? 'Never (Lifetime)' : (tenantProfile?.subscriptionPlan === 'FREE' ? 'N/A' : formatDateTime(tenantProfile?.subscriptionExpiresAt))}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                backgroundColor: '#4f46e5',
                border: 'none',
                color: '#fff',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
