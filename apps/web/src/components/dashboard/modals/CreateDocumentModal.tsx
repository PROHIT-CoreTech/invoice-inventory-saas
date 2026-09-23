import React from 'react';
import { type Quotation, type ProformaInvoice, type FinalInvoice } from '@procash-invoices/database';
import { Client, DocumentItem } from '../types';
import { formatCurrency } from '../utils';

interface CreateDocumentModalProps {
  isOpen: boolean;
  docType: 'QUOTATION' | 'PROFORMA' | 'FINAL_INVOICE';
  editingDoc: Quotation | ProformaInvoice | FinalInvoice | null;
  docNumber: string;
  setDocNumber: (val: string) => void;
  dateVal: string;
  setDateVal: (val: string) => void;
  currency: string;
  setCurrency: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  selectedClientId: string;
  setSelectedClientId: (val: string) => void;
  clients: Client[];
  isCreatingClient: boolean;
  setIsCreatingClient: (val: boolean) => void;
  newClientData: {
    name: string;
    email: string;
    billingAddress: string;
    taxId: string;
    gstin: string;
    pan: string;
  };
  setNewClientData: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    billingAddress: string;
    taxId: string;
    gstin: string;
    pan: string;
  }>>;
  handleCreateClient: (e: React.MouseEvent) => void;
  quotationRef: string;
  setQuotationRef: (val: string) => void;
  proformaRef: string;
  setProformaRef: (val: string) => void;
  importSource: 'NONE' | 'QUOTATION' | 'PROFORMA';
  handleImportSourceChange: (source: 'NONE' | 'QUOTATION' | 'PROFORMA') => void;
  handleImportQuotation: (qId: string) => void;
  handleImportProforma: (pId: string) => void;
  quotations: Quotation[];
  proformas: ProformaInvoice[];
  items: DocumentItem[];
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
  handleItemChange: (index: number, field: string, value: any) => void;
  getItemQty: (qty: number | undefined) => number;
  formSubTotal: number;
  formTaxAmount: number;
  formTotalAmount: number;
  initialPayment: number;
  setInitialPayment: (val: number) => void;
  initialPaymentMode: string;
  setInitialPaymentMode: (val: string) => void;
  initialPaymentRef: string;
  setInitialPaymentRef: (val: string) => void;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  docType,
  editingDoc,
  docNumber,
  setDocNumber,
  dateVal,
  setDateVal,
  currency,
  setCurrency,
  notes,
  setNotes,
  selectedClientId,
  setSelectedClientId,
  clients,
  isCreatingClient,
  setIsCreatingClient,
  newClientData,
  setNewClientData,
  handleCreateClient,
  quotationRef,
  setQuotationRef,
  proformaRef,
  setProformaRef,
  importSource,
  handleImportSourceChange,
  handleImportQuotation,
  handleImportProforma,
  quotations,
  proformas,
  items,
  handleAddItem,
  handleRemoveItem,
  handleItemChange,
  getItemQty,
  formSubTotal,
  formTaxAmount,
  formTotalAmount,
  initialPayment,
  setInitialPayment,
  initialPaymentMode,
  setInitialPaymentMode,
  initialPaymentRef,
  setInitialPaymentRef,
  isSaving,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            {editingDoc ? '✏️ Edit ' : '✨ Create New '}
            {docType === 'QUOTATION' ? 'Quotation' : docType === 'PROFORMA' ? 'Proforma Invoice' : 'Final Tax Invoice'}
          </h3>
          <button type="button" className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            {/* Import options */}
            {!editingDoc && (
              <div>
                {docType === 'PROFORMA' && (
                  <div className="form-group">
                    <label>Import details from Quotation</label>
                    <select
                      className="form-select"
                      value={quotationRef}
                      onChange={(e) => handleImportQuotation(e.target.value)}
                    >
                      <option value="">-- Select Quotation to Import --</option>
                      {quotations.map(q => (
                        <option key={q.id || (q as any)._id} value={q.id || (q as any)._id}>
                          {q.documentNumber || (q as any).quoteNumber} - {q.clientInfo.name} ({formatCurrency(q.totalAmount)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {docType === 'FINAL_INVOICE' && (
                  <div style={{ width: '100%', backgroundColor: 'var(--bg-card, #f8fafc)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.6rem', color: 'var(--text-main, #1e293b)' }}>
                      📥 Import Line Items & Data Source:
                    </label>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: importSource !== 'NONE' ? '1rem' : '0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="importSource"
                          value="NONE"
                          checked={importSource === 'NONE'}
                          onChange={() => handleImportSourceChange('NONE')}
                        />
                        None (Fresh Invoice)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="importSource"
                          value="QUOTATION"
                          checked={importSource === 'QUOTATION'}
                          onChange={() => handleImportSourceChange('QUOTATION')}
                        />
                        From Quotation
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="importSource"
                          value="PROFORMA"
                          checked={importSource === 'PROFORMA'}
                          onChange={() => handleImportSourceChange('PROFORMA')}
                        />
                        From Proforma Invoice
                      </label>
                    </div>

                    {importSource === 'QUOTATION' && (
                      <div className="form-group" style={{ marginTop: '0.75rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Select Quotation to Import</label>
                        <select
                          className="form-select"
                          value={quotationRef}
                          onChange={(e) => {
                            setQuotationRef(e.target.value);
                            handleImportQuotation(e.target.value);
                          }}
                        >
                          <option value="">-- Select Quotation to Import --</option>
                          {quotations.map(q => (
                            <option key={q.id || (q as any)._id} value={q.id || (q as any)._id}>
                              {q.documentNumber || (q as any).quoteNumber} - {q.clientInfo.name} ({formatCurrency(q.totalAmount)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {importSource === 'PROFORMA' && (
                      <div className="form-group" style={{ marginTop: '0.75rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Select Proforma Invoice to Import</label>
                        <select
                          className="form-select"
                          value={proformaRef}
                          onChange={(e) => {
                            setProformaRef(e.target.value);
                            handleImportProforma(e.target.value);
                          }}
                        >
                          <option value="">-- Select Proforma to Import --</option>
                          {proformas.map(p => (
                            <option key={p.id || (p as any)._id} value={p.id || (p as any)._id}>
                              {p.documentNumber || (p as any).proformaNumber} - {p.clientInfo.name} ({formatCurrency(p.totalAmount)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Client selection row */}
            <div className="form-group">
              <label>Client</label>
              {!isCreatingClient ? (
                <div className="client-selection-row">
                  <select
                    className="form-select"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map((c) => (
                      <option key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  <button className="btn-inline-action" onClick={(e) => { e.preventDefault(); setIsCreatingClient(true); }}>
                    + New Client
                  </button>
                </div>
              ) : (
                <div className="inline-client-card" style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', marginTop: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>✨ Register New Client Inline</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>Client Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        className="form-input"
                        value={newClientData.name}
                        onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>Client Email *</label>
                      <input
                        type="email"
                        placeholder="billing@acme.com"
                        className="form-input"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ marginTop: '0.5rem' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>GSTIN (15 Digits - Smart Auto-Fill)</label>
                      <input
                        type="text"
                        placeholder="e.g. 27AAAAA0000A1Z5"
                        className="form-input"
                        value={newClientData.gstin}
                        onChange={(e) => {
                          const gVal = e.target.value.toUpperCase().trim();
                          let panVal = newClientData.pan;
                          let taxIdVal = newClientData.taxId;
                          if (gVal.length >= 10) {
                            const extPan = gVal.substring(2, 12);
                            if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(extPan)) {
                              panVal = extPan;
                            }
                          }
                          if (!taxIdVal || taxIdVal === 'N/A' || taxIdVal === '') {
                            taxIdVal = gVal || 'N/A';
                          }
                          setNewClientData({
                            ...newClientData,
                            gstin: gVal,
                            pan: panVal,
                            taxId: taxIdVal
                          });
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>PAN Number (Auto-Extracted)</label>
                      <input
                        type="text"
                        placeholder="e.g. AAAAA0000A"
                        className="form-input"
                        value={newClientData.pan}
                        onChange={(e) => setNewClientData({ ...newClientData, pan: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ marginTop: '0.5rem' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>Tax ID / Reg Code *</label>
                      <input
                        type="text"
                        placeholder="Tax ID or Reg Code"
                        className="form-input"
                        value={newClientData.taxId}
                        onChange={(e) => setNewClientData({ ...newClientData, taxId: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>Billing Address *</label>
                      <input
                        type="text"
                        placeholder="Full Address, City, State"
                        className="form-input"
                        value={newClientData.billingAddress}
                        onChange={(e) => setNewClientData({ ...newClientData, billingAddress: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary-action" style={{ padding: '0.4rem 1rem' }} onClick={(e) => { e.preventDefault(); setIsCreatingClient(false); }}>
                      Cancel
                    </button>
                    <button className="btn-primary-action" style={{ padding: '0.4rem 1.25rem' }} onClick={handleCreateClient}>
                      Save Client
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Doc Details */}
            <div className="form-row">
              <div className="form-group">
                <label>Document Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{docType === 'FINAL_INVOICE' ? 'Due Date' : 'Valid Until'}</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Currency</label>
                <select
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Thank you for your business"
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="items-section-title">Line Items</div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', marginBottom: '1.25rem' }}>
              <table className="items-table" style={{ minWidth: '700px', margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '32%' }}>Description *</th>
                    <th style={{ width: '13%' }}>HSN/SAC</th>
                    <th style={{ width: '10%' }}>Qty</th>
                    <th style={{ width: '12%' }}>Price *</th>
                    <th style={{ width: '10%' }}>Disc (%)</th>
                    <th style={{ width: '10%' }}>Tax (%)</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>Total</th>
                    <th style={{ width: '3%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const baseVal = getItemQty(item.quantity) * item.price;
                    const discAmt = baseVal * ((Number(item.discountPercent) || 0) / 100);
                    const itemSubTotal = baseVal - discAmt;
                    const itemTax = itemSubTotal * (item.taxRate / 100);
                    const itemTotal = itemSubTotal + itemTax;
                    return (
                      <tr key={idx} className="item-row">
                        <td>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Service / Product name"
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.hsnSac}
                            onChange={(e) => handleItemChange(idx, 'hsnSac', e.target.value)}
                            placeholder="998311"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.quantity === undefined || item.quantity === null ? '' : item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*$/.test(val)) {
                                let cleaned = val;
                                if (/^0\d+/.test(val)) {
                                  cleaned = val.replace(/^0+/, '');
                                }
                                handleItemChange(idx, 'quantity', cleaned === '' ? undefined : Number(cleaned));
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.price === 0 ? '' : item.price}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                let cleaned = val;
                                if (/^0\d+/.test(val) && !val.startsWith('0.')) {
                                  cleaned = val.replace(/^0+/, '');
                                }
                                handleItemChange(idx, 'price', cleaned === '' ? 0 : Number(cleaned));
                              }
                            }}
                            placeholder="0.00"
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.discountPercent === 0 ? '' : item.discountPercent}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                let cleaned = val;
                                if (/^0\d+/.test(val) && !val.startsWith('0.')) {
                                  cleaned = val.replace(/^0+/, '');
                                }
                                handleItemChange(idx, 'discountPercent', cleaned === '' ? 0 : Number(cleaned));
                              }
                            }}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.taxRate === 0 ? '' : item.taxRate}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*$/.test(val)) {
                                let cleaned = val;
                                if (/^0\d+/.test(val)) {
                                  cleaned = val.replace(/^0+/, '');
                                }
                                handleItemChange(idx, 'taxRate', cleaned === '' ? 0 : Number(cleaned));
                              }
                            }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '500' }}>
                          {formatCurrency(itemTotal)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-delete-item"
                            disabled={items.length === 1}
                            onClick={() => handleRemoveItem(idx)}
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn-inline-action" onClick={handleAddItem}>
              + Add Item
            </button>

            {/* Advance / Initial Payment Collection (For Final Invoices) */}
            {docType === 'FINAL_INVOICE' && !editingDoc && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#818cf8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  💳 Advance Payment / Initial Collection (Optional)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                      Advance Received (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={formTotalAmount}
                      step="any"
                      value={initialPayment || ''}
                      onChange={(e) => setInitialPayment(Number(e.target.value) || 0)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                      Payment Mode
                    </label>
                    <select
                      value={initialPaymentMode}
                      onChange={(e) => setInitialPaymentMode(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="CASH">💵 Cash</option>
                      <option value="UPI">📱 UPI / QR</option>
                      <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                      <option value="CHEQUE">📜 Cheque</option>
                      <option value="OTHER">✨ Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                      Txn Ref / Cheque #
                    </label>
                    <input
                      type="text"
                      value={initialPaymentRef}
                      onChange={(e) => setInitialPaymentRef(e.target.value)}
                      placeholder="e.g. UPI-129381"
                      style={{
                        width: '100%',
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Totals Summary */}
            <div className="totals-summary">
              <div>Subtotal: {formatCurrency(formSubTotal)}</div>
              <div>Tax Amount: {formatCurrency(formTaxAmount)}</div>
              <div className="grand-total">Total Amount: {formatCurrency(formTotalAmount)}</div>
              {docType === 'FINAL_INVOICE' && initialPayment > 0 && (
                <>
                  <div style={{ color: '#34d399', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Advance / Paid: -{formatCurrency(initialPayment)}
                  </div>
                  <div style={{ color: '#f87171', fontWeight: 800, fontSize: '1rem', marginTop: '0.25rem' }}>
                    Balance Due: {formatCurrency(Math.max(0, formTotalAmount - initialPayment))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary-action" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-action"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : editingDoc ? 'Save Changes' : 'Create Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
