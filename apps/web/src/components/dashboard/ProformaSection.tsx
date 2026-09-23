import React from 'react';
import { type ProformaInvoice } from '@procash-invoices/database';
import { ViewMode } from './types';
import { formatDate, formatCurrency } from './utils';

interface ProformaSectionProps {
  viewMode: ViewMode;
  loadingProformas: boolean;
  proformas: ProformaInvoice[];
  onOpenCreateModal: () => void;
  onSetPrintDoc: (doc: ProformaInvoice) => void;
  onDownloadHtml: (doc: ProformaInvoice) => void;
  onOpenEditModal: (doc: ProformaInvoice) => void;
  onDeleteDoc: (id: string) => void;
  onConvertProforma: (id: string) => void;
}

export const ProformaSection: React.FC<ProformaSectionProps> = ({
  viewMode,
  loadingProformas,
  proformas,
  onOpenCreateModal,
  onSetPrintDoc,
  onDownloadHtml,
  onOpenEditModal,
  onDeleteDoc,
  onConvertProforma
}) => {
  return (
    <div>
      <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><span style={{ color: 'var(--warning)' }}>●</span> {viewMode === 'daily' ? "Today's Proformas" : "Proformas Archive"}</span>
        <button className="btn-create" onClick={onOpenCreateModal}>+ Create</button>
      </h2>
      <div className="document-list">
        <div className="list-header">
          <span>Proforma #</span>
          <span>Client</span>
          <span>Valid Until</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {loadingProformas ? (
          <div className="empty-state">Loading proforma invoices...</div>
        ) : proformas.length === 0 ? (
          <div className="empty-state">{viewMode === 'daily' ? "No proforma invoices created today." : "No proforma invoices found in history."}</div>
        ) : (
          proformas.map((p: ProformaInvoice) => {
            const id = p.id || (p as any)._id;
            return (
              <div key={id || p.documentNumber || p.proformaNumber} className="list-row">
                <span className="doc-number">{p.documentNumber || p.proformaNumber}</span>
                <div className="client-info">
                  <span className="client-name">{p.clientInfo.name}</span>
                  <span className="client-email">{p.clientInfo.email}</span>
                </div>
                <span className="doc-date">{formatDate(p.validUntil)}</span>
                <span className="doc-amount">{formatCurrency(p.totalAmount)}</span>
                <div>
                  <span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn-print" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }} title="View Proforma" onClick={() => onSetPrintDoc(p)}>👁️</button>
                    <button className="btn-print" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} title="Download HTML" onClick={() => onDownloadHtml(p)}>📥</button>
                    <button className="btn-status-action text-info" title="Edit Proforma" onClick={() => onOpenEditModal(p)}>✏️</button>
                    <button className="btn-status-action text-danger" title="Delete Proforma" onClick={() => onDeleteDoc(id)}>🗑️</button>
                    {p.status !== 'CONVERTED' && (
                      <button className="btn-status-action text-success" title="Confirm Payment & Convert to Invoice" onClick={() => onConvertProforma(id)}>✅</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
