import React from 'react';
import { Tenant } from './types';

interface EditTenantModalProps {
  editingTenant: Tenant;
  editFormData: {
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
    tier: string;
  };
  setEditFormData: React.Dispatch<React.SetStateAction<any>>;
  isSaving: boolean;
  saveError: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditTenantModal({
  editingTenant,
  editFormData,
  setEditFormData,
  isSaving,
  saveError,
  onClose,
  onSubmit
}: EditTenantModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '650px', padding: '1.75rem', overflowY: 'auto', fontFamily: "'Outfit', 'Inter', sans-serif", backgroundColor: '#ffffff', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, textAlign: 'left' }}>
              🏢 Manage Workspace Profile
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600, display: 'block', textAlign: 'left', marginTop: '0.15rem' }}>
              Tenant ID: {editingTenant.tenantId}
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

        {saveError && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>
            ⚠️ {saveError}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              1. Company Branding & Details
            </h4>
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Company Registered Name *</label>
                <input 
                  type="text"
                  required
                  value={editFormData.companyName}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, companyName: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Proprietor Name</label>
                <input 
                  type="text"
                  value={editFormData.proprietorName}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, proprietorName: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Billing & Office Address *</label>
              <textarea 
                required
                value={editFormData.address}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, address: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              2. Government Tax Identifiers
            </h4>
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>GSTIN Number</label>
                <input 
                  type="text"
                  value={editFormData.gstin}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>PAN Card Number</label>
                <input 
                  type="text"
                  value={editFormData.pan}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              3. Settlement Bank Credentials
            </h4>
            <div className="grid-col-3">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Bank Name</label>
                <input 
                  type="text"
                  value={editFormData.bankName}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankName: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Account Holder</label>
                <input 
                  type="text"
                  value={editFormData.bankAccHolder}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankAccHolder: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Account Type</label>
                <select
                  value={editFormData.bankAccType}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankAccType: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', height: '40px', boxSizing: 'border-box' }}
                >
                  <option value="Current A/C">Current A/C</option>
                  <option value="Savings A/C">Savings A/C</option>
                </select>
              </div>
            </div>
            <div className="grid-col-3" style={{ marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Account Number</label>
                <input 
                  type="text"
                  value={editFormData.bankAccNumber}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankAccNumber: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>IFSC Code</label>
                <input 
                  type="text"
                  value={editFormData.bankIfsc}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Branch Name</label>
                <input 
                  type="text"
                  value={editFormData.bankBranch}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankBranch: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              4. Workspace Styling & Subscription Tier
            </h4>
            <div className="grid-col-2" style={{ gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Select Dashboard Theme</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[
                    { id: 'DEFAULT', name: 'Classic Orange', color: '#fb923c' },
                    { id: 'EMERALD', name: 'Emerald Green', color: '#10b981' },
                    { id: 'SAPPHIRE', name: 'Sapphire Blue', color: '#3b82f6' },
                    { id: 'ROYAL', name: 'Royal Gold', color: '#fbbf24' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditFormData((prev: any) => ({ ...prev, theme: t.id }))}
                      style={{
                        flex: 1,
                        backgroundColor: editFormData.theme === t.id ? '#ffffff' : '#f8fafc',
                        border: `2px solid ${editFormData.theme === t.id ? t.color : '#cbd5e1'}`,
                        borderRadius: '8px',
                        padding: '0.5rem',
                        color: '#0f172a',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s',
                        boxShadow: editFormData.theme === t.id ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                      }}
                    >
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: t.color }} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Workspace Subscription Tier</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[
                    { id: 'FREE', name: 'Free Tier', badge: 'Standard Features' },
                    { id: 'PREMIUM', name: 'Premium Tier 👑', badge: 'Advanced Layouts' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEditFormData((prev: any) => ({ ...prev, tier: p.id }))}
                      style={{
                        flex: 1,
                        backgroundColor: editFormData.tier === p.id ? '#e0e7ff' : '#f8fafc',
                        border: `2px solid ${editFormData.tier === p.id ? '#4f46e5' : '#cbd5e1'}`,
                        borderRadius: '8px',
                        padding: '0.5rem',
                        color: editFormData.tier === p.id ? '#3730a3' : '#475569',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: editFormData.tier === p.id ? 'bold' : 'normal' }}>{p.name}</span>
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{p.badge}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
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
              disabled={isSaving}
              style={{
                backgroundColor: '#6366f1',
                border: 'none',
                color: '#fff',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              {isSaving ? 'Saving Changes...' : 'Save Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
