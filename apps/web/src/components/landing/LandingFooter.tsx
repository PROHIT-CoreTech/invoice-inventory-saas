import React from 'react';

interface LandingFooterProps {
  onOpenAdmin: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.875rem',
        position: 'relative',
        zIndex: 1
      }}
    >
      <p>© 2026 PROCash Invoices ERP. All rights reserved.</p>
      <p style={{ fontSize: '0.75rem', marginTop: '0.65rem' }}>
        Powered by Prisma ORM and SQLite/PostgreSQL. |{' '}
        <button
          type="button"
          onClick={onOpenAdmin}
          style={{
            background: 'none',
            border: 'none',
            color: '#818cf8',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: 0
          }}
        >
          🔒 System Admin Portal
        </button>
      </p>
    </footer>
  );
};
