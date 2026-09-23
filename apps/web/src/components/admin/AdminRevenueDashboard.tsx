import React, { useState } from 'react';
import { RevenueAnalytics, SubscriptionHistoryRecord } from './types';
import { formatDate, formatDateTime } from './utils';

interface AdminRevenueDashboardProps {
  analytics: RevenueAnalytics | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AdminRevenueDashboard: React.FC<AdminRevenueDashboardProps> = ({
  analytics,
  loading,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ fontWeight: 600 }}>Loading Revenue Analytics & Transaction Ledger...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Revenue Data Found</h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Unable to load revenue metrics. Try refreshing.</p>
        <button
          onClick={onRefresh}
          style={{
            marginTop: '0.75rem',
            backgroundColor: '#4f46e5',
            color: '#fff',
            border: 'none',
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  const { totalRevenue, mrr, activePayingCount, freeTrialCount, arpu, revenueByPlan, subscriptionLogs } = analytics;

  const filteredLogs = subscriptionLogs.filter(log => {
    const matchesStatus = filterStatus === 'ALL' || log.paymentStatus === filterStatus;
    const matchesSearch =
      log.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.utrNumber && log.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* Total Revenue */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '1.35rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
            border: '1px solid #334155'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL REVENUE COLLECTED
            </span>
            <span style={{ fontSize: '1.2rem' }}>💰</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.35rem', fontWeight: 500 }}>
            Lifetime verified subscription payments
          </div>
        </div>

        {/* MRR */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '1.35rem',
            boxShadow: '0 4px 20px rgba(79, 70, 229, 0.2)',
            border: '1px solid #6366f1'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ESTIMATED MRR
            </span>
            <span style={{ fontSize: '1.2rem' }}>📈</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
            ₹{Math.round(mrr).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#e0e7ff', marginTop: '0.35rem', fontWeight: 500 }}>
            Monthly recurring run rate
          </div>
        </div>

        {/* Active Paying Tenants */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.35rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ACTIVE PAYING WORKSPACES
            </span>
            <span style={{ fontSize: '1.2rem' }}>🏢</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
            {activePayingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            + {freeTrialCount} active free trial users
          </div>
        </div>

        {/* ARPU */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1.35rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AVG REVENUE PER USER (ARPU)
            </span>
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
            ₹{Math.round(arpu).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            Average value per customer
          </div>
        </div>
      </div>

      {/* Plan Revenue Distribution */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
          🏷️ Revenue Distribution by Plan Tier
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {revenueByPlan.map((plan) => {
            const percentage = totalRevenue > 0 ? Math.round((plan.totalAmount / totalRevenue) * 100) : 0;
            return (
              <div
                key={plan.planId}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{plan.planName}</span>
                  <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.9rem' }}>
                    ₹{plan.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  <span>{plan.count} subscription{plan.count !== 1 ? 's' : ''}</span>
                  <span>{percentage}% of total</span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', backgroundColor: '#cbd5e1', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: '#6366f1',
                      height: '100%',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Audit Ledger Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              📜 Subscription Payment Audit Ledger
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Historical payment transactions with locked purchase amounts
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by subdomain, plan, or UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '220px'
              }}
            />

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="MANUAL_GRANT">Manual Grant</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Workspace</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Plan</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount Paid</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment Ref / Mode</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment Date</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Expiry Date</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    No subscription transaction records match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isVerified = log.paymentStatus === 'VERIFIED' || log.paymentStatus === 'MANUAL_GRANT';
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#4f46e5' }}>
                        {log.tenantId}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                        {log.planName}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#059669' }}>
                        ₹{log.amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.8rem' }}>
                        <div>{log.paymentMode || 'ONLINE'}</div>
                        {log.utrNumber && (
                          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                            UTR: {log.utrNumber}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                        {formatDate(log.startDate || log.createdAt)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                        {formatDate(log.endDate)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            backgroundColor: isVerified ? '#d1fae5' : '#fee2e2',
                            color: isVerified ? '#065f46' : '#991b1b',
                            border: isVerified ? '1px solid #a7f3d0' : '1px solid #fca5a5',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 800
                          }}
                        >
                          {log.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
