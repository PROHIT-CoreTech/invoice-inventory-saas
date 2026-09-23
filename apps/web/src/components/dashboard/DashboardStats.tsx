import React from 'react';
import { ViewMode } from './types';
import { formatCurrency } from './utils';

interface DashboardStatsProps {
  viewMode: ViewMode;
  activeQuoteCount: number;
  activeProformaCount: number;
  activeInvoiceCount: number;
  activeQuoteVolume: number;
  activeProformaVolume: number;
  activeInvoiceVolume: number;
  quoteCurrency?: string;
  proformaCurrency?: string;
  invoiceCurrency?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  viewMode,
  activeQuoteCount,
  activeProformaCount,
  activeInvoiceCount,
  activeQuoteVolume,
  activeProformaVolume,
  activeInvoiceVolume,
  quoteCurrency = 'INR',
  proformaCurrency = 'INR',
  invoiceCurrency = 'INR'
}) => {
  return (
    <section className="stats-grid">
      <div className="stat-card quotation">
        <div className="stat-header">
          <span>Quotations</span>
          <span style={{ color: 'var(--info)' }}>{activeQuoteCount} {viewMode === 'daily' ? 'Today' : 'Total'}</span>
        </div>
        <div className="stat-value">{formatCurrency(activeQuoteVolume)}</div>
        <div className="stat-footer">{viewMode === 'daily' ? "Today's pipe volume" : "Estimated sales pipe volume"}</div>
      </div>

      <div className="stat-card proforma">
        <div className="stat-header">
          <span>Proforma Invoices</span>
          <span style={{ color: 'var(--warning)' }}>{activeProformaCount} {viewMode === 'daily' ? 'Today' : 'Total'}</span>
        </div>
        <div className="stat-value">{formatCurrency(activeProformaVolume)}</div>
        <div className="stat-footer">{viewMode === 'daily' ? "Today's pending" : "Awaiting confirmations"}</div>
      </div>

      <div className="stat-card invoice">
        <div className="stat-header">
          <span>Final Invoices</span>
          <span style={{ color: 'var(--primary)' }}>{activeInvoiceCount} {viewMode === 'daily' ? 'Today' : 'Total'}</span>
        </div>
        <div className="stat-value">{formatCurrency(activeInvoiceVolume)}</div>
        <div className="stat-footer">{viewMode === 'daily' ? "Today's revenue" : "Total billed revenue"}</div>
      </div>
    </section>
  );
};
