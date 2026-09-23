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

interface SubscriptionPlanConfig {
  id: string;
  planId: string;
  name: string;
  description?: string;
  regularPrice: number;
  offerPrice?: number | null;
  offerBadge?: string | null;
  offerStartDate?: string | null;
  offerEndDate?: string | null;
  futurePrice?: number | null;
  futurePriceEffectiveDate?: string | null;
  isActive: boolean;
  billingCycleMonths?: number | null;
  effectivePrice?: number;
  isOfferActive?: boolean;
  savingsAmount?: number;
  savingsPercentage?: number;
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

  // Active Tab & Section states
  const [activeTab, setActiveTab] = useState<'WORKSPACES' | 'PENDING_PAYMENTS' | 'PRICING'>('WORKSPACES');
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanConfig[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Plan Pricing Management States
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanConfig | null>(null);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    regularPrice: '',
    offerPrice: '',
    offerBadge: '',
    offerStartDate: '',
    offerEndDate: '',
    futurePrice: '',
    futurePriceEffectiveDate: ''
  });
  const [planSaveLoading, setPlanSaveLoading] = useState(false);
  const [planSaveError, setPlanSaveError] = useState('');
  const [planSaveSuccess, setPlanSaveSuccess] = useState('');

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

  const getEffectiveStatus = (t: Tenant) => {
    const rawStatus = t.subscriptionStatus || 'INACTIVE';
    if (rawStatus === 'ACTIVE' && t.subscriptionExpiresAt) {
      if (new Date() > new Date(t.subscriptionExpiresAt)) {
        return 'EXPIRED';
      }
    }
    return rawStatus;
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

    // 3. Fetch Subscription Plan Configs & Pricing Offers
    const plansUrl = `${baseUrl}/admin/subscription-plans?password=${encodeURIComponent(adminPassword)}`;
    try {
      const plansRes = await fetch(plansUrl);
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setSubscriptionPlans(plansData);
      }
    } catch (e) {
      console.error('Failed to fetch subscription plans:', e);
    }
  };

  const handleOpenEditPlan = (plan: SubscriptionPlanConfig) => {
    setEditingPlan(plan);
    setPlanSaveError('');
    setPlanSaveSuccess('');
    
    // Format dates for input type="datetime-local" or "date"
    const formatDateInput = (isoStr: string | null | undefined) => {
      if (!isoStr) return '';
      try {
        const d = new Date(isoStr);
        return d.toISOString().slice(0, 10);
      } catch {
        return '';
      }
    };

    setPlanFormData({
      name: plan.name || '',
      description: plan.description || '',
      regularPrice: plan.regularPrice !== undefined ? String(plan.regularPrice) : '',
      offerPrice: plan.offerPrice !== null && plan.offerPrice !== undefined ? String(plan.offerPrice) : '',
      offerBadge: plan.offerBadge || '',
      offerStartDate: formatDateInput(plan.offerStartDate),
      offerEndDate: formatDateInput(plan.offerEndDate),
      futurePrice: plan.futurePrice !== null && plan.futurePrice !== undefined ? String(plan.futurePrice) : '',
      futurePriceEffectiveDate: formatDateInput(plan.futurePriceEffectiveDate)
    });
  };

  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setPlanSaveLoading(true);
    setPlanSaveError('');
    setPlanSaveSuccess('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/subscription-plans/${editingPlan.planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          ...planFormData,
          regularPrice: parseFloat(planFormData.regularPrice),
          offerPrice: planFormData.offerPrice ? parseFloat(planFormData.offerPrice) : null,
          futurePrice: planFormData.futurePrice ? parseFloat(planFormData.futurePrice) : null
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update plan configuration.');
      }

      const updatedPlan = await res.json();
      setSubscriptionPlans(prev => prev.map(p => p.planId === updatedPlan.planId ? updatedPlan : p));
      setPlanSaveSuccess('🎉 Subscription plan pricing & offer updated successfully!');

      setTimeout(() => {
        setEditingPlan(null);
        setPlanSaveSuccess('');
      }, 1500);

    } catch (err: any) {
      setPlanSaveError(err.message || 'An error occurred while saving plan.');
    } finally {
      setPlanSaveLoading(false);
    }
  };

  const handleApplyFuturePrice = async (planId: string) => {
    if (!confirm('Are you sure you want to apply the scheduled future price as the regular price immediately?')) return;
    setActionLoadingId(planId);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/subscription-plans/${planId}/apply-future`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to apply future price.');
      }

      const updated = await res.json();
      setSubscriptionPlans(prev => prev.map(p => p.planId === updated.planId ? updated : p));
      alert('Future price promoted to Regular Price successfully!');
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClearOffer = async (planId: string) => {
    if (!confirm('Are you sure you want to clear the active offer for this plan?')) return;
    setActionLoadingId(planId);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/subscription-plans/${planId}/offer`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to clear offer.');
      }

      const updated = await res.json();
      setSubscriptionPlans(prev => prev.map(p => p.planId === updated.planId ? updated : p));
      alert('Promotional offer cleared successfully.');
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setActionLoadingId(null);
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
      <div className="admin-login-overlay">
        <div className="admin-login-card">
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
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
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
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
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
    <div className="admin-portal-container">
      {/* Header */}
      <header className="admin-header">
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

        <div className="admin-header-actions">
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
      <div className="admin-tabs-container">
        <button
          type="button"
          onClick={() => setActiveTab('WORKSPACES')}
          className={`admin-tab-btn ${activeTab === 'WORKSPACES' ? 'active' : ''}`}
        >
          📁 Active Workspaces ({tenants.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PENDING_PAYMENTS')}
          className={`admin-tab-btn pending ${activeTab === 'PENDING_PAYMENTS' ? 'active' : ''}`}
        >
          ⏳ Pending UTR Verification ({pendingPayments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PRICING')}
          className={`admin-tab-btn ${activeTab === 'PRICING' ? 'active' : ''}`}
          style={{
            backgroundColor: activeTab === 'PRICING' ? '#4f46e5' : undefined,
            color: activeTab === 'PRICING' ? '#ffffff' : undefined,
            fontWeight: 700
          }}
        >
          🏷️ Subscription Pricing & Offers ({subscriptionPlans.length})
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
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                padding: '0.75rem 1.25rem',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            />
          </div>

          {/* Table grid */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflowX: 'auto',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
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
                    <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s' }} className="table-row">
                      {/* Subdomain / Workspace ID */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1rem' }}>
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
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{t.companyName}</div>
                        {t.proprietorName && (
                          <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                            Proprietor: {t.proprietorName}
                          </div>
                        )}
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem', maxWidth: '180px', whiteSpace: 'pre-wrap' }}>
                          {t.address}
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                            🎨 {t.theme || 'DEFAULT'}
                          </span>
                          <span style={{ fontSize: '0.7rem', backgroundColor: t.tier === 'PREMIUM' ? '#fef3c7' : '#f1f5f9', border: t.tier === 'PREMIUM' ? '1px solid #fde68a' : '1px solid #cbd5e1', color: t.tier === 'PREMIUM' ? '#92400e' : '#475569', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                            {t.tier === 'PREMIUM' ? '👑 PREMIUM' : 'FREE'}
                          </span>
                        </div>
                      </td>

                      {/* Tax Info */}
                      <td style={tdStyle}>
                        {t.gstin && (
                          <div>
                            <strong style={{ color: '#64748b', fontSize: '0.7rem' }}>GSTIN:</strong>
                            <div style={{ color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>{t.gstin}</div>
                          </div>
                        )}
                        {t.pan && (
                          <div style={{ marginTop: '0.35rem' }}>
                            <strong style={{ color: '#64748b', fontSize: '0.7rem' }}>PAN:</strong>
                            <div style={{ color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>{t.pan}</div>
                          </div>
                        )}
                      </td>

                      {/* Bank Details */}
                      <td style={tdStyle}>
                        {t.bankName ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.bankName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                              Holder: {t.bankAccHolder}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>
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
                            <img src={t.logoUrl} alt="Logo" style={{ height: '28px', width: '28px', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#fff' }} />
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
                            <span style={{ color: '#0f172a', fontWeight: 700 }}>
                              {getPlanLabel(t.subscriptionPlan)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>Amount: </span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>
                              {getPlanPrice(t.subscriptionPlan)}
                            </span>
                          </div>
                          {(() => {
                            const effStatus = getEffectiveStatus(t);
                            const isActive = effStatus === 'ACTIVE';
                            const isExpired = effStatus === 'EXPIRED';
                            return (
                              <>
                                <div>
                                  <span style={{ color: '#64748b', fontWeight: 600 }}>Status: </span>
                                  <span style={{ 
                                    backgroundColor: isActive ? '#d1fae5' : isExpired ? '#fee2e2' : '#f1f5f9',
                                    color: isActive ? '#065f46' : isExpired ? '#991b1b' : '#475569',
                                    border: isActive ? '1px solid #a7f3d0' : isExpired ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                  }}>
                                    {effStatus}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ color: '#64748b', fontWeight: 600 }}>Expires: </span>
                                  <span style={{ color: isExpired ? '#dc2626' : '#475569', fontWeight: isExpired ? 600 : 400 }}>
                                    {t.subscriptionPlan === 'LIFETIME' ? 'Never' : (t.subscriptionPlan === 'FREE' ? 'N/A' : formatDateTime(t.subscriptionExpiresAt))}
                                    {isExpired && ' (Expired)'}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
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
                              backgroundColor: '#4f46e5',
                              color: '#fff',
                              border: 'none',
                              padding: '0.45rem 1rem',
                              borderRadius: '6px',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-block',
                              fontSize: '0.8rem',
                              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                              transition: 'background-color 0.15s',
                              width: '120px',
                              textAlign: 'center',
                              boxSizing: 'border-box'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                          >
                            Open ↗
                          </a>
                          <button 
                            type="button"
                            onClick={() => handleEditClick(t)}
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
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
                              e.currentTarget.style.backgroundColor = '#e2e8f0';
                              e.currentTarget.style.color = '#0f172a';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#f1f5f9';
                              e.currentTarget.style.color = '#334155';
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
      ) : activeTab === 'PENDING_PAYMENTS' ? (
        /* Pending Payments Table */
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflowX: 'auto',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
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
                  <tr key={p._id || p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={tdStyle}>
                      <strong style={{ color: '#4f46e5', fontSize: '1rem' }}>{p.tenantId}</strong>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {getPlanLabel(p.planTier)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>₹{p.amountPaid}</strong>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: '#d97706', fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{p.utrNumber}</strong>
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
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)'
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
      ) : (
        /* PRICING & OFFERS SECTION */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Bar */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                🏷️ Subscription Charges & Promotional Offers Management
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Set current promotional prices, offer discount badges, or schedule upcoming future price updates with effective dates.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                🔥 Active Offers: {subscriptionPlans.filter(p => p.isOfferActive).length}
              </span>
              <span style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                🗓️ Scheduled Changes: {subscriptionPlans.filter(p => p.futurePrice !== null && p.futurePrice !== undefined).length}
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
            gap: '1.5rem'
          }}>
            {subscriptionPlans.map((plan) => {
              const isOfferActive = plan.isOfferActive;
              const hasFuturePrice = plan.futurePrice !== null && plan.futurePrice !== undefined;
              return (
                <div key={plan.id || plan.planId} style={{
                  backgroundColor: '#ffffff',
                  border: isOfferActive ? '2px solid #10b981' : hasFuturePrice ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}>
                  <div>
                    {/* Top Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor: isOfferActive ? '#d1fae5' : '#f1f5f9',
                        color: isOfferActive ? '#065f46' : '#475569',
                        border: isOfferActive ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
                      }}>
                        {isOfferActive ? '🔥 PROMO OFFER ACTIVE' : '⚡ STANDARD PRICING'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>
                        ID: {plan.planId}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {plan.name}
                    </h4>
                    <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.825rem', minHeight: '36px' }}>
                      {plan.description || 'No description provided.'}
                    </p>

                    {/* Price Section */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Current Effective Price
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {isOfferActive && (
                          <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: '#94a3b8', fontWeight: 600 }}>
                            ₹{plan.regularPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span style={{ fontSize: '1.85rem', fontWeight: 900, color: isOfferActive ? '#059669' : '#4f46e5' }}>
                          ₹{(plan.effectivePrice ?? plan.regularPrice).toLocaleString('en-IN')}
                        </span>
                        {plan.billingCycleMonths && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            / {plan.billingCycleMonths} {plan.billingCycleMonths === 1 ? 'month' : 'months'}
                          </span>
                        )}
                        {!plan.billingCycleMonths && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {plan.planId === 'LIFETIME' ? 'one-time lifetime' : 'free trial'}
                          </span>
                        )}
                      </div>

                      {/* Offer Discount Badge & Tags */}
                      {isOfferActive && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                              SAVE {plan.savingsPercentage}% (₹{plan.savingsAmount?.toLocaleString('en-IN')})
                            </span>
                            {plan.offerBadge && (
                              <span style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                🏷️ {plan.offerBadge}
                              </span>
                            )}
                          </div>
                          {(plan.offerStartDate || plan.offerEndDate) && (
                            <div style={{ fontSize: '0.725rem', color: '#047857', fontWeight: 600, marginTop: '0.15rem' }}>
                              📅 Validity: {plan.offerStartDate ? formatDate(plan.offerStartDate) : 'Now'} to {plan.offerEndDate ? formatDate(plan.offerEndDate) : 'Ongoing'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Scheduled Future Price Banner */}
                    {hasFuturePrice && (
                      <div style={{
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fcd34d',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        textAlign: 'left'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>🗓️ Scheduled Future Price Update</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400e', marginTop: '0.2rem' }}>
                          Future Price: ₹{plan.futurePrice?.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#78350f', marginTop: '0.15rem' }}>
                          Takes effect on: {plan.futurePriceEffectiveDate ? formatDate(plan.futurePriceEffectiveDate) : 'Immediate next cycle'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlan(plan)}
                      style={{
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)'
                      }}
                    >
                      ✏️ Edit Pricing & Offer
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {hasFuturePrice && (
                        <button
                          type="button"
                          disabled={actionLoadingId === plan.planId}
                          onClick={() => handleApplyFuturePrice(plan.planId)}
                          style={{
                            flex: 1,
                            backgroundColor: '#fef3c7',
                            border: '1px solid #fde68a',
                            color: '#92400e',
                            padding: '0.45rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          🚀 Apply Future Price Now
                        </button>
                      )}

                      {isOfferActive && (
                        <button
                          type="button"
                          disabled={actionLoadingId === plan.planId}
                          onClick={() => handleClearOffer(plan.planId)}
                          style={{
                            flex: 1,
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#991b1b',
                            padding: '0.45rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ Clear Offer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manage Subscription Plan Pricing & Offers Modal */}
      {editingPlan && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '650px', padding: '1.75rem', overflowY: 'auto', backgroundColor: '#ffffff', color: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                  🏷️ Configure Plan Pricing & Offers
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700, display: 'block', marginTop: '0.15rem' }}>
                  Plan ID: {editingPlan.planId} ({editingPlan.name})
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingPlan(null)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {planSaveError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠️ {planSaveError}
              </div>
            )}

            {planSaveSuccess && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                {planSaveSuccess}
              </div>
            )}

            <form onSubmit={handleSavePlanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Part 1: Plan Basic Info */}
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  1. Plan Info & Regular Base Price
                </h4>
                <div className="grid-col-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Plan Display Name *</label>
                    <input 
                      type="text"
                      required
                      value={planFormData.name}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Regular Base Price (₹) *</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      step="1"
                      placeholder="e.g. 999"
                      value={planFormData.regularPrice}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, regularPrice: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Plan Short Description</label>
                  <input 
                    type="text"
                    placeholder="Short description snippet..."
                    value={planFormData.description}
                    onChange={(e) => setPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Part 2: Promotional Offer Setup */}
              <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <h4 style={{ color: '#059669', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🔥 2. Set Promotional Offer Price</span>
                </h4>
                
                <div className="grid-col-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Offer Price (₹)</label>
                    <input 
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Leave blank for no offer"
                      value={planFormData.offerPrice}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, offerPrice: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Offer Badge / Tagline</label>
                    <input 
                      type="text"
                      placeholder="e.g. 20% OFF, FESTIVE SPECIAL"
                      value={planFormData.offerBadge}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, offerBadge: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="grid-col-2" style={{ marginTop: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Offer Start Date (Optional)</label>
                    <input 
                      type="date"
                      value={planFormData.offerStartDate}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, offerStartDate: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Offer Expiration Date (Optional)</label>
                    <input 
                      type="date"
                      value={planFormData.offerEndDate}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, offerEndDate: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Part 3: Scheduled Future Price Change */}
              <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <h4 style={{ color: '#d97706', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🗓️ 3. Schedule Future Price Change</span>
                </h4>
                
                <div className="grid-col-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Scheduled Future Price (₹)</label>
                    <input 
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Future scheduled price..."
                      value={planFormData.futurePrice}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, futurePrice: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Effective Start Date</label>
                    <input 
                      type="date"
                      value={planFormData.futurePriceEffectiveDate}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, futurePriceEffectiveDate: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingPlan(null)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={planSaveLoading}
                  style={{
                    backgroundColor: '#4f46e5',
                    border: 'none',
                    color: '#fff',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: planSaveLoading ? 'not-allowed' : 'pointer',
                    opacity: planSaveLoading ? 0.7 : 1,
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  {planSaveLoading ? 'Saving Settings...' : 'Save Plan Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Workspace Profile Modal */}
      {editingTenant && (
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
                onClick={() => setEditingTenant(null)}
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

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
          <div className="modal-card" style={{ maxWidth: '680px', padding: '1.75rem', overflowY: 'auto', backgroundColor: '#ffffff', color: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>
                ➕ Create New Workspace (Cash/Offline payment)
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
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

            <form onSubmit={handleCreateTenantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
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
                      <option value="1_MONTH">Monthly Starter (₹999)</option>
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
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
};

const thStyle: React.CSSProperties = {
  padding: '1rem 1.25rem',
  fontWeight: 700,
  color: '#475569'
};

const tdStyle: React.CSSProperties = {
  padding: '1.25rem',
  verticalAlign: 'top',
  color: '#0f172a'
};
