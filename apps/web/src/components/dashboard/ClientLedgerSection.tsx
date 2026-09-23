import React from 'react';
import { Client } from './types';

interface ClientLedgerSectionProps {
  selectedLedgerClientId: string;
  setSelectedLedgerClientId: (id: string) => void;
  clients: Client[];
  ledgerData: any;
  loadingLedger: boolean;
  onOpenRecordPayment: () => void;
}

export const ClientLedgerSection: React.FC<ClientLedgerSectionProps> = ({
  selectedLedgerClientId,
  setSelectedLedgerClientId,
  clients,
  ledgerData,
  loadingLedger,
  onOpenRecordPayment
}) => {
  const handleExportCsv = () => {
    if (!ledgerData) return;
    const headers = ['Date', 'Type', 'Ref / Doc No', 'Notes', 'Debit (+Billed)', 'Credit (-Paid)', 'Running Balance'];
    const rows = (ledgerData.entries || []).map((e: any) => [
      e.date ? new Date(e.date).toLocaleDateString() : '',
      e.type || '',
      e.documentNumber || e.referenceNo || '-',
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      e.debit || 0,
      e.credit || 0,
      e.runningBalance || 0
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeClientName = (ledgerData.client?.name || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Ledger_${safeClientName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="client-ledger-section" style={{ marginTop: '1.5rem' }}>
      {/* Client Selection Header & Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Client:
          </label>
          <select
            value={selectedLedgerClientId}
            onChange={(e) => setSelectedLedgerClientId(e.target.value)}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#0f172a',
              padding: '0.65rem 1rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              outline: 'none',
              minWidth: '250px'
            }}
          >
            <option value="">-- Choose Client --</option>
            {clients.map((c: any) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        {selectedLedgerClientId && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onOpenRecordPayment}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
              }}
            >
              💳 + Record Payment / Advance
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📥 Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Client Summary KPI Cards */}
      {selectedLedgerClientId && ledgerData && (
        <>
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="stat-header">
                <span>Total Billed</span>
                <span style={{ color: '#2563eb' }}>Invoices</span>
              </div>
              <div className="stat-value">₹{ledgerData.summary.totalInvoiced.toLocaleString('en-IN')}</div>
              <div className="stat-footer">Gross invoices issued</div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="stat-header">
                <span>Total Paid</span>
                <span style={{ color: '#059669' }}>Collected</span>
              </div>
              <div className="stat-value">₹{ledgerData.summary.totalPaid.toLocaleString('en-IN')}</div>
              <div className="stat-footer">Payments & Advances</div>
            </div>

            <div className="stat-card" style={{ borderLeft: ledgerData.summary.netBalanceDue > 0 ? '4px solid #ef4444' : '4px solid #10b981' }}>
              <div className="stat-header">
                <span>Net Balance Due</span>
                <span style={{ color: ledgerData.summary.netBalanceDue > 0 ? '#dc2626' : '#059669' }}>
                  {ledgerData.summary.netBalanceDue > 0 ? 'Outstanding' : 'Cleared'}
                </span>
              </div>
              <div className="stat-value" style={{ color: ledgerData.summary.netBalanceDue > 0 ? '#dc2626' : '#059669' }}>
                ₹{ledgerData.summary.netBalanceDue.toLocaleString('en-IN')}
              </div>
              <div className="stat-footer">Current net client balance</div>
            </div>

            <div className="stat-card" style={{ borderLeft: '4px solid #a855f7' }}>
              <div className="stat-header">
                <span>Advance Credit</span>
                <span style={{ color: '#9333ea' }}>Unallocated</span>
              </div>
              <div className="stat-value">₹{ledgerData.summary.totalAdvance.toLocaleString('en-IN')}</div>
              <div className="stat-footer">Advance deposits on account</div>
            </div>
          </div>

          {/* Ledger Statement Table */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>📜 Transaction Ledger Statement for {ledgerData.client?.name}</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>
                {ledgerData.entries.length} Transaction Records
              </span>
            </h3>

            {loadingLedger ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading ledger entries...</div>
            ) : ledgerData.entries.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem 1rem', color: '#64748b' }}>
                No invoices or payment transactions recorded for this client yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Ref / Doc #</th>
                      <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Details / Notes</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569' }}>Debit (+Billed)</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569' }}>Credit (-Paid)</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerData.entries.map((entry: any) => (
                      <tr key={entry.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: entry.type === 'INVOICE'
                              ? '#dbeafe'
                              : entry.type === 'ADVANCE_PAYMENT'
                              ? '#f3e8ff'
                              : '#d1fae5',
                            color: entry.type === 'INVOICE'
                              ? '#1d4ed8'
                              : entry.type === 'ADVANCE_PAYMENT'
                              ? '#7e22ce'
                              : '#047857'
                          }}>
                            {entry.type === 'INVOICE' ? '🧾 FINAL INVOICE' : entry.type === 'ADVANCE_PAYMENT' ? '💳 ADVANCE' : '💵 PAYMENT'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                          {entry.documentNumber || entry.referenceNo || '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                          {entry.notes || (entry.paymentMode ? `Paid via ${entry.paymentMode}` : 'Invoice issued')}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: entry.debit > 0 ? '#dc2626' : '#94a3b8', fontWeight: entry.debit > 0 ? 600 : 400 }}>
                          {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: entry.credit > 0 ? '#059669' : '#94a3b8', fontWeight: entry.credit > 0 ? 600 : 400 }}>
                          {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: entry.runningBalance > 0 ? '#dc2626' : '#059669' }}>
                          ₹{entry.runningBalance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedLedgerClientId && (
        <div className="empty-state" style={{ padding: '4rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          Please select a client from the dropdown above to view their complete financial ledger history, advance credits, and transaction timeline.
        </div>
      )}
    </section>
  );
};
