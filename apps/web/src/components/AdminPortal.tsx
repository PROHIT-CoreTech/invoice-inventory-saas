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
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
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

  // Active Tab & Pending Payments states
  const [activeTab, setActiveTab] = useState<'WORKSPACES' | 'PENDING_PAYMENTS'>('WORKSPACES');
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Manual Workspace Creation States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const initialTenantState = {
    tenantId: '',
    companyName: '',
    proprietorName: '',
    address: '',
    gstin: '',
    pan: '',
    bankName: '',
    bankAccHolder: '',
    bankAccType: 'CURRENT',
    bankAccNumber: '',
    bankIfsc: '',
    bankBranch: '',
    theme: 'DEFAULT',
    subscriptionPlan: '1_MONTH'
  };
  const [newTenant, setNewTenant] = useState(initialTenantState);

  const handleCreateTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    
    if (!newTenant.tenantId || !newTenant.companyName || !newTenant.address) {
      setCreateError('Subdomain, Company Name, and Address are required.');
      return;
    }

    setCreateLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTenant,
          password
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to manually onboard workspace.');
      }

      setCreateSuccess('🎉 Workspace manually created & active successfully!');
      setNewTenant(initialTenantState);
      
      // Refresh admin data
      await fetchAdminData(password);

      setTimeout(() => {
        setIsCreateModalOpen(false);
        setCreateSuccess('');
      }, 3000);

    } catch (err: any) {
      setCreateError(err.message || 'An error occurred.');
    } finally {
      setCreateLoading(false);
    }
  };

  const getPlanLabel = (planId: string | undefined) => {
    switch (planId) {
      case 'TRIAL': return '10-Day Free Trial';
      case '1_MONTH': return 'Monthly Starter';
      case '6_MONTHS': return '6 Months Pro';
      case '1_YEAR': return '1 Year Enterprise';
      case 'LIFETIME': return 'Lifetime Unlimited';
      case 'FREE': return 'Free Tier';
      default: return 'Free Tier';
    }
  };

  const getPlanPrice = (planId: string | undefined) => {
    switch (planId) {
      case 'TRIAL': return '₹0';
      case '1_MONTH': return '₹999';
      case '6_MONTHS': return '₹4,999';
      case '1_YEAR': return '₹9,999';
      case 'LIFETIME': return '₹20,000';
      case 'FREE': return '₹0';
      default: return '₹0';
    }
  };

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const fetchAdminData = async (adminPassword: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    
    // 1. Fetch Tenants
    const tenantsUrl = `${baseUrl}/admin/tenants?password=${encodeURIComponent(adminPassword)}`;
    const tenantsRes = await fetch(tenantsUrl);
    if (!tenantsRes.ok) throw new Error('Authentication failed. Invalid admin password.');
    const tenantsData = await tenantsRes.json();
    setTenants(tenantsData);

    // 2. Fetch Pending UTR Payments
    const pendingUrl = `${baseUrl}/admin/pending-payments?password=${encodeURIComponent(adminPassword)}`;
    try {
      const pendingRes = await fetch(pendingUrl);
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingPayments(pendingData);
      }
    } catch (e) {
      console.error('Failed to fetch pending payments:', e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await fetchAdminData(password);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    setActionLoadingId(paymentId);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/approve-payment/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Approval failed.');
      }
      alert('Payment approved and workspace activated successfully!');
      await fetchAdminData(password);
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to reject this payment request?')) return;
    setActionLoadingId(paymentId);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/reject-payment/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Rejection failed.');
      }
      alert('Payment rejected successfully.');
      await fetchAdminData(password);
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setActionLoadingId(null);
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

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: '#10b981',
              color: '#000',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            ➕ Add Workspace
          </button>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
              setTenants([]);
              setPendingPayments([]);
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

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('WORKSPACES')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'WORKSPACES' ? '#fff' : '#64748b',
            borderBottom: activeTab === 'WORKSPACES' ? '2px solid #6366f1' : 'none',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📁 Active Workspaces ({tenants.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PENDING_PAYMENTS')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'PENDING_PAYMENTS' ? '#fff' : '#64748b',
            borderBottom: activeTab === 'PENDING_PAYMENTS' ? '2px solid #10b981' : 'none',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ⏳ Pending UTR Verification ({pendingPayments.length})
        </button>
      </div>

      {activeTab === 'WORKSPACES' ? (
        <>
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
                  <th style={thStyle}>Subscription</th>
                  <th style={thStyle}>Created On</th>
                  <th style={{...thStyle, textAlign: 'center'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
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

                      {/* Assets (Logo) */}
                      <td style={tdStyle}>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.2rem' }}>Logo</span>
                          {t.logoUrl ? (
                            <img src={t.logoUrl} alt="Logo" style={{ height: '28px', width: '28px', objectFit: 'contain', border: '1px solid #475569', borderRadius: '4px', backgroundColor: '#fff' }} />
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>None</span>
                          )}
                        </div>
                      </td>

                      {/* Subscription Details */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', textAlign: 'left' }}>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>Plan: </span>
                            <span style={{ color: '#fff', fontWeight: 700 }}>
                              {getPlanLabel(t.subscriptionPlan)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>Amount: </span>
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                              {getPlanPrice(t.subscriptionPlan)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>Status: </span>
                            <span style={{ 
                              backgroundColor: t.subscriptionStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: t.subscriptionStatus === 'ACTIVE' ? '#10b981' : '#ef4444',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}>
                              {t.subscriptionStatus || 'INACTIVE'}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>Expires: </span>
                            <span style={{ color: '#94a3b8' }}>
                              {t.subscriptionPlan === 'LIFETIME' ? 'Never' : (t.subscriptionPlan === 'FREE' ? 'N/A' : formatDateTime(t.subscriptionExpiresAt))}
                            </span>
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
        </>
      ) : (
        /* Pending Payments Table */
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          overflowX: 'auto',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={thStyle}>Workspace Subdomain</th>
                <th style={thStyle}>Plan Tier</th>
                <th style={thStyle}>Billed Amount</th>
                <th style={thStyle}>Submitted UTR Code</th>
                <th style={thStyle}>Submission Date</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No pending UPI payment requests to verify.
                  </td>
                </tr>
              ) : (
                pendingPayments.map((p) => (
                  <tr key={p._id || p.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={tdStyle}>
                      <strong style={{ color: '#818cf8', fontSize: '1rem' }}>{p.tenantId}</strong>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {getPlanLabel(p.planTier)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: '#fff', fontFamily: 'monospace' }}>₹{p.amountPaid}</strong>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: '#fbbf24', fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{p.utrNumber}</strong>
                    </td>
                    <td style={tdStyle}>
                      {formatDateTime(p.submittedAt)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          type="button"
                          disabled={actionLoadingId === (p._id || p.id)}
                          onClick={() => handleApprovePayment(p._id || p.id)}
                          style={{
                            backgroundColor: '#10b981',
                            color: '#000',
                            border: 'none',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                          }}
                        >
                          {actionLoadingId === (p._id || p.id) ? 'Processing...' : 'Approve ✅'}
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === (p._id || p.id)}
                          onClick={() => handleRejectPayment(p._id || p.id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                          }}
                        >
                          Reject ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Workspace Profile Modal */}
      {editingTenant && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '650px', padding: '1.75rem', overflowY: 'auto', fontFamily: "'Outfit', 'Inter', sans-serif", color: '#fff' }}>
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

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '680px', padding: '1.75rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>
                ➕ Create New Workspace (Cash/Offline payment)
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
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

            <form onSubmit={handleCreateTenantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Part 1: Company Profile */}
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.85rem', margin: '0 0 0.85rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Workspace Subdomain & Profile
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Workspace Subdomain / ID *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. rohit (lowercase a-z, 0-9)"
                      value={newTenant.tenantId}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, tenantId: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Subscription Plan *</label>
                    <select
                      value={newTenant.subscriptionPlan}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, subscriptionPlan: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    >
                      <option value="FREE">Free Tier (₹0)</option>
                      <option value="TRIAL">10-Day Free Trial (₹0)</option>
                      <option value="1_MONTH">Monthly Starter (₹999)</option>
                      <option value="6_MONTHS">6 Months Pro (₹4,999)</option>
                      <option value="1_YEAR">1 Year Enterprise (₹9,999)</option>
                      <option value="LIFETIME">Lifetime Unlimited (₹20,000)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Company / Business Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rohit & Co."
                      value={newTenant.companyName}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, companyName: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Proprietor / Contact Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Rohit Barge"
                      value={newTenant.proprietorName}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, proprietorName: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Billing & Office Address *</label>
                  <textarea 
                    required
                    placeholder="Enter complete office address..."
                    value={newTenant.address}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, address: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Part 2: Govt Tax Identifiers */}
              <div style={{ textAlign: 'left', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Government Tax Identifiers
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>GSTIN Number</label>
                    <input 
                      type="text"
                      placeholder="e.g. 27AAAAA1111A1Z1"
                      value={newTenant.gstin}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>PAN Card Number</label>
                    <input 
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={newTenant.pan}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Part 3: Settlement Bank Credentials */}
              <div style={{ textAlign: 'left', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3. Settlement Bank Credentials
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Bank Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={newTenant.bankName}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, bankName: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Holder Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Rohit & Co."
                      value={newTenant.bankAccHolder}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, bankAccHolder: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Account Type</label>
                    <select
                      value={newTenant.bankAccType}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, bankAccType: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    >
                      <option value="CURRENT">Current Account</option>
                      <option value="SAVINGS">Savings Account</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Account Number</label>
                    <input 
                      type="text"
                      placeholder="Enter account number..."
                      value={newTenant.bankAccNumber}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, bankAccNumber: e.target.value.replace(/\D/g, '') }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>IFSC Code</label>
                    <input 
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={newTenant.bankIfsc}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Branch Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Mumbai Main"
                      value={newTenant.bankBranch}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, bankBranch: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Part 4: Layout customization */}
              <div style={{ textAlign: 'left', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  4. Layout Customizations
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Brand Theme</label>
                    <select
                      value={newTenant.theme}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, theme: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    >
                      <option value="DEFAULT">Default Slate Dark</option>
                      <option value="SLEEK_NAVY">Sleek Navy</option>
                      <option value="ROYAL_GOLD">Royal Gold</option>
                      <option value="EMERALD_MINT">Emerald Mint</option>
                      <option value="CRIMSON_LUXE">Crimson Luxe</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
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
