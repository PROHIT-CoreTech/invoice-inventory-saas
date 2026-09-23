import React from 'react';
import { PendingPayment } from './types';
import {
  getPlanLabel as defaultGetPlanLabel,
  formatDateTime as defaultFormatDateTime
} from './utils';

interface PendingPaymentsTableProps {
  pendingPayments: PendingPayment[];
  getPlanLabel?: (planId?: string) => string;
  formatDateTime?: (dateStr?: string | null) => string;
  actionLoadingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const thStyle: React.CSSProperties = {
  padding: '0.85rem 1rem',
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tdStyle: React.CSSProperties = {
  padding: '1rem',
  verticalAlign: 'top'
};

export const PendingPaymentsTable: React.FC<PendingPaymentsTableProps> = ({
  pendingPayments,
  getPlanLabel = defaultGetPlanLabel,
  formatDateTime = defaultFormatDateTime,
  actionLoadingId,
  onApprove,
  onReject
}) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflowX: 'auto',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
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
            pendingPayments.map((p) => {
              const paymentId = (p as any)._id || p.id;
              return (
                <tr key={paymentId} style={{ borderBottom: '1px solid #e2e8f0' }}>
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
                  <td style={tdStyle}>{formatDateTime(p.submittedAt)}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        disabled={actionLoadingId === paymentId}
                        onClick={() => onApprove(paymentId)}
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
                        {actionLoadingId === paymentId ? 'Processing...' : 'Approve ✅'}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === paymentId}
                        onClick={() => onReject(paymentId)}
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
