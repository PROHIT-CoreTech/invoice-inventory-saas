import React from 'react';
import { Tenant, PendingPayment } from './types';

interface AdminStatsProps {
  tenants: Tenant[];
  pendingPayments: PendingPayment[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({ tenants, pendingPayments }) => {
  const activeTenants = tenants.filter(t => t.subscriptionStatus === 'ACTIVE').length;
  const trialTenants = tenants.filter(t => t.subscriptionPlan === 'TRIAL').length;
  const pendingCount = pendingPayments.filter(p => p.verificationStatus === 'PENDING').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL WORKSPACES</span>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem' }}>{tenants.length}</div>
        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Active registered subdomains</span>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIVE SUBSCRIPTIONS</span>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4f46e5', marginTop: '0.35rem' }}>{activeTenants}</div>
        <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>Paid & verified workspaces</span>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FREE TRIALS</span>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#059669', marginTop: '0.35rem' }}>{trialTenants}</div>
        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>10-day test drive workspaces</span>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PENDING UTR APPROVALS</span>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: pendingCount > 0 ? '#ef4444' : '#10b981', marginTop: '0.35rem' }}>{pendingCount}</div>
        <span style={{ fontSize: '0.75rem', color: pendingCount > 0 ? '#ef4444' : '#64748b', fontWeight: 600 }}>
          {pendingCount > 0 ? 'Action required for verification' : 'All payment submissions cleared'}
        </span>
      </div>
    </div>
  );
};
