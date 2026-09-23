import React, { useRef } from 'react';
import { type Quotation, type ProformaInvoice, type FinalInvoice } from '@procash-invoices/database';
import { generateDocumentHtml } from '@procash-invoices/document-templates';
import { TenantProfile } from '../types';
import { getDocumentData } from '../utils';
import { IframePreview } from '../../common/IframePreview';

interface PrintPreviewModalProps {
  printDoc: Quotation | ProformaInvoice | FinalInvoice | null;
  tenantProfile: TenantProfile | null;
  quotations: Quotation[];
  proformas: ProformaInvoice[];
  invoices: FinalInvoice[];
  onConvertQuote: (id: string) => void;
  onConvertQuoteToInvoiceDirect: (id: string) => void;
  onConvertProforma: (id: string) => void;
  onDownloadHtml: (doc: any) => void;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  printDoc,
  tenantProfile,
  quotations,
  proformas,
  invoices,
  onConvertQuote,
  onConvertQuoteToInvoiceDirect,
  onConvertProforma,
  onDownloadHtml,
  onClose
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!printDoc) return null;

  const docData = getDocumentData(printDoc, tenantProfile);
  const htmlContent = generateDocumentHtml(docData);

  const handlePrint = () => {
    const originalTitle = document.title;
    const docNum = printDoc.documentNumber || (printDoc as any).quoteNumber || (printDoc as any).proformaNumber || (printDoc as any).invoiceNumber || '';
    const safeNum = docNum.replace(/\//g, '-');
    if (safeNum) {
      document.title = safeNum;
    }

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        if (iframeDoc) {
          iframeDoc.title = document.title;
        }
      } catch (e) {
        console.error(e);
      }
      iframeRef.current.contentWindow.print();
    } else {
      window.print();
    }

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const renderAuditTrail = (doc: any) => {
    const history: React.ReactNode[] = [];
    const docId = doc.id || doc._id;

    if (doc.documentType === 'QUOTATION') {
      const relatedProforma: any = proformas.find((p: any) => p.quotationRef === docId);
      if (relatedProforma) {
        history.push(
          <div key="to-proforma" className="audit-trail-item">
            <span>➔ Converted to Proforma Invoice:</span> <strong>{relatedProforma.documentNumber || relatedProforma.proformaNumber}</strong>
          </div>
        );
        const relatedInvoice: any = invoices.find((i: any) => i.proformaRef === relatedProforma.id || i.proformaRef === relatedProforma._id);
        if (relatedInvoice) {
          history.push(
            <div key="to-invoice" className="audit-trail-item">
              <span>➔ Converted to Final Invoice:</span> <strong>{relatedInvoice.documentNumber || relatedInvoice.invoiceNumber}</strong>
            </div>
          );
        }
      }
    } else if (doc.documentType === 'PROFORMA') {
      const relatedQuotation: any = quotations.find((q: any) => (q.id || q._id) === doc.quotationRef);
      if (relatedQuotation) {
        history.push(
          <div key="from-quote" className="audit-trail-item">
            <span>← Converted from Quotation:</span> <strong>{relatedQuotation.documentNumber || relatedQuotation.quoteNumber}</strong>
          </div>
        );
      }
      const relatedInvoice: any = invoices.find((i: any) => i.proformaRef === docId);
      if (relatedInvoice) {
        history.push(
          <div key="to-invoice" className="audit-trail-item">
            <span>➔ Converted to Final Invoice:</span> <strong>{relatedInvoice.documentNumber || relatedInvoice.invoiceNumber}</strong>
          </div>
        );
      }
    } else if (doc.documentType === 'FINAL_INVOICE') {
      const relatedProforma: any = proformas.find((p: any) => (p.id || p._id) === doc.proformaRef);
      if (relatedProforma) {
        history.push(
          <div key="from-proforma" className="audit-trail-item">
            <span>← Converted from Proforma Invoice:</span> <strong>{relatedProforma.documentNumber || relatedProforma.proformaNumber}</strong>
          </div>
        );
        const relatedQuotation: any = quotations.find((q: any) => (q.id || q._id) === relatedProforma.quotationRef);
        if (relatedQuotation) {
          history.push(
            <div key="from-quote" className="audit-trail-item">
              <span>← Source Quotation:</span> <strong>{relatedQuotation.documentNumber || relatedQuotation.quoteNumber}</strong>
            </div>
          );
        }
      }
    }

    if (history.length === 0) return null;

    return (
      <div className="audit-trail-container no-print" style={{ padding: '1rem', margin: '0 0 1rem 0' }}>
        <h4 className="audit-trail-title" style={{ color: '#eab308', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>⛓️ Document Reference History</h4>
        <div className="audit-trail-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {history}
        </div>
      </div>
    );
  };

  const id = printDoc.id || (printDoc as any)._id;

  return (
    <div className="modal-overlay print-overlay">
      <div className="modal-card print-preview-card">
        <div className="modal-header no-print">
          <h3>Print Preview</h3>
          <button type="button" className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ background: '#f8f9fa', padding: 0 }}>
          {renderAuditTrail(printDoc)}
          <IframePreview
            ref={iframeRef}
            srcDoc={htmlContent}
          />
          <div className="print-area" style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
        <div className="modal-footer no-print">
          <button type="button" className="btn-secondary-action" onClick={onClose}>Close</button>
          {printDoc.documentType === 'QUOTATION' && printDoc.status !== 'CONVERTED' && (
            <>
              <button type="button" className="btn-primary-action" style={{ background: '#eab308', borderColor: '#eab308' }} onClick={() => onConvertQuote(id)}>
                Convert to Proforma
              </button>
              <button type="button" className="btn-primary-action" style={{ background: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => onConvertQuoteToInvoiceDirect(id)}>
                Convert to Final Invoice
              </button>
            </>
          )}
          {printDoc.documentType === 'PROFORMA' && printDoc.status !== 'CONVERTED' && (
            <button type="button" className="btn-primary-action" style={{ background: '#f97316', borderColor: '#f97316' }} onClick={() => onConvertProforma(id)}>
              Convert to Final Invoice
            </button>
          )}
          <button type="button" className="btn-primary-action" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderColor: '#059669' }} onClick={() => onDownloadHtml(printDoc)}>Download HTML</button>
          <button type="button" className="btn-primary-action" onClick={handlePrint}>Print / Save PDF</button>
        </div>
      </div>
    </div>
  );
};
