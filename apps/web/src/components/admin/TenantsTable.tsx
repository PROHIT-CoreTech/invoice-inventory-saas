import React from 'react';
import { Tenant, SubscriptionPlanConfig } from './types';
import {
  getPlanLabel as defaultGetPlanLabel,
  getPlanPrice as defaultGetPlanPrice,
  getEffectiveStatus as defaultGetEffectiveStatus,
  formatDateTime as defaultFormatDateTime,
  formatDate as defaultFormatDate,
  getTenantUrl as defaultGetTenantUrl
} from './utils';

interface TenantsTableProps {
  tenants: Tenant[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  subscriptionPlans?: SubscriptionPlanConfig[];
  getPlanLabel?: (planId?: string) => string;
  getPlanPrice?: (planId?: string) => string;
  getEffectiveStatus?: (t: Tenant) => string;
  formatDateTime?: (dateStr?: string | null) => string;
  formatDate?: (dateStr?: string | null) => string;
  getTenantUrl?: (tenantId: string) => string;
  onEditClick: (tenant: Tenant) => void;
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

export const TenantsTable: React.FC<TenantsTableProps> = ({
  tenants,
  searchQuery,
  setSearchQuery,
  subscriptionPlans = [],
  getPlanLabel = defaultGetPlanLabel,
  getPlanPrice = (planId) => defaultGetPlanPrice(planId, subscriptionPlans),
  getEffectiveStatus = defaultGetEffectiveStatus,
  formatDateTime = defaultFormatDateTime,
  formatDate = defaultFormatDate,
  getTenantUrl = defaultGetTenantUrl,
  onEditClick
}) => {
  const filteredTenants = tenants.filter(t =>
    t.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.proprietorName && t.proprietorName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '450px' }}>
          <input
            type="text"
            placeholder="Search workspaces by subdomain, company name, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.25rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            🔍
          </span>
        </div>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Showing <strong>{filteredTenants.length}</strong> of {tenants.length} workspaces
        </span>
      </div>

      {/* Table Container */}
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
              <th style={thStyle}>Workspace / Subdomain</th>
              <th style={thStyle}>Company Details</th>
              <th style={thStyle}>Tax Identifiers</th>
              <th style={thStyle}>Bank Account</th>
              <th style={thStyle}>Assets</th>
              <th style={thStyle}>Subscription</th>
              <th style={thStyle}>Created On</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No workspace tenants match your search criteria.
                </td>
              </tr>
            ) : (
              filteredTenants.map((t) => (
                <tr key={t.id || t.tenantId} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff' }}>
                  {/* Workspace / Subdomain */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <strong style={{ color: '#4f46e5', fontSize: '0.95rem' }}>{t.tenantId}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{getTenantUrl(t.tenantId)}</span>
                    </div>
                  </td>

                  {/* Company Details */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.companyName}</div>
                      {t.proprietorName && (
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                          Proprietor: {t.proprietorName}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {t.address}
                      </div>
                      <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.35rem' }}>
                        <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>
                          🎨 {t.theme || 'DEFAULT'}
                        </span>
                        <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>
                          👑 {t.tier || 'FREE'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Tax Identifiers */}
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
                    {!t.gstin && !t.pan && <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}
                  </td>

                  {/* Bank Details */}
                  <td style={tdStyle}>
                    {t.bankName ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.bankName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>Holder: {t.bankAccHolder}</div>
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

                  {/* Assets */}
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
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{getPlanLabel(t.subscriptionPlan)}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Amount: </span>
                        <span style={{ color: '#334155', fontWeight: 600 }}>{getPlanPrice(t.subscriptionPlan)}</span>
                      </div>
                      {(() => {
                        const effStatus = getEffectiveStatus(t);
                        const isActive = effStatus === 'ACTIVE';
                        const isExpired = effStatus === 'EXPIRED';
                        return (
                          <>
                            <div>
                              <span style={{ color: '#64748b', fontWeight: 600 }}>Status: </span>
                              <span
                                style={{
                                  backgroundColor: isActive ? '#d1fae5' : isExpired ? '#fee2e2' : '#f1f5f9',
                                  color: isActive ? '#065f46' : isExpired ? '#991b1b' : '#475569',
                                  border: isActive ? '1px solid #a7f3d0' : isExpired ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700
                                }}
                              >
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
                  <td style={tdStyle}>{formatDate(t.createdAt)}</td>

                  {/* Actions */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
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
                          width: '120px',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                      >
                        Open ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => onEditClick(t)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '0.45rem 1rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          width: '120px',
                          textAlign: 'center',
                          boxSizing: 'border-box'
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
  );
};
