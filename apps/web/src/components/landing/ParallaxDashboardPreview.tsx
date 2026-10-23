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
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '999px',
            padding: '3px',
            gap: '4px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveView('dual')}
            style={{
              backgroundColor: activeView === 'dual' ? '#4f46e5' : 'transparent',
              color: activeView === 'dual' ? '#ffffff' : '#64748b',
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
              backgroundColor: activeView === 'web' ? '#4f46e5' : 'transparent',
              color: activeView === 'web' ? '#ffffff' : '#64748b',
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
              backgroundColor: activeView === 'mobile' ? '#4f46e5' : 'transparent',
              color: activeView === 'mobile' ? '#ffffff' : '#64748b',
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
        {/* Background Ambient Soft Glow */}
        <div
          style={{
            position: 'absolute',
            inset: '-10%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(251, 146, 60, 0.06) 50%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* -------------------- 1. DESKTOP WEB DASHBOARD CARD (LIGHT THEME) -------------------- */}
        {(activeView === 'dual' || activeView === 'web') && (
          <div
            className="preview-dashboard-card"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.1), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transformStyle: 'preserve-3d',
              color: '#0f172a',
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
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>R</span>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.020em', color: '#0f172a' }}>
                    ROHIT<span style={{ color: '#4f46e5' }}>INVOICES</span>
                  </span>
                </div>
                <div style={{ fontSize: '0.625rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
                  Invoicing &amp; Billing Dashboard for ROHIT INVOICES
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.58rem', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                  📅 Daily Workspace
                </span>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                  Archive &amp; History
                </span>
                <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#16a34a' }} /> API: Connected
                </span>
              </div>
            </div>

            {/* Statistics Cards Row */}
            <div className="preview-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#64748b', fontWeight: 700 }}>
                  <span>QUOTATIONS</span>
                  <span style={{ color: '#0284c7' }}>1 TODAY</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem', fontFamily: 'monospace' }}>₹2,84,085.00</div>
                <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '0.25rem' }}>Today's pipe volume</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#64748b', fontWeight: 700 }}>
                  <span>PROFORMA INVOICES</span>
                  <span style={{ color: '#d97706' }}>1 TODAY</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem', fontFamily: 'monospace' }}>₹1,83,195.00</div>
                <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '0.25rem' }}>Today's pending</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#64748b', fontWeight: 700 }}>
                  <span>FINAL INVOICES</span>
                  <span style={{ color: '#ea580c' }}>1 TODAY</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem', fontFamily: 'monospace' }}>₹1,83,195.00</div>
                <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '0.25rem' }}>Today's revenue</div>
              </div>
            </div>

            {/* Table Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
                  Today's Quotations
                </div>
                <span style={{ backgroundColor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 }}>
                  + Create
                </span>
              </div>

              <div className="preview-table-container" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', fontSize: '0.65rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
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
                      <td style={{ padding: '0.75rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>2026-27/CFS-QT-001</td>
                      <td style={{ padding: '0.75rem 0.75rem' }}>
                        <div style={{ color: '#0f172a', fontWeight: 600 }}>Shreesha Enterprises</div>
                        <div style={{ color: '#64748b', fontSize: '0.55rem' }}>shreesha@gmail.com</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.75rem', color: '#64748b' }}>Jul 15, 2026</td>
                      <td style={{ padding: '0.75rem 0.75rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>₹2,84,085.00</td>
                      <td style={{ padding: '0.75rem 0.75rem' }}>
                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.15rem 0.4rem', borderRadius: '10px', fontSize: '0.55rem', fontWeight: 700 }}>
                          CONVERTED
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ color: '#64748b', gap: '0.4rem', display: 'flex', justifyContent: 'center', fontSize: '0.7rem' }}>
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

        {/* -------------------- 2. SMARTPHONE MOBILE APP MOCKUP (LIGHT THEME) -------------------- */}
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
              backgroundColor: '#f1f5f9',
              borderRadius: '38px',
              padding: '8px',
              border: '2.5px solid #cbd5e1',
              boxShadow: activeView === 'mobile'
                ? '0 30px 80px -15px rgba(15, 23, 42, 0.22), 0 0 40px rgba(99, 102, 241, 0.15)'
                : '0 30px 60px -10px rgba(15, 23, 42, 0.18), 0 0 25px rgba(99, 102, 241, 0.12)',
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
                backgroundColor: '#ffffff',
                borderRadius: '30px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                color: '#0f172a',
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
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '6px'
                }}
              >
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#334155' }} />
              </div>

              {/* Status Bar */}
              <div
                style={{
                  padding: '6px 12px 2px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.58rem',
                  color: '#475569',
                  fontWeight: 600
                }}
              >
                <span>9:41</span>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  <span>5G</span>
                  <span>📶</span>
                  <div style={{ width: '13px', height: '7px', border: '1px solid #475569', borderRadius: '2px', padding: '1px' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#16a34a', borderRadius: '1px' }} />
                  </div>
                </div>
              </div>

              {/* Mobile App Bar */}
              <div
                style={{
                  padding: '0.6rem 0.75rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc'
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
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, lineHeight: 1, color: '#0f172a' }}>PROCash</div>
                    <div style={{ fontSize: '0.5rem', color: '#64748b' }}>ROHIT INVOICES</div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.52rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                  Live Sync
                </div>
              </div>

              {/* Mobile Screen Body Content */}
              <div style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', overflowY: 'hidden', textAlign: 'left' }}>
                {/* Mobile Metric Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '0.6rem 0.75rem',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.52rem', color: '#475569', fontWeight: 700, letterSpacing: '0.04em' }}>TODAY'S REVENUE</span>
                    <span style={{ fontSize: '0.52rem', color: '#15803d', fontWeight: 700 }}>+14.2%</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0', fontFamily: 'monospace' }}>
                    ₹1,83,195.00
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '0.25rem' }}>
                    <span>Quotes: ₹2.84L</span>
                    <span>1 Paid • 0 Due</span>
                  </div>
                </div>

                {/* Mobile Quick Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                    }}
                  >
                    <span>+</span> Create Quote
                  </div>
                  <div
                    style={{
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#059669',
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
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#334155' }}>Recent Transactions</span>
                    <span style={{ fontSize: '0.5rem', color: '#4f46e5', fontWeight: 600 }}>See All</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {/* Item 1 */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.4rem 0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontSize: '0.6rem' }}>
                          ✓
                        </div>
                        <div>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0f172a' }}>Shreesha Ent.</div>
                          <div style={{ fontSize: '0.48rem', color: '#64748b' }}>INV #001 • Today</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#15803d', fontFamily: 'monospace' }}>₹1,83,195</div>
                        <div style={{ fontSize: '0.45rem', color: '#15803d', fontWeight: 700 }}>PAID</div>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.4rem 0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontSize: '0.6rem' }}>
                          📑
                        </div>
                        <div>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0f172a' }}>CFS Technologies</div>
                          <div style={{ fontSize: '0.48rem', color: '#64748b' }}>QT #001 • Converted</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0284c7', fontFamily: 'monospace' }}>₹2,84,085</div>
                        <div style={{ fontSize: '0.45rem', color: '#0284c7', fontWeight: 700 }}>ACTIVE</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Bottom Navigation Bar */}
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  padding: '0.4rem 0.6rem',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  fontSize: '0.52rem'
                }}
              >
                <div style={{ color: '#4f46e5', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                  <span>📊</span>
                  <span>Dashboard</span>
                </div>
                <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span>📄</span>
                  <span>Invoices</span>
                </div>
                <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span>👥</span>
                  <span>Clients</span>
                </div>
                <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
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
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0.85rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1), 0 0 1px 1px rgba(0,0,0,0.04)',
              transform: 'translateZ(70px)',
              zIndex: 6,
              animation: 'float-subtle 4s infinite ease-in-out'
            }}
          >
            <div style={{ backgroundColor: '#dcfce7', color: '#15803d', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
              ✓
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a' }}>INV-2026-27/001</div>
              <div style={{ color: '#64748b', fontSize: '0.6rem', marginTop: '0.15rem', fontWeight: 500 }}>Shreesha Ent. — Paid</div>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', marginLeft: '0.5rem', fontFamily: 'monospace' }}>
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
            backgroundColor: '#ffffff',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '14px',
            padding: '0.65rem 0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
            transform: 'translateZ(75px)',
            zIndex: 6,
            textAlign: 'left',
            animation: 'float-subtle 4.5s infinite ease-in-out 0.5s'
          }}
        >
          <div style={{ fontSize: '1.25rem' }}>📱</div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0f172a' }}>iOS &amp; Android App</div>
            <div style={{ fontSize: '0.55rem', color: '#15803d', fontWeight: 600 }}>⚡ Instant Cloud Sync</div>
          </div>
        </div>
      </div>
    </div>
  );
};
