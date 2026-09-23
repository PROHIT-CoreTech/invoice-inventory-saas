import React from 'react';
import { type Quotation, type ProformaInvoice, type FinalInvoice } from '@procash-invoices/database';
import { formatDate, formatCurrency } from '../utils';

interface ExcelPreviewModalProps {
  excelPreviewTab: 'Quotations' | 'Proformas' | 'Final Invoices';
  setExcelPreviewTab: (tab: 'Quotations' | 'Proformas' | 'Final Invoices') => void;
  quotations: Quotation[];
  proformas: ProformaInvoice[];
  invoices: FinalInvoice[];
  onExportToExcel: () => void;
  onClose: () => void;
}

export const ExcelPreviewModal: React.FC<ExcelPreviewModalProps> = ({
  excelPreviewTab,
  setExcelPreviewTab,
  quotations,
  proformas,
  invoices,
  onExportToExcel,
  onClose
}) => {
  const renderTableData = () => {
    if (excelPreviewTab === 'Quotations') {
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Quote #</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Client Name</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Client Email</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Valid Until</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>Total Amount</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>No quotations recorded</td></tr>
            ) : (
              quotations.map((q: Quotation) => (
                <tr key={q.id || (q as any)._id}>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 600 }}>{q.documentNumber || q.quoteNumber}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#334155' }}>{q.clientInfo?.name}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#64748b' }}>{q.clientInfo?.email || 'N/A'}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#334155' }}>{formatDate(q.validUntil)}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(q.totalAmount)}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <span className={`status-badge ${q.status.toLowerCase()}`}>{q.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    } else if (excelPreviewTab === 'Proformas') {
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Proforma #</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Client Name</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Client Email</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Valid Until</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>Total Amount</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {proformas.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>No proformas recorded</td></tr>
            ) : (
              proformas.map((p: ProformaInvoice) => (
                <tr key={p.id || (p as any)._id}>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 600 }}>{p.documentNumber || p.proformaNumber}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#334155' }}>{p.clientInfo?.name}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#64748b' }}>{p.clientInfo?.email || 'N/A'}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#334155' }}>{formatDate(p.validUntil)}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(p.totalAmount)}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    } else {
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Invoice #</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Client Name</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Client Email</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Due Date</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>Total Amount</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>Paid Amount</th>
              <th style={{ padding: '0.75rem 1rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>No final invoices recorded</td></tr>
            ) : (
              invoices.map((i: FinalInvoice) => (
                <tr key={i.id || (i as any)._id}>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 600 }}>{i.documentNumber || i.invoiceNumber}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#334155' }}>{i.clientInfo?.name}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#64748b' }}>{i.clientInfo?.email || 'N/A'}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', color: '#334155' }}>{formatDate(i.dueDate)}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(i.totalAmount)}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700, color: '#059669' }}>{formatCurrency((i as any).paidAmount || 0)}</td>
                  <td style={{ padding: '0.65rem 1rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <span className={`status-badge ${(i.paymentStatus || i.status).toLowerCase()}`}>{i.paymentStatus || i.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-card" style={{ width: '90%', maxWidth: '1200px', height: '80vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: 0 }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Excel Spreadsheet Live Preview
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={onExportToExcel}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              📥 Export .xlsx
            </button>
            <button type="button" className="btn-close" style={{ color: '#94a3b8' }} onClick={onClose}>&times;</button>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {(['Quotations', 'Proformas', 'Final Invoices'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setExcelPreviewTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: excelPreviewTab === tab ? '#0f172a' : 'transparent',
                color: excelPreviewTab === tab ? '#3b82f6' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                borderTop: excelPreviewTab === tab ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.15s'
              }}
            >
              📁 {tab}
            </button>
          ))}
        </div>

        {/* Modal Body / Spreadsheet View */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {renderTableData()}
          </div>
        </div>
      </div>
    </div>
  );
};
