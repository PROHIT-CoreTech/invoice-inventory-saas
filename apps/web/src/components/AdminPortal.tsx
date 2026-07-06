import React, { useState } from 'react';

interface Tenant {
  id: string;
  tenantId: string;
  companyName: string;
  logoUrl?: string;
  proprietorName?: string;
  address: string;
  gstin?: string;
  pan?: string;
  bankName?: string;
  bankAccHolder?: string;
  bankAccType?: string;
  bankAccNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  signatureUrl?: string;
  theme?: string;
  tier?: string;
  createdAt: string;
}

interface AdminPortalProps {
  onClose: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/admin/tenants?password=${encodeURIComponent(password)}`;
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error('Authentication failed. Invalid admin password.');
      }

      const data = await res.json();
      setTenants(data);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTenantUrl = (tenantId: string) => {
    const currentHost = window.location.host;
    const currentProtocol = window.location.protocol;
    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${currentProtocol}//${tenantId}.localhost${port}`;
    }
    return `${currentProtocol}//${tenantId}.${currentHost}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editFormData, setEditFormData] = useState<any>({
    companyName: '',
    proprietorName: '',
    address: '',
    gstin: '',
    pan: '',
    bankName: '',
    bankAccHolder: '',
    bankAccType: '',
    bankAccNumber: '',
    bankIfsc: '',
    bankBranch: '',
    theme: 'DEFAULT',
    tier: 'FREE'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleEditClick = (t: Tenant) => {
    setEditingTenant(t);
    setEditFormData({
      companyName: t.companyName || '',
      proprietorName: t.proprietorName || '',
      address: t.address || '',
      gstin: t.gstin || '',
      pan: t.pan || '',
      bankName: t.bankName || '',
      bankAccHolder: t.bankAccHolder || '',
      bankAccType: t.bankAccType || 'Current A/C',
      bankAccNumber: t.bankAccNumber || '',
      bankIfsc: t.bankIfsc || '',
      bankBranch: t.bankBranch || '',
      theme: t.theme || 'DEFAULT',
      tier: t.tier || 'FREE'
    });
    setSaveError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    setIsSaving(true);
    setSaveError('');

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/admin/tenants/${editingTenant.tenantId}`;
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password,
          ...editFormData
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update tenant profile.');
      }

      const updatedTenant = await res.json();
      setTenants(prev => prev.map(item => item.tenantId === editingTenant.tenantId ? updatedTenant : item));
      setEditingTenant(null);
    } catch (err: any) {
      setSaveError(err.message || 'Something went wrong while saving workspace.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.proprietorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.gstin || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Authentication Gate Layout
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        padding: '1.5rem',
        color: '#f8fafc'
      }}>
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            display: 'inline-block'
          }}>🔒</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0' }}>
            System Administrator
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Enter your admin password to view all workspace onboarding records.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Admin Password
              </label>
              <input 
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, textAlign: 'left' }}>
                ⚠️ {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)',
                marginTop: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
            >
              {isLoading ? 'Verifying...' : 'Authenticate →'}
            </button>

            <button 
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
                textDecoration: 'underline'
              }}
            >
              Back to Landing Page
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Portal Dashboard Layout
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      padding: '2rem'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/images/hero.png" alt="Logo" style={{ height: '36px', width: '36px' }} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              PROCash Invoices Admin
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>
              Global Tenant Management Portal
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
              setTenants([]);
            }}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Sign Out
          </button>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Exit Admin
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={statCardStyle}>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Workspaces</span>
          <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
            {tenants.length}
          </span>
        </div>
        <div style={statCardStyle}>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Filtered Results</span>
          <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#818cf8', marginTop: '0.5rem' }}>
            {filteredTenants.length}
          </span>
        </div>
        <div style={statCardStyle}>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>System Status</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            Active & Connected
          </span>
        </div>
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text"
          placeholder="Search by Subdomain, Company Name, Proprietor or GSTIN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#fff',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Table grid */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        overflowX: 'auto',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
              <th style={thStyle}>Workspace / Subdomain</th>
              <th style={thStyle}>Company Details</th>
              <th style={thStyle}>Tax Info</th>
              <th style={thStyle}>Bank Account Details</th>
              <th style={thStyle}>Assets</th>
              <th style={thStyle}>Created On</th>
              <th style={{...thStyle, textAlign: 'center'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No workspace onboarding profiles found matching search query.
                </td>
              </tr>
            ) : (
              filteredTenants.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #334155', transition: 'background-color 0.15s' }} className="table-row">
                  {/* Subdomain / Workspace ID */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: '#818cf8', fontSize: '1rem' }}>
                        {t.tenantId}
                      </span>
                    </div>
                    <a 
                      href={getTenantUrl(t.tenantId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#64748b', fontSize: '0.75rem', textDecoration: 'underline', marginTop: '0.25rem', display: 'block' }}
                    >
                      {getTenantUrl(t.tenantId).replace('http://', '').replace('https://', '')}
                    </a>
                  </td>

                  {/* Company Details */}
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{t.companyName}</div>
                    {t.proprietorName && (
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                        Proprietor: {t.proprietorName}
                      </div>
                    )}
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem', maxWidth: '180px', whiteSpace: 'pre-wrap' }}>
                      {t.address}
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#334155', color: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                        🎨 {t.theme || 'DEFAULT'}
                      </span>
                      <span style={{ fontSize: '0.7rem', backgroundColor: t.tier === 'PREMIUM' ? '#fbbf24' : '#1e293b', color: t.tier === 'PREMIUM' ? '#000' : '#94a3b8', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {t.tier === 'PREMIUM' ? '👑 PREMIUM' : 'FREE'}
                      </span>
                    </div>
                  </td>

                  {/* Tax Info */}
                  <td style={tdStyle}>
                    {t.gstin && (
                      <div>
                        <strong style={{ color: '#64748b', fontSize: '0.7rem' }}>GSTIN:</strong>
                        <div style={{ color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>{t.gstin}</div>
                      </div>
                    )}
                    {t.pan && (
                      <div style={{ marginTop: '0.35rem' }}>
                        <strong style={{ color: '#64748b', fontSize: '0.7rem' }}>PAN:</strong>
                        <div style={{ color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>{t.pan}</div>
                      </div>
                    )}
                  </td>

                  {/* Bank Details */}
                  <td style={tdStyle}>
                    {t.bankName ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{t.bankName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Holder: {t.bankAccHolder}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>
                          A/c: {t.bankAccNumber} ({t.bankAccType})
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          IFSC: {t.bankIfsc} | {t.bankBranch}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>Not provided</span>
                    )}
                  </td>

                  {/* Assets (Logo & Signature) */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.2rem' }}>Logo</span>
                        {t.logoUrl ? (
                          <img src={t.logoUrl} alt="Logo" style={{ height: '28px', width: '28px', objectFit: 'contain', border: '1px solid #475569', borderRadius: '4px', backgroundColor: '#fff' }} />
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>None</span>
                        )}
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.2rem' }}>Signature</span>
                        {t.signatureUrl ? (
                          <img src={t.signatureUrl} alt="Signature" style={{ height: '28px', width: '28px', objectFit: 'contain', border: '1px solid #475569', borderRadius: '4px', backgroundColor: '#fff' }} />
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>None</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Created On */}
                  <td style={tdStyle}>
                    {formatDate(t.createdAt)}
                  </td>

                  {/* Launch Action */}
                  <td style={{...tdStyle, textAlign: 'center'}}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      <a 
                        href={getTenantUrl(t.tenantId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: '#6366f1',
                          color: '#fff',
                          border: 'none',
                          padding: '0.45rem 1rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-block',
                          fontSize: '0.8rem',
                          boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
                          transition: 'background-color 0.15s',
                          width: '120px',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                      >
                        Open ↗
                      </a>
                      <button 
                        type="button"
                        onClick={() => handleEditClick(t)}
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#e2e8f0',
                          border: '1px solid #475569',
                          padding: '0.45rem 1rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          transition: 'all 0.15s',
                          width: '120px',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#334155';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#1e293b';
                          e.currentTarget.style.color = '#e2e8f0';
                        }}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Workspace Profile Modal */}
      {editingTenant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            maxHeight: '90vh',
            overflowY: 'auto',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            color: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 800, textAlign: 'left' }}>
                  🏢 Manage Workspace Profile
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, display: 'block', textAlign: 'left', marginTop: '0.15rem' }}>
                  Tenant ID: {editingTenant.tenantId}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingTenant(null)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', outline: 'none' }}
              >
                &times;
              </button>
            </div>

            {saveError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>
                ⚠️ {saveError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Company Branding & Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Company Registered Name *</label>
                    <input 
                      type="text"
                      required
                      value={editFormData.companyName}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, companyName: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Proprietor Name</label>
                    <input 
                      type="text"
                      value={editFormData.proprietorName}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, proprietorName: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Billing & Office Address *</label>
                  <textarea 
                    required
                    value={editFormData.address}
                    onChange={(e) => setEditFormData((prev: any) => ({ ...prev, address: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'left', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Government Tax Identifiers
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>GSTIN Number</label>
                    <input 
                      type="text"
                      value={editFormData.gstin}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>PAN Card Number</label>
                    <input 
                      type="text"
                      value={editFormData.pan}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'left', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3. Settlement Bank Credentials
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Bank Name</label>
                    <input 
                      type="text"
                      value={editFormData.bankName}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankName: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Account Holder</label>
                    <input 
                      type="text"
                      value={editFormData.bankAccHolder}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankAccHolder: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Account Type</label>
                    <select
                      value={editFormData.bankAccType}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankAccType: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', height: '40px', boxSizing: 'border-box' }}
                    >
                      <option value="Current A/C">Current A/C</option>
                      <option value="Savings A/C">Savings A/C</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Account Number</label>
                    <input 
                      type="text"
                      value={editFormData.bankAccNumber}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankAccNumber: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>IFSC Code</label>
                    <input 
                      type="text"
                      value={editFormData.bankIfsc}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Branch Name</label>
                    <input 
                      type="text"
                      value={editFormData.bankBranch}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, bankBranch: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'left', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  4. Workspace Styling & Subscription Tier
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Select Dashboard Theme</label>
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
                            backgroundColor: editFormData.theme === t.id ? '#1e293b' : '#0f172a',
                            border: `2px solid ${editFormData.theme === t.id ? t.color : '#334155'}`,
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: '#fff',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: t.color }} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Workspace Subscription Tier</label>
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
                            backgroundColor: editFormData.tier === p.id ? '#1e293b' : '#0f172a',
                            border: `2px solid ${editFormData.tier === p.id ? '#818cf8' : '#334155'}`,
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: '#fff',
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
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{p.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingTenant(null)}
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
      )}
    </div>
  );
}

// Styling Constants
const statCardStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const thStyle: React.CSSProperties = {
  padding: '1rem 1.25rem',
  fontWeight: 700
};

const tdStyle: React.CSSProperties = {
  padding: '1.25rem',
  verticalAlign: 'top',
  color: '#e2e8f0'
};
