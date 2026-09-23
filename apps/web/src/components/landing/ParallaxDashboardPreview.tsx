import React from 'react';

export const ParallaxDashboardPreview: React.FC = () => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = (x - rect.width / 2) / (rect.width / 2);
    const yc = (y - rect.height / 2) / (rect.height / 2);

    card.style.setProperty('--rx', `${-yc * 12}deg`);
    card.style.setProperty('--ry', `${xc * 12}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      className="hero-right-preview"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '390px',
        transform: 'perspective(1000px) rotateX(var(--rx, 8deg)) rotateY(var(--ry, -12deg)) rotateZ(1deg)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out',
        zIndex: 2
      }}
    >
      {/* Main Dashboard Card */}
      <div
        className="preview-dashboard-card"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#0a0d14',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 40px 80px -15px rgba(5, 7, 13, 0.9), 0 0 50px rgba(99, 102, 241, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          transformStyle: 'preserve-3d',
          color: '#fff',
          fontSize: '0.85rem',
          textAlign: 'left'
        }}
      >
        {/* Top Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>R</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.020em' }}>
                ROHIT<span style={{ color: '#fff' }}>INVOICES</span>
              </span>
            </div>
            <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.2rem', fontWeight: 500 }}>
              Invoicing & Billing Dashboard for ROHIT INVOICES
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.58rem', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#fb923c', color: '#000', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
              📅 Daily Workspace
            </span>
            <span style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              Archive & History
            </span>
            <span style={{ backgroundColor: '#1e293b', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }} /> API: Connected
            </span>
          </div>
        </div>

        {/* Statistics Cards Row */}
        <div className="preview-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700 }}>
              <span>QUOTATIONS</span>
              <span style={{ color: '#38bdf8' }}>1 TODAY</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem', fontFamily: 'monospace' }}>₹2,84,085.00</div>
            <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '0.25rem' }}>Today's pipe volume</div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700 }}>
              <span>PROFORMA INVOICES</span>
              <span style={{ color: '#fbbf24' }}>1 TODAY</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem', fontFamily: 'monospace' }}>₹1,83,195.00</div>
            <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '0.25rem' }}>Today's pending</div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700 }}>
              <span>FINAL INVOICES</span>
              <span style={{ color: '#fb923c' }}>1 TODAY</span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem', fontFamily: 'monospace' }}>₹1,83,195.00</div>
            <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '0.25rem' }}>Today's revenue</div>
          </div>
        </div>

        {/* Table Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
              Today's Quotations
            </div>
            <button type="button" disabled style={{ backgroundColor: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: '1px solid rgba(251, 146, 60, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, cursor: 'not-allowed' }}>
              + Create
            </button>
          </div>

          <div className="preview-table-container" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
            <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', fontSize: '0.65rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>QUOTE #</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>CLIENT</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>VALID UNTIL</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>AMOUNT</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>STATUS</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem 0.75rem', fontWeight: 700, color: '#fff' }}>2026-27/CFS-QT-001</td>
                  <td style={{ padding: '0.75rem 0.75rem' }}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>Shreesha Enterprises</div>
                    <div style={{ color: '#64748b', fontSize: '0.55rem' }}>shreesha@gmail.com</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.75rem', color: '#94a3b8' }}>Jul 15, 2026</td>
                  <td style={{ padding: '0.75rem 0.75rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>₹2,84,085.00</td>
                  <td style={{ padding: '0.75rem 0.75rem' }}>
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.15rem 0.4rem', borderRadius: '10px', fontSize: '0.55rem', fontWeight: 700 }}>
                      CONVERTED
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                    <span style={{ color: '#94a3b8', gap: '0.4rem', display: 'flex', justifyContent: 'center', fontSize: '0.7rem' }}>
                      🖨️ ✏️ 🗑️
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating Parallax Card 1 */}
      <div
        className="floating-parallax-1"
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '-2.5rem',
          backgroundColor: '#151c2f',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '0.9rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.15)',
          transform: 'translateZ(45px)',
          zIndex: 3,
          animation: 'float-subtle 4s infinite ease-in-out'
        }}
      >
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
          ✓
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>INV-2026-27/001</div>
          <div style={{ color: '#64748b', fontSize: '0.6rem', marginTop: '0.15rem', fontWeight: 500 }}>Shreesha Ent. — Paid</div>
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', marginLeft: '0.5rem', fontFamily: 'monospace' }}>
          ₹1,83,195.00
        </div>
      </div>

      {/* Floating Parallax Card 2 */}
      <div
        className="floating-parallax-2"
        style={{
          position: 'absolute',
          top: '2rem',
          right: '-2.5rem',
          backgroundColor: '#0a0d16',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
          transform: 'translateZ(35px)',
          zIndex: 3,
          textAlign: 'left',
          animation: 'float-subtle 4.5s infinite ease-in-out 0.5s'
        }}
      >
        <span style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>GST AUTO-SPLIT</span>
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginTop: '0.15rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fb923c' }}>CGST/SGST 18%</span>
          <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>Intra-state</span>
        </div>
      </div>
    </div>
  );
};
