import React from 'react';
import { type FinalInvoice } from '@procash-invoices/database';
import { ViewMode } from './types';
import { formatDate, formatCurrency } from './utils';

interface InvoicesSectionProps {
  viewMode: ViewMode;
  loadingInvoices: boolean;
  invoices: FinalInvoice[];
  onOpenCreateModal: () => void;
  onSetPrintDoc: (doc: FinalInvoice) => void;
  onDownloadHtml: (doc: FinalInvoice) => void;
  onOpenEditModal: (doc: FinalInvoice) => void;
  onDeleteDoc: (id: string) => void;
  onRecordPayment: (i: FinalInvoice) => void;
}

export const InvoicesSection: React.FC<InvoicesSectionProps> = ({
  viewMode,
  loadingInvoices,
  invoices,
  onOpenCreateModal,
  onSetPrintDoc,
  onDownloadHtml,
  onOpenEditModal,
  onDeleteDoc,
  onRecordPayment
}) => {
  return (
    <div>
      <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><span style={{ color: 'var(--primary)' }}>●</span> {viewMode === 'daily' ? "Today's Final Invoices" : "Final Invoices Archive"}</span>
        <button className="btn-create" onClick={onOpenCreateModal}>+ Create</button>
      </h2>
      <div className="document-list">
        <div className="list-header">
          <span>Invoice #</span>
          <span>Client</span>
          <span>Due Date</span>
          <span>Amount & Paid</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {loadingInvoices ? (
          <div className="empty-state">Loading final invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">{viewMode === 'daily' ? "No final invoices created today." : "No final invoices found in history."}</div>
        ) : (
          invoices.map((i: FinalInvoice) => {
            const id = i.id || (i as any)._id;
            const paidAmt = (i as any).paidAmount || 0;
            return (
              <div key={id || i.documentNumber || i.invoiceNumber} className="list-row">
                <span className="doc-number">{i.documentNumber || i.invoiceNumber}</span>
                <div className="client-info">
                  <span className="client-name">{i.clientInfo.name}</span>
                  <span className="client-email">{i.clientInfo.email}</span>
                </div>
                <span className="doc-date">{formatDate(i.dueDate)}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="doc-amount">{formatCurrency(i.totalAmount)}</span>
                  <span style={{ fontSize: '0.75rem', color: paidAmt >= i.totalAmount ? '#34d399' : paidAmt > 0 ? '#fbbf24' : '#94a3b8' }}>
                    Paid: {formatCurrency(paidAmt)}
                  </span>
                </div>
                <div>
                  <span className={`status-badge ${(i.paymentStatus || i.status).toLowerCase()}`}>
                    {i.paymentStatus || i.status}
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button className="btn-print" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }} title="View Invoice" onClick={() => onSetPrintDoc(i)}>👁️</button>
                    <button className="btn-print" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} title="Download HTML" onClick={() => onDownloadHtml(i)}>📥</button>
                    <button className="btn-status-action text-info" title="Edit Invoice" onClick={() => onOpenEditModal(i)}>✏️</button>
                    <button className="btn-status-action text-danger" title="Delete Invoice" onClick={() => onDeleteDoc(id)}>🗑️</button>
                    <button
                      className="btn-status-action"
                      style={{ color: '#a855f7' }}
                      title="Record Payment against Invoice"
                      onClick={() => onRecordPayment(i)}
                    >
                      💳
                    </button>
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
