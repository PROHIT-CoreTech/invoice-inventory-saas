import React from 'react';

interface LandingOnboardingModalProps {
  showOnboarding: boolean;
  onboardingTenant: string;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  getSuffix: () => string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignatureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#cbd5e1',
  marginBottom: '0.45rem',
  textAlign: 'left'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#fff',
  padding: '0.65rem 0.95rem',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  textAlign: 'left',
  transition: 'all 0.2s'
};

export const LandingOnboardingModal: React.FC<LandingOnboardingModalProps> = ({
  showOnboarding,
  onboardingTenant,
  formData,
  setFormData,
  getSuffix,
  onClose,
  onSubmit,
  onLogoUpload,
  onSignatureUpload
}) => {
  if (!showOnboarding) return null;

  return (
    <div
      className="onboarding-overlay"
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
        padding: '2rem',
        overflowY: 'auto'
      }}
    >
      <div
        className="onboarding-modal-card"
        style={{
          backgroundColor: '#151c2f',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.5rem',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            🏢 Onboard Your Invoice Workspace
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Enter the branding, tax, and bank details for <strong style={{ color: '#818cf8' }}>{onboardingTenant}{getSuffix()}</strong>. These details will render on your professional GST invoices automatically.
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Company Profile */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', textAlign: 'left' }}>
            <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Company Profile
            </h4>
            <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp Invoices"
                  value={formData.companyName}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, companyName: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Proprietor / Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.proprietorName}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, proprietorName: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Registered Business Address *</label>
              <textarea
                required
                rows={2}
                placeholder="Complete street address, City, State, Pincode"
                value={formData.address}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, address: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* 2. Tax Identifiers */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', textAlign: 'left' }}>
            <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2. Government Tax Identifiers
            </h4>
            <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>GSTIN Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>PAN Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={formData.pan}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* 3. Settlement Bank Account */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', textAlign: 'left' }}>
            <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3. Settlement Bank Account Details
            </h4>
            <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank"
                  value={formData.bankName}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, bankName: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Account Holder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp Invoices"
                  value={formData.bankAccHolder}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, bankAccHolder: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 50100012345678"
                  value={formData.bankAccNumber}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, bankAccNumber: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai Main Branch"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, bankBranch: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* 4. Branding Assets */}
          <div style={{ paddingBottom: '0.5rem', textAlign: 'left' }}>
            <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              4. Branding Assets (Optional)
            </h4>
            <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Company Logo</label>
                <input type="file" accept="image/*" onChange={onLogoUpload} style={{ color: '#94a3b8', fontSize: '0.85rem' }} />
                {formData.logoUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={formData.logoUrl} alt="Logo Preview" style={{ height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#fff', padding: '2px' }} />
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Authorized Signature</label>
                <input type="file" accept="image/*" onChange={onSignatureUpload} style={{ color: '#94a3b8', fontSize: '0.85rem' }} />
                {formData.signatureUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={formData.signatureUrl} alt="Signature Preview" style={{ height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#fff', padding: '2px' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #475569',
                color: '#94a3b8',
                padding: '0.65rem 1.5rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: 'none',
                color: '#fff',
                padding: '0.65rem 2.5rem',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
              }}
            >
              Complete Onboarding & Launch →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
