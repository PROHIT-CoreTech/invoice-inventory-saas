import React, { useState } from 'react';

type ViewMode = 'dual' | 'web' | 'mobile';

export const ParallaxDashboardPreview: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dual');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = (x - rect.width / 2) / (rect.width / 2);
    const yc = (y - rect.height / 2) / (rect.height / 2);

    card.style.setProperty('--rx', `${-yc * 10}deg`);
    card.style.setProperty('--ry', `${xc * 10}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      {/* Interactive Platform Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '999px',
            padding: '3px',
            gap: '4px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveView('dual')}
            style={{
              backgroundColor: activeView === 'dual' ? '#6366f1' : 'transparent',
              color: activeView === 'dual' ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: '999px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>💻 + 📱</span> Dual Sync
          </button>
          <button
            type="button"
            onClick={() => setActiveView('web')}
            style={{
              backgroundColor: activeView === 'web' ? '#6366f1' : 'transparent',
              color: activeView === 'web' ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: '999px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>💻</span> Web ERP
          </button>
          <button
            type="button"
            onClick={() => setActiveView('mobile')}
            style={{
              backgroundColor: activeView === 'mobile' ? '#6366f1' : 'transparent',
              color: activeView === 'mobile' ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: '999px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>📱</span> Mobile App
          </button>
        </div>
      </div>

      {/* Main 3D Showcase Container */}
      <div
        className="hero-right-preview"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: '100%',
          height: activeView === 'mobile' ? '520px' : '430px',
          transform: activeView === 'mobile' 
            ? 'perspective(1000px) rotateX(var(--rx, 4deg)) rotateY(var(--ry, -4deg))'
            : 'perspective(1000px) rotateX(var(--rx, 6deg)) rotateY(var(--ry, -8deg)) rotateZ(0.5deg)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out, height 0.3s ease',
          zIndex: 2
        }}
      >
        {/* Background Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            inset: '-10%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(251, 146, 60, 0.06) 50%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* -------------------- 1. DESKTOP WEB DASHBOARD CARD -------------------- */}
        {(activeView === 'dual' || activeView === 'web') && (
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
              textAlign: 'left',
              transition: 'all 0.3s ease',
              width: activeView === 'web' ? '100%' : '90%',
              zIndex: 1
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
                <span style={{ backgroundColor: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: '1px solid rgba(251, 146, 60, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 }}>
                  + Create
                </span>
              </div>

              <div className="preview-table-container" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', fontSize: '0.65rem', textAlign: 'left' }}>
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
        )}

        {/* -------------------- 2. SMARTPHONE MOBILE APP MOCKUP -------------------- */}
        {(activeView === 'dual' || activeView === 'mobile') && (
          <div
            className="mobile-device-showcase"
            style={{
              position: activeView === 'mobile' ? 'relative' : 'absolute',
              right: activeView === 'mobile' ? 'auto' : '-1.25rem',
              bottom: activeView === 'mobile' ? 'auto' : '-1.5rem',
              margin: activeView === 'mobile' ? '0 auto' : undefined,
              width: activeView === 'mobile' ? '260px' : '230px',
              height: activeView === 'mobile' ? '505px' : '445px',
              backgroundColor: '#0f172a',
              borderRadius: '38px',
              padding: '8px',
              border: '2px solid rgba(255, 255, 255, 0.18)',
              boxShadow: activeView === 'mobile'
                ? '0 30px 80px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(99, 102, 241, 0.35)'
                : '0 30px 60px -10px rgba(0, 0, 0, 0.9), 0 0 35px rgba(99, 102, 241, 0.25)',
              transform: activeView === 'mobile'
                ? 'translateZ(40px)'
                : 'translateZ(65px)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
          >
            {/* Phone Screen Inner Display */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#0a0d14',
                borderRadius: '30px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                color: '#fff',
                fontSize: '0.75rem'
              }}
            >
              {/* Dynamic Island / Notch */}
              <div
                style={{
                  position: 'absolute',
                  top: '6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '65px',
                  height: '14px',
                  backgroundColor: '#000',
                  borderRadius: '10px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '6px'
                }}
              >
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#1e293b' }} />
              </div>

              {/* Status Bar */}
              <div
                style={{
                  padding: '6px 12px 2px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.58rem',
                  color: '#94a3b8',
                  fontWeight: 600
                }}
              >
                <span>9:41</span>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  <span>5G</span>
                  <span>📶</span>
                  <div style={{ width: '13px', height: '7px', border: '1px solid #94a3b8', borderRadius: '2px', padding: '1px' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#10b981', borderRadius: '1px' }} />
                  </div>
                </div>
              </div>

              {/* Mobile App Bar */}
              <div
                style={{
                  padding: '0.6rem 0.75rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      color: '#fff'
                    }}
                  >
                    R
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, lineHeight: 1 }}>PROCash</div>
                    <div style={{ fontSize: '0.5rem', color: '#94a3b8' }}>ROHIT INVOICES</div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontSize: '0.52rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Live Sync
                </div>
              </div>

              {/* Mobile Screen Body Content */}
              <div style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', overflowY: 'hidden', textAlign: 'left' }}>
                {/* Mobile Metric Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '12px',
                    padding: '0.6rem 0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.52rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>TODAY'S REVENUE</span>
                    <span style={{ fontSize: '0.52rem', color: '#10b981', fontWeight: 700 }}>+14.2%</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0', fontFamily: 'monospace' }}>
                    ₹1,83,195.00
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.25rem' }}>
                    <span>Quotes: ₹2.84L</span>
                    <span>1 Paid • 0 Due</span>
                  </div>
                </div>

                {/* Mobile Quick Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
                    }}
                  >
                    <span>+</span> Create Quote
                  </div>
                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.58rem',
                      fontWeight: 700
                    }}
                  >
                    <span>💬</span> WhatsApp PDF
                  </div>
                </div>

                {/* Mobile Recent Invoices Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#cbd5e1' }}>Recent Transactions</span>
                    <span style={{ fontSize: '0.5rem', color: '#818cf8', fontWeight: 600 }}>See All</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {/* Item 1 */}
                    <div
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        padding: '0.4rem 0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '0.6rem' }}>
                          ✓
                        </div>
                        <div>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fff' }}>Shreesha Ent.</div>
                          <div style={{ fontSize: '0.48rem', color: '#64748b' }}>INV #001 • Today</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>₹1,83,195</div>
                        <div style={{ fontSize: '0.45rem', color: '#10b981', fontWeight: 700 }}>PAID</div>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        padding: '0.4rem 0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '0.6rem' }}>
                          📑
                        </div>
                        <div>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fff' }}>CFS Technologies</div>
                          <div style={{ fontSize: '0.48rem', color: '#64748b' }}>QT #001 • Converted</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>₹2,84,085</div>
                        <div style={{ fontSize: '0.45rem', color: '#38bdf8', fontWeight: 700 }}>ACTIVE</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Bottom Navigation Bar */}
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: 'rgba(10, 13, 20, 0.95)',
                  padding: '0.4rem 0.6rem',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  fontSize: '0.52rem'
                }}
              >
                <div style={{ color: '#818cf8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                  <span>📊</span>
                  <span>Dashboard</span>
                </div>
                <div style={{ color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span>📄</span>
                  <span>Invoices</span>
                </div>
                <div style={{ color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span>👥</span>
                  <span>Clients</span>
                </div>
                <div style={{ color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span>⚙️</span>
                  <span>Settings</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Parallax Badge 1 */}
        {activeView !== 'mobile' && (
          <div
            className="floating-parallax-1"
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '-2rem',
              backgroundColor: '#151c2f',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '0.85rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.15)',
              transform: 'translateZ(70px)',
              zIndex: 6,
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
        )}

        {/* Floating Parallax Badge 2: Mobile Cross-Platform Badge */}
        <div
          className="floating-parallax-2"
          style={{
            position: 'absolute',
            top: activeView === 'mobile' ? '1rem' : '-1.25rem',
            right: activeView === 'mobile' ? '-1.5rem' : '-1rem',
            backgroundColor: '#0a0d16',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '14px',
            padding: '0.65rem 0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.25)',
            transform: 'translateZ(75px)',
            zIndex: 6,
            textAlign: 'left',
            animation: 'float-subtle 4.5s infinite ease-in-out 0.5s'
          }}
        >
          <div style={{ fontSize: '1.25rem' }}>📱</div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fff' }}>iOS & Android App</div>
            <div style={{ fontSize: '0.55rem', color: '#10b981', fontWeight: 600 }}>⚡ Instant Cloud Sync</div>
          </div>
        </div>
      </div>
    </div>
  );
};
