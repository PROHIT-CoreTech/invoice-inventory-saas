import React from 'react';

export const LandingHeader: React.FC = () => {
  return (
    <header
      className="landing-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>P</span>
        </div>
        <span className="logo-title">
          PROCash <span style={{ color: '#818cf8' }}>Invoices</span>
        </span>
      </div>
    </header>
  );
};
