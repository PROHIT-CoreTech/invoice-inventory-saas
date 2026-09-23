import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'document' | 'subscription';
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'document', style }) => {
  const normalized = (status || '').toUpperCase();

  if (type === 'subscription') {
    let bg = 'rgba(148, 163, 184, 0.15)';
    let color = '#94a3b8';
    let border = 'rgba(148, 163, 184, 0.3)';

    if (normalized === 'ACTIVE') {
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#10b981';
      border = 'rgba(16, 185, 129, 0.3)';
    } else if (normalized === 'EXPIRED') {
      bg = 'rgba(239, 68, 68, 0.15)';
      color = '#ef4444';
      border = 'rgba(239, 68, 68, 0.3)';
    } else if (normalized === 'TRIAL') {
      bg = 'rgba(99, 102, 241, 0.15)';
      color = '#818cf8';
      border = 'rgba(99, 102, 241, 0.3)';
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color,
          border: `1px solid ${border}`,
          padding: '0.15rem 0.5rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          ...style
        }}
      >
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color }} />
        {normalized}
      </span>
    );
  }

  // Document status badge
  let bg = 'rgba(148, 163, 184, 0.15)';
  let color = '#94a3b8';

  if (normalized === 'PAID' || normalized === 'CONVERTED') {
    bg = 'rgba(16, 185, 129, 0.15)';
    color = '#10b981';
  } else if (normalized === 'PARTIAL' || normalized === 'SENT') {
    bg = 'rgba(245, 158, 11, 0.15)';
    color = '#f59e0b';
  } else if (normalized === 'UNPAID' || normalized === 'CANCELLED') {
    bg = 'rgba(239, 68, 68, 0.15)';
    color = '#ef4444';
  } else if (normalized === 'DRAFT') {
    bg = 'rgba(56, 189, 248, 0.15)';
    color = '#38bdf8';
  }

  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        ...style
      }}
    >
      {normalized}
    </span>
  );
};
