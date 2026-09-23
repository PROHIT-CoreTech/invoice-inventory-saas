import React from 'react';

interface CreateTenantModalProps {
  newTenant: {
    tenantId: string;
    companyName: string;
    proprietorName: string;
    address: string;
    gstin: string;
    pan: string;
    bankName: string;
    bankAccHolder: string;
    bankAccType: string;
    bankAccNumber: string;
    bankIfsc: string;
    bankBranch: string;
    theme: string;
    subscriptionPlan: string;
  };
  setNewTenant: React.Dispatch<React.SetStateAction<{
    tenantId: string;
    companyName: string;
    proprietorName: string;
    address: string;
    gstin: string;
    pan: string;
    bankName: string;
    bankAccHolder: string;
    bankAccType: string;
    bankAccNumber: string;
    bankIfsc: string;
    bankBranch: string;
    theme: string;
    subscriptionPlan: string;
  }>>;
  createLoading: boolean;
  createError: string;
  createSuccess: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CreateTenantModal({
  newTenant,
  setNewTenant,
  createLoading,
  createError,
  createSuccess,
  onClose,
  onSubmit
}: CreateTenantModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '680px', padding: '1.75rem', overflowY: 'auto', backgroundColor: '#ffffff', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>
            ➕ Create New Workspace (Cash/Offline payment)
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        {createError && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
            ⚠️ {createError}
          </div>
        )}

        {createSuccess && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#34d399', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {createSuccess}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Part 1: Company Profile */}
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.85rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              1. Workspace Subdomain & Profile
            </h4>
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Workspace Subdomain / ID *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. rohit (lowercase a-z, 0-9)"
                  value={newTenant.tenantId}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, tenantId: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Subscription Plan *</label>
                <select
                  value={newTenant.subscriptionPlan}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, subscriptionPlan: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                >
                  <option value="FREE">Free Tier (₹0)</option>
                  <option value="TRIAL">10-Day Free Trial (₹0)</option>
                  <option value="1_MONTH">Monthly Starter (₹1,499)</option>
                  <option value="6_MONTHS">6 Months Pro (₹4,999)</option>
                  <option value="1_YEAR">1 Year Enterprise (₹9,999)</option>
                  <option value="LIFETIME">Lifetime Unlimited (₹20,000)</option>
                </select>
              </div>
            </div>

            <div className="grid-col-2" style={{ marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Company / Business Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rohit & Co."
                  value={newTenant.companyName}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, companyName: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Proprietor / Contact Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Rohit Barge"
                  value={newTenant.proprietorName}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, proprietorName: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Billing & Office Address *</label>
              <textarea 
                required
                placeholder="Enter complete office address..."
                value={newTenant.address}
                onChange={(e) => setNewTenant(prev => ({ ...prev, address: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Part 2: Govt Tax Identifiers */}
          <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              2. Government Tax Identifiers
            </h4>
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>GSTIN Number</label>
                <input 
                  type="text"
                  placeholder="e.g. 27AAAAA1111A1Z1"
                  value={newTenant.gstin}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>PAN Card Number</label>
                <input 
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={newTenant.pan}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Part 3: Settlement Bank Credentials */}
          <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              3. Settlement Bank Credentials
            </h4>
            <div className="grid-col-3">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Bank Name</label>
                <input 
                  type="text"
                  placeholder="e.g. HDFC Bank"
                  value={newTenant.bankName}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, bankName: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Holder Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Rohit & Co."
                  value={newTenant.bankAccHolder}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, bankAccHolder: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Account Type</label>
                <select
                  value={newTenant.bankAccType}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, bankAccType: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                >
                  <option value="CURRENT">Current Account</option>
                  <option value="SAVINGS">Savings Account</option>
                </select>
              </div>
            </div>

            <div className="grid-col-3" style={{ marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Account Number</label>
                <input 
                  type="text"
                  placeholder="Enter account number..."
                  value={newTenant.bankAccNumber}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, bankAccNumber: e.target.value.replace(/\D/g, '') }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>IFSC Code</label>
                <input 
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={newTenant.bankIfsc}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Branch Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Mumbai Main"
                  value={newTenant.bankBranch}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, bankBranch: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Part 4: Layout customization */}
          <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              4. Layout Customizations
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Brand Theme</label>
                <select
                  value={newTenant.theme}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, theme: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                >
                  <option value="DEFAULT">Default Light</option>
                  <option value="EMERALD">Emerald Green</option>
                  <option value="SAPPHIRE">Sapphire Blue</option>
                  <option value="ROYAL">Royal Purple</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #475569',
                color: '#94a3b8',
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
              disabled={createLoading}
              style={{
                backgroundColor: '#10b981',
                border: 'none',
                color: '#000',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: createLoading ? 'not-allowed' : 'pointer',
                opacity: createLoading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {createLoading ? 'Creating Workspace...' : 'Onboard Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
