import React from 'react';
import { TenantProfile, ViewMode, Client } from './types';
import { getPlanLabel, formatDateTime } from './utils';

interface DashboardHeaderProps {
  tenantProfile: TenantProfile | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isApiError: boolean;
  onOpenSettings: () => void;
  onOpenRenewal: () => void;
  clients: Client[];
  setSelectedLedgerClientId: (id: string) => void;
  selectedLedgerClientId: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  tenantProfile,
  viewMode,
  setViewMode,
  isApiError,
  onOpenSettings,
  onOpenRenewal,
  clients,
  setSelectedLedgerClientId,
  selectedLedgerClientId
}) => {
  return (
    <>
      {tenantProfile?.subscriptionStatus === 'EXPIRED' && (
        <div style={{
          backgroundColor: '#ef4444',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          fontSize: '0.9rem',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
          position: 'relative',
          zIndex: 100
        }}>
          <span>
            ⚠️ Your workspace subscription has expired. You are in **Read-Only Mode**. All creation and editing actions are locked.
          </span>
          <button
            type="button"
            onClick={onOpenRenewal}
            style={{
              backgroundColor: '#fff',
              color: '#ef4444',
              border: 'none',
              padding: '0.4rem 1.25rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ⚡ Renew Subscription Now
          </button>
        </div>
      )}

      <header className="header">
        {/* Line 1: Logo, Company Name, Settings Button & Subscription Badge */}
        <div className="header-line-1">
          <div className="header-brand-group">
            <img 
              src={tenantProfile?.logoUrl || "/images/hero.png"} 
              alt="Logo" 
              className="header-logo"
              onError={(e) => { e.currentTarget.src = "/images/hero.png"; }} 
            />
            <h1 className="header-company-name">
              {tenantProfile?.companyName || "PROCash Invoice ERP"}
            </h1>
            <button
              type="button"
              onClick={onOpenSettings}
              className="header-settings-btn"
              title="Workspace Profile Settings"
            >
              <span className="settings-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>

          {tenantProfile && (
            <div 
              className="sub-badge" 
              onClick={() => setViewMode('subscription')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                backgroundColor: tenantProfile.subscriptionStatus === 'EXPIRED' ? '#fee2e2' : '#e0e7ff',
                border: tenantProfile.subscriptionStatus === 'EXPIRED' ? '1px solid #fca5a5' : '1px solid #c7d2fe',
                fontSize: '0.8125rem',
                color: tenantProfile.subscriptionStatus === 'EXPIRED' ? '#991b1b' : '#3730a3',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
              title="Click to view Subscription & Plan Details"
            >
              👑 {getPlanLabel(tenantProfile.subscriptionPlan || 'FREE')} ({tenantProfile.subscriptionPlan === 'LIFETIME' ? 'Lifetime' : (tenantProfile.subscriptionPlan === 'FREE' ? 'Free Tier' : `Expires: ${formatDateTime(tenantProfile.subscriptionExpiresAt)}`)})
            </div>
          )}
        </div>

        {/* Line 2: All Menu Navigation Tabs & API Status Pill */}
        <div className="header-line-2">
          <div className="view-mode-tabs">
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'daily' ? 'active' : ''}`} 
              onClick={() => setViewMode('daily')}
            >
              📅 Daily Workspace
            </button>
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'history' ? 'active' : ''}`} 
              onClick={() => setViewMode('history')}
            >
              📜 Archive & History
            </button>
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'ledger' ? 'active' : ''}`} 
              onClick={() => {
                setViewMode('ledger');
                if (!selectedLedgerClientId && clients.length > 0) {
                  setSelectedLedgerClientId(clients[0].id || (clients[0] as any)._id);
                }
              }}
            >
              📒 Client Ledger History
            </button>
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'subscription' ? 'active' : ''}`} 
              onClick={() => setViewMode('subscription')}
            >
              👑 Subscription Details
            </button>
          </div>

          <div className="connection-pill">
            <div className="connection-dot" style={{ backgroundColor: isApiError ? '#f87171' : '#34d399', boxShadow: isApiError ? '0 0 8px #f87171' : '0 0 8px #34d399' }} />
            <span>API: {isApiError ? 'Disconnected' : 'Connected'}</span>
          </div>
        </div>
      </header>
    </>
  );
};
