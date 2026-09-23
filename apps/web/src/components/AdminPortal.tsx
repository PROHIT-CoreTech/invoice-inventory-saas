import React, { useState } from 'react';
import { Tenant, SubscriptionPlanConfig, PendingPayment, RevenueAnalytics } from './admin/types';
import PasswordModal from './admin/PasswordModal';
import { AdminHeader } from './admin/AdminHeader';
import { AdminStats } from './admin/AdminStats';
import { TenantsTable } from './admin/TenantsTable';
import { PendingPaymentsTable } from './admin/PendingPaymentsTable';
import { SubscriptionPlansManager } from './admin/SubscriptionPlansManager';
import { AdminRevenueDashboard } from './admin/AdminRevenueDashboard';
import EditPlanModal from './admin/EditPlanModal';
import EditTenantModal from './admin/EditTenantModal';
import CreateTenantModal from './admin/CreateTenantModal';

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
  const [activeTab, setActiveTab] = useState<'WORKSPACES' | 'PENDING_PAYMENTS' | 'PRICING' | 'REVENUE'>('WORKSPACES');
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanConfig[]>([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
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
    futurePriceEffectiveDate: '',
    isActive: true
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

  // Edit Workspace Profile States
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

    // 4. Fetch Revenue Analytics & Audit Ledger
    fetchRevenueData(adminPassword);
  };

  const fetchRevenueData = async (adminPassword = password) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const revenueUrl = `${baseUrl}/admin/revenue?password=${encodeURIComponent(adminPassword)}`;
    setRevenueLoading(true);
    try {
      const res = await fetch(revenueUrl);
      if (res.ok) {
        const data = await res.json();
        setRevenueAnalytics(data);
      }
    } catch (e) {
      console.error('Failed to fetch revenue analytics:', e);
    } finally {
      setRevenueLoading(false);
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

  const handleOpenEditPlan = (plan: SubscriptionPlanConfig) => {
    setEditingPlan(plan);
    setPlanSaveError('');
    setPlanSaveSuccess('');
    
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
      futurePriceEffectiveDate: formatDateInput(plan.futurePriceEffectiveDate),
      isActive: plan.isActive !== undefined ? Boolean(plan.isActive) : true
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
          futurePrice: planFormData.futurePrice ? parseFloat(planFormData.futurePrice) : null,
          isActive: Boolean(planFormData.isActive)
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
      <PasswordModal 
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        error={error}
        onSubmit={handleLogin}
        onClose={onClose}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: "'Outfit', 'Inter', sans-serif"
    }}>
      <AdminHeader 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingPayments.length}
        plansCount={subscriptionPlans.length}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onClose={onClose}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <AdminStats 
          tenants={tenants}
          pendingPayments={pendingPayments}
        />

        {activeTab === 'WORKSPACES' && (
          <TenantsTable 
            tenants={filteredTenants}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            subscriptionPlans={subscriptionPlans}
            onEditClick={handleEditClick}
          />
        )}

        {activeTab === 'PENDING_PAYMENTS' && (
          <PendingPaymentsTable 
            pendingPayments={pendingPayments}
            actionLoadingId={actionLoadingId}
            onApprove={handleApprovePayment}
            onReject={handleRejectPayment}
          />
        )}

        {activeTab === 'PRICING' && (
          <SubscriptionPlansManager 
            subscriptionPlans={subscriptionPlans}
            actionLoadingId={actionLoadingId}
            onOpenEditPlan={handleOpenEditPlan}
            onApplyFuturePrice={handleApplyFuturePrice}
            onClearOffer={handleClearOffer}
          />
        )}

        {activeTab === 'REVENUE' && (
          <AdminRevenueDashboard
            analytics={revenueAnalytics}
            loading={revenueLoading}
            onRefresh={() => fetchRevenueData()}
          />
        )}
      </main>

      {editingPlan && (
        <EditPlanModal 
          editingPlan={editingPlan}
          planFormData={planFormData}
          setPlanFormData={setPlanFormData}
          planSaveLoading={planSaveLoading}
          planSaveError={planSaveError}
          planSaveSuccess={planSaveSuccess}
          onClose={() => setEditingPlan(null)}
          onSubmit={handleSavePlanSubmit}
        />
      )}

      {editingTenant && (
        <EditTenantModal 
          editingTenant={editingTenant}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          isSaving={isSaving}
          saveError={saveError}
          onClose={() => setEditingTenant(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {isCreateModalOpen && (
        <CreateTenantModal 
          newTenant={newTenant}
          setNewTenant={setNewTenant}
          createLoading={createLoading}
          createError={createError}
          createSuccess={createSuccess}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTenantSubmit}
        />
      )}
    </div>
  );
}
