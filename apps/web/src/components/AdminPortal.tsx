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
                        transition: 'background-color 0.15s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                    >
                      Open Workspace ↗
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
