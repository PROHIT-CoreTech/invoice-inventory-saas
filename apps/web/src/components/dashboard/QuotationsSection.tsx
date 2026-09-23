import React from 'react';
import { type Quotation } from '@procash-invoices/database';
import { ViewMode } from './types';
import { formatDate, formatCurrency } from './utils';

interface QuotationsSectionProps {
  viewMode: ViewMode;
  loadingQuotes: boolean;
  quotations: Quotation[];
  onOpenCreateModal: () => void;
  onSetPrintDoc: (doc: Quotation) => void;
  onDownloadHtml: (doc: Quotation) => void;
  onOpenEditModal: (doc: Quotation) => void;
  onDeleteDoc: (id: string) => void;
  onConvertQuote: (id: string) => void;
  onUpdateQuoteStatus: (id: string, status: 'ACCEPTED' | 'DECLINED') => void;
}

export const QuotationsSection: React.FC<QuotationsSectionProps> = ({
  viewMode,
  loadingQuotes,
  quotations,
  onOpenCreateModal,
  onSetPrintDoc,
  onDownloadHtml,
  onOpenEditModal,
  onDeleteDoc,
  onConvertQuote,
  onUpdateQuoteStatus
}) => {
  return (
    <div>
      <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><span style={{ color: 'var(--info)' }}>●</span> {viewMode === 'daily' ? "Today's Quotations" : "Quotations Archive"}</span>
        <button className="btn-create" onClick={onOpenCreateModal}>+ Create</button>
      </h2>
      <div className="document-list">
        <div className="list-header">
          <span>Quote #</span>
          <span>Client</span>
          <span>Valid Until</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {loadingQuotes ? (
          <div className="empty-state">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="empty-state">{viewMode === 'daily' ? "No quotations created today." : "No quotations found in history."}</div>
        ) : (
          quotations.map((q: Quotation) => {
            const id = q.id || (q as any)._id;
            return (
              <div key={id || q.documentNumber || q.quoteNumber} className="list-row">
                <span className="doc-number">{q.documentNumber || q.quoteNumber}</span>
                <div className="client-info">
                  <span className="client-name">{q.clientInfo.name}</span>
                  <span className="client-email">{q.clientInfo.email}</span>
                </div>
                <span className="doc-date">{formatDate(q.validUntil)}</span>
                <span className="doc-amount">{formatCurrency(q.totalAmount)}</span>
                <div>
                  <span className={`status-badge ${q.status.toLowerCase()}`}>{q.status}</span>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn-print" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }} title="View Quotation" onClick={() => onSetPrintDoc(q)}>👁️</button>
                    <button className="btn-print" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} title="Download HTML" onClick={() => onDownloadHtml(q)}>📥</button>
                    <button className="btn-status-action text-info" title="Edit Quotation" onClick={() => onOpenEditModal(q)}>✏️</button>
                    <button className="btn-status-action text-danger" title="Delete Quotation" onClick={() => onDeleteDoc(id)}>🗑️</button>
                    {q.status !== 'CONVERTED' && q.status !== 'DECLINED' && (
                      <>
                        <button className="btn-status-action text-success" title="Accept & Convert to Proforma" onClick={() => onConvertQuote(id)}>✅</button>
                        <button className="btn-status-action text-danger" title="Decline Quote" onClick={() => onUpdateQuoteStatus(id, 'DECLINED')}>❌</button>
                      </>
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
