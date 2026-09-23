import React from 'react';

interface AdminHeaderProps {
  activeTab: 'WORKSPACES' | 'PENDING_PAYMENTS' | 'PRICING' | 'REVENUE';
  setActiveTab: (tab: 'WORKSPACES' | 'PENDING_PAYMENTS' | 'PRICING' | 'REVENUE') => void;
  pendingCount: number;
  tenantsCount?: number;
  plansCount: number;
  onRefresh?: () => void;
  onOpenCreateModal: () => void;
  onChangePassword?: () => void;
  onClose: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  tenantsCount,
  plansCount,
  onRefresh,
  onOpenCreateModal,
  onChangePassword,
  onClose
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
      {/* Top Title & Quick Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              System Admin Control Center
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Manage workspace tenants, verify UTR payments, and configure subscription pricing & promotional offers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onRefresh}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            🔄 Refresh Data
          </button>
          <button
            type="button"
            onClick={onOpenCreateModal}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none',
              color: '#ffffff',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            + Create Workspace
          </button>
          <button
            type="button"
            onClick={onChangePassword}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#475569',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🔑 Change Password
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#ef4444',
              border: 'none',
              color: '#ffffff',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Exit Admin ×
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('WORKSPACES')}
          style={{
            backgroundColor: activeTab === 'WORKSPACES' ? '#4f46e5' : 'transparent',
            color: activeTab === 'WORKSPACES' ? '#ffffff' : '#64748b',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🏢 Workspaces Directory ({tenantsCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PENDING_PAYMENTS')}
          style={{
            backgroundColor: activeTab === 'PENDING_PAYMENTS' ? '#4f46e5' : 'transparent',
            color: activeTab === 'PENDING_PAYMENTS' ? '#ffffff' : '#64748b',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s'
          }}
        >
          💳 Pending UTR Verifications
          {pendingCount > 0 && (
            <span
              style={{
                marginLeft: '0.5rem',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                fontWeight: 800
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PRICING')}
          style={{
            backgroundColor: activeTab === 'PRICING' ? '#4f46e5' : 'transparent',
            color: activeTab === 'PRICING' ? '#ffffff' : '#64748b',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🏷️ Subscription Pricing & Offers ({plansCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REVENUE')}
          style={{
            backgroundColor: activeTab === 'REVENUE' ? '#4f46e5' : 'transparent',
            color: activeTab === 'REVENUE' ? '#ffffff' : '#64748b',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📊 Revenue & Analytics
        </button>
      </div>
    </div>
  );
};
