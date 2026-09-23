import React from 'react';
import { SubscriptionPlanConfig } from './types';

interface EditPlanModalProps {
  editingPlan: SubscriptionPlanConfig;
  planFormData: {
    name: string;
    description: string;
    regularPrice: string;
    offerPrice: string;
    offerBadge: string;
    offerStartDate: string;
    offerEndDate: string;
    futurePrice: string;
    futurePriceEffectiveDate: string;
    isActive: boolean;
  };
  setPlanFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    regularPrice: string;
    offerPrice: string;
    offerBadge: string;
    offerStartDate: string;
    offerEndDate: string;
    futurePrice: string;
    futurePriceEffectiveDate: string;
    isActive: boolean;
  }>>;
  planSaveLoading: boolean;
  planSaveError: string;
  planSaveSuccess: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditPlanModal({
  editingPlan,
  planFormData,
  setPlanFormData,
  planSaveLoading,
  planSaveError,
  planSaveSuccess,
  onClose,
  onSubmit
}: EditPlanModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '650px', padding: '1.75rem', overflowY: 'auto', backgroundColor: '#ffffff', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, textAlign: 'left' }}>
              ⚙️ Manage Plan Pricing & Offers
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600, display: 'block', textAlign: 'left', marginTop: '0.15rem' }}>
              Plan ID: {editingPlan.planId}
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', outline: 'none' }}
          >
            &times;
          </button>
        </div>

        {planSaveError && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>
            ⚠️ {planSaveError}
          </div>
        )}

        {planSaveSuccess && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>
            {planSaveSuccess}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Part 1: Regular Pricing & Plan Details */}
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: '#4f46e5', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              1. Base Pricing & Display Details
            </h4>
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Plan Name *</label>
                <input 
                  type="text"
                  required
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Regular Price (₹) *</label>
                <input 
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={planFormData.regularPrice}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, regularPrice: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Description / Feature Highlights</label>
              <input 
                type="text"
                placeholder="e.g. Full features, Unlimited Invoices"
                value={planFormData.description}
                onChange={(e) => setPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Part 2: Promotional Offer Price */}
          <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ color: '#16a34a', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>🏷️ 2. Promotional Discount Offer</span>
            </h4>
            
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Discounted Offer Price (₹)</label>
                <input 
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Leave empty for regular price"
                  value={planFormData.offerPrice}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, offerPrice: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Offer Badge / Tagline</label>
                <input 
                  type="text"
                  placeholder="e.g. 20% OFF, FESTIVE SPECIAL"
                  value={planFormData.offerBadge}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, offerBadge: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="grid-col-2" style={{ marginTop: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Offer Start Date (Optional)</label>
                <input 
                  type="date"
                  value={planFormData.offerStartDate}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, offerStartDate: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Offer Expiration Date (Optional)</label>
                <input 
                  type="date"
                  value={planFormData.offerEndDate}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, offerEndDate: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Part 3: Scheduled Future Price Change */}
          <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h4 style={{ color: '#d97706', fontSize: '0.85rem', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>🗓️ 3. Schedule Future Price Change</span>
            </h4>
            
            <div className="grid-col-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Scheduled Future Price (₹)</label>
                <input 
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Future scheduled price..."
                  value={planFormData.futurePrice}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, futurePrice: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Effective Start Date</label>
                <input 
                  type="date"
                  value={planFormData.futurePriceEffectiveDate}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, futurePriceEffectiveDate: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={planSaveLoading}
              style={{
                backgroundColor: '#4f46e5',
                border: 'none',
                color: '#fff',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: planSaveLoading ? 'not-allowed' : 'pointer',
                opacity: planSaveLoading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              {planSaveLoading ? 'Saving Settings...' : 'Save Plan Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
