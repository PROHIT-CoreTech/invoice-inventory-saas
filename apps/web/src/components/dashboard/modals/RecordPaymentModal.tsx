import React from 'react';

interface RecordPaymentModalProps {
  paymentModalData: {
    clientId: string;
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    type: 'PAYMENT_RECEIVED' | 'ADVANCE_PAYMENT' | 'REFUND';
    paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
    referenceNo: string;
    notes: string;
  };
  setPaymentModalData: React.Dispatch<React.SetStateAction<{
    clientId: string;
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    type: 'PAYMENT_RECEIVED' | 'ADVANCE_PAYMENT' | 'REFUND';
    paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
    referenceNo: string;
    notes: string;
  }>>;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  paymentModalData,
  setPaymentModalData,
  isPending,
  onClose,
  onSubmit
}) => {
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 style={{ color: '#0f172a', fontSize: '1.15rem', margin: 0 }}>💳 Record Payment / Advance Collection</h3>
          <button type="button" className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            {paymentModalData.invoiceNumber && (
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#e0e7ff', borderRadius: '6px', fontSize: '0.85rem', color: '#3730a3', fontWeight: 600 }}>
                Linked Invoice #: {paymentModalData.invoiceNumber}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', color: '#334155', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Payment Type
              </label>
              <select
                value={paymentModalData.type}
                onChange={(e: any) => setPaymentModalData({ ...paymentModalData, type: e.target.value })}
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
              >
                <option value="PAYMENT_RECEIVED">💵 Payment Received against Invoice</option>
                <option value="ADVANCE_PAYMENT">💳 Advance Payment Deposit</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#334155', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Amount Collected (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={paymentModalData.amount || ''}
                onChange={(e) => setPaymentModalData({ ...paymentModalData, amount: Number(e.target.value) || 0 })}
                placeholder="Enter amount"
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.6rem 0.85rem', fontSize: '1rem', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#334155', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Payment Mode
                </label>
                <select
                  value={paymentModalData.paymentMode}
                  onChange={(e: any) => setPaymentModalData({ ...paymentModalData, paymentMode: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                >
                  <option value="CASH">💵 Cash</option>
                  <option value="UPI">📱 UPI / QR</option>
                  <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                  <option value="CHEQUE">📜 Cheque</option>
                  <option value="OTHER">✨ Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#334155', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Txn Ref / Cheque #
                </label>
                <input
                  type="text"
                  value={paymentModalData.referenceNo}
                  onChange={(e) => setPaymentModalData({ ...paymentModalData, referenceNo: e.target.value })}
                  placeholder="e.g. UPI-998822"
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#334155', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Notes / Remarks
              </label>
              <input
                type="text"
                value={paymentModalData.notes}
                onChange={(e) => setPaymentModalData({ ...paymentModalData, notes: e.target.value })}
                placeholder="Optional details"
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
              />
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary-action" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary-action" disabled={isPending}>
              {isPending ? 'Saving Payment...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
