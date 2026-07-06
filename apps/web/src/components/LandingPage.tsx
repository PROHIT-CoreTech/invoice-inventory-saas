import React, { useState } from 'react';

interface LandingPageProps {
  onOpenAdmin: () => void;
}

export default function LandingPage({ onOpenAdmin }: LandingPageProps) {
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');

  const getSuffix = () => {
    if (typeof window === 'undefined') return '.biling.prohitcoretech.com';
    const host = window.location.host;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return `.localhost${window.location.port ? `:${window.location.port}` : ''}`;
    }
    return `.${host}`;
  };

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingTenant, setOnboardingTenant] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    proprietorName: '',
    address: '',
    gstin: '',
    pan: '',
    bankName: '',
    bankAccHolder: '',
    bankAccType: 'Current A/C',
    bankAccNumber: '',
    bankIfsc: '',
    bankBranch: '',
    logoUrl: '',
    signatureUrl: '',
    theme: 'DEFAULT',
    tier: 'FREE'
  });

  const getRedirectUrl = (tenant: string) => {
    const currentHost = window.location.host;
    const currentProtocol = window.location.protocol;
    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${currentProtocol}//${tenant}.localhost${port}`;
    } else {
      return `${currentProtocol}//${tenant}.${currentHost}`;
    }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim()) {
      setError('Please enter a workspace name');
      return;
    }
    setError('');
    
    const formattedTenant = tenantName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!formattedTenant) {
      setError('Invalid workspace name. Use only letters, numbers, and dashes.');
      return;
    }

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api') + '/tenant-profile';
      const res = await fetch(apiUrl, {
        headers: { 'X-Tenant-Id': formattedTenant }
      });
      
      const profile = res.ok ? await res.json() : null;
      if (profile && profile.companyName) {
        window.location.href = getRedirectUrl(formattedTenant);
      } else {
        setOnboardingTenant(formattedTenant);
        setFormData({
          companyName: formattedTenant.toUpperCase() + ' INVOICES',
          proprietorName: '',
          address: '',
          gstin: '',
          pan: '',
          bankName: '',
          bankAccHolder: '',
          bankAccType: 'Current A/C',
          bankAccNumber: '',
          bankIfsc: '',
          bankBranch: '',
          logoUrl: '',
          signatureUrl: '',
          theme: 'DEFAULT',
          tier: 'FREE'
        });
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error(err);
      window.location.href = getRedirectUrl(formattedTenant);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api') + '/tenant-profile';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': onboardingTenant
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save onboarding data');
      }

      window.location.href = getRedirectUrl(onboardingTenant);
    } catch (err: any) {
      alert(err.message || 'Something went wrong during onboarding.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signatureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 3D Parallax Tilt Handler
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
    <div className="landing-container" style={{
      minHeight: '100vh',
      backgroundColor: '#070a13',
      color: '#f8fafc',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* CSS Styles injection for animations and media queries */}
      <style>{`
        @keyframes drift {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(40px, -60px) rotate(180deg); }
          100% { transform: translate(0px, 0px) rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0.4; }
        }
        @keyframes float-subtle {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .feature-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .feature-card:hover {
          transform: translateY(-8px) scale(1.02) !important;
          border-color: rgba(99, 102, 241, 0.4) !important;
          background-color: rgba(30, 41, 59, 0.6) !important;
          box-shadow: 0 30px 40px -15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.15) !important;
        }
        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
            text-align: center !important;
          }
          .hero-left-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .hero-left-content p {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .hero-right-preview {
            max-width: 500px !important;
            margin: 0 auto !important;
          }
        }
        @media (max-width: 768px) {
          .floating-parallax-1, .floating-parallax-2 {
            display: none !important;
          }
        }
        @media (max-width: 576px) {
          .preview-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 0.5rem !important;
          }
          .hero-right-preview {
            height: auto !important;
            min-height: 480px !important;
          }
          .preview-dashboard-card {
            position: relative !important;
            height: auto !important;
            padding: 1rem !important;
          }
          .preview-table-container {
            overflow-x: auto !important;
          }
          .onboarding-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .onboarding-modal-card {
            padding: 1.25rem !important;
            border-radius: 16px !important;
          }
        }
      `}</style>

      {/* Decorative Background 3D Glowing Orbs */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '45vw',
        height: '45vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 65%)',
        filter: 'blur(80px)',
        animation: 'drift 25s infinite ease-in-out',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '-15%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        filter: 'blur(90px)',
        animation: 'drift 30s infinite ease-in-out alternate',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '40%',
        width: '30vw',
        height: '30vw',
        background: 'radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, transparent 60%)',
        filter: 'blur(70px)',
        animation: 'drift 20s infinite ease-in-out 3s',
        zIndex: 0
      }} />

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>P</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff' }}>
            PROCash <span style={{ color: '#818cf8' }}>Invoices</span>
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-grid" style={{
        maxWidth: '1200px',
        margin: '4rem auto 4rem auto',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '1.05fr 0.95fr',
        gap: '4.5rem',
        alignItems: 'center'
      }}>
        {/* Left Column: Hero badge, heading, subtitle and workspace access */}
        <div className="hero-left-content" style={{ textAlign: 'left' }}>
          {/* Glowing Premium Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#a5b4fc',
            marginBottom: '1.5rem'
          }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#818cf8', animation: 'pulse 1.8s infinite' }} />
            Enterprise Quotation & Billing Engine
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '3.75rem',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            color: '#fff',
            marginBottom: '1.25rem'
          }}>
            The Automated Billing <br />
            <span style={{
              background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Engine For SaaS
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.15rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '560px'
          }}>
            Automate your quotation-to-invoice lifecycle, generate Tally-compliant GST reports, and isolate workflows under client-specific subdomains.
          </p>

          {/* Interactive Workspace Redirection Form */}
          <div style={{
            maxWidth: '520px',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem', textAlign: 'left' }}>
              Launch or Access Workspace
            </h3>
            <form onSubmit={handleLaunch} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#0a0d16',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '0.65rem 1.15rem',
                transition: 'border-color 0.2s',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
              }}>
                <input 
                  type="text"
                  placeholder="your-company-name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    fontWeight: 600,
                    fontFamily: 'inherit'
                  }}
                />
                <span style={{ color: '#818cf8', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                  {getSuffix()}
                </span>
              </div>
              
              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, textAlign: 'left', fontWeight: 600 }}>
                  ⚠️ {error}
                </p>
              )}

              <button type="submit" style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
              }}
              >
                Launch Workspace →
              </button>
            </form>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.9rem', textAlign: 'center', fontWeight: 500 }}>
              Try routing with "company-a" or "sandbox" for local testing.
            </p>
          </div>
        </div>

        {/* Right Column: 3D Mock Dashboard Preview */}
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
          {/* Main Dashboard Card (Glassmorphic Mock UI matching the provided screenshot) */}
          <div className="preview-dashboard-card" style={{
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
          }}>
            {/* Top Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                  }}>
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
              
              {/* Status & Options Pill Buttons */}
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.58rem' }}>
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
              {/* Quotations Card */}
              <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700 }}>
                  <span>QUOTATIONS</span>
                  <span style={{ color: '#38bdf8' }}>1 TODAY</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem', fontFamily: 'monospace' }}>₹2,84,085.00</div>
                <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '0.25rem' }}>Today's pipe volume</div>
              </div>

              {/* Proformas Card */}
              <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700 }}>
                  <span>PROFORMA INVOICES</span>
                  <span style={{ color: '#fbbf24' }}>1 TODAY</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem', fontFamily: 'monospace' }}>₹1,83,195.00</div>
                <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '0.25rem' }}>Today's pending</div>
              </div>

              {/* Final Invoices Card */}
              <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#94a3b8', fontWeight: 700 }}>
                  <span>FINAL INVOICES</span>
                  <span style={{ color: '#fb923c' }}>1 TODAY</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem', fontFamily: 'monospace' }}>₹1,83,195.00</div>
                <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '0.25rem' }}>Today's revenue</div>
              </div>
            </div>

            {/* Today's Quotations Table Section */}
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

              {/* Table representation */}
              <div className="preview-table-container" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem', textAlign: 'left' }}>
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

          {/* Floating Element 1: 3D Parallax Invoice Card */}
          <div className="floating-parallax-1" style={{
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
            transform: 'translateZ(45px)', // Real 3D depth translation
            zIndex: 3,
            animation: 'float-subtle 4s infinite ease-in-out'
          }}>
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

          {/* Floating Element 2: 3D Parallax GST Tax Indicator */}
          <div className="floating-parallax-2" style={{
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
            transform: 'translateZ(35px)', // Real 3D depth translation
            zIndex: 3,
            textAlign: 'left',
            animation: 'float-subtle 4.5s infinite ease-in-out 0.5s'
          }}>
            <span style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>GST AUTO-SPLIT</span>
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginTop: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fb923c' }}>CGST/SGST 18%</span>
              <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>Intra-state</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{
        maxWidth: '1100px',
        margin: '6rem auto 4rem auto',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, textAlign: 'center', color: '#fff', marginBottom: '3.5rem', letterSpacing: '-0.02em' }}>
          Engineered for Enterprise Productivity
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.75rem'
        }}>
          {/* Card 1 */}
          <div className="feature-card" style={cardStyle}>
            <div style={iconContainerStyle}>📁</div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Lifecycle Conversion</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Convert quotations directly to proforma or final invoices with a linked, searchable history trail.
            </p>
          </div>
          {/* Card 2 */}
          <div className="feature-card" style={cardStyle}>
            <div style={iconContainerStyle}>🇮🇳</div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>GST Tax Splitting</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Automatic CGST/SGST calculation for intra-state clients and IGST for inter-state clients based on GSTIN codes.
            </p>
          </div>
          {/* Card 3 */}
          <div className="feature-card" style={cardStyle}>
            <div style={iconContainerStyle}>🔌</div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Multi-DB Automation</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Optimized for SQLite locally, but ready to deploy onto enterprise PostgreSQL or MongoDB clusters instantly.
            </p>
          </div>
          {/* Card 4 */}
          <div className="feature-card" style={cardStyle}>
            <div style={iconContainerStyle}>🔒</div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Subdomain Isolation</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Robust tenant multi-tenancy verification. Subdomain mapping isolates customer data structures securely.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.875rem',
        position: 'relative',
        zIndex: 1
      }}>
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

      {/* Onboarding Overlay Modal */}
      {showOnboarding && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(7, 10, 19, 0.85)',
          backdropFilter: 'blur(16px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <div className="onboarding-modal-card" style={{
            backgroundColor: '#151c2f',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2.5rem',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
            position: 'relative',
            boxSizing: 'border-box'
          }}>
            <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                🏢 Onboard Your Invoice Workspace
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Enter the branding, tax, and bank details for <strong style={{ color: '#818cf8' }}>{onboardingTenant}{getSuffix()}</strong>. These details will render on your professional GST invoices automatically.
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Company Profile
                </h4>
                <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Company Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Proprietor / Owner Name</label>
                    <input 
                      type="text"
                      value={formData.proprietorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, proprietorName: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                <div className="onboarding-grid" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Official Billing Address *</label>
                    <textarea 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      style={{...inputStyle, height: '70px', resize: 'none'}}
                      placeholder="e.g. 2b/706, 7th Floor, N.G. Suncity..."
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Company Logo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{...inputStyle, padding: '0.35rem'}}
                    />
                    {formData.logoUrl && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={formData.logoUrl} alt="Preview" style={{ height: '24px', width: '24px', objectFit: 'contain', border: '1px solid #475569', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Logo Uploaded</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Digital Signature (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      style={{...inputStyle, padding: '0.35rem'}}
                    />
                    {formData.signatureUrl && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={formData.signatureUrl} alt="Preview" style={{ height: '24px', width: '24px', objectFit: 'contain', border: '1px solid #475569', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Signature Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Tax Details
                </h4>
                <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>GSTIN / Tax ID</label>
                    <input 
                      type="text" 
                      value={formData.gstin}
                      onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      style={inputStyle}
                      placeholder="e.g. 27ALQPB3481K1ZR"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>PAN Number</label>
                    <input 
                      type="text" 
                      value={formData.pan}
                      onChange={(e) => setFormData(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                      style={inputStyle}
                      placeholder="e.g. ALQPB3481K"
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem', textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3. Bank Account Details (For Invoice Printing)
                </h4>
                <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Account Holder Name</label>
                    <input 
                      type="text"
                      value={formData.bankAccHolder}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankAccHolder: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. Acme Corp Invoices"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Bank Name</label>
                    <input 
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. YES BANK"
                    />
                  </div>
                </div>

                <div className="onboarding-grid" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Account Number</label>
                    <input 
                      type="text"
                      value={formData.bankAccNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankAccNumber: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. 021261900003481"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>IFSC Code</label>
                    <input 
                      type="text"
                      value={formData.bankIfsc}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                      style={inputStyle}
                      placeholder="e.g. YESB0000212"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Branch Name</label>
                    <input 
                      type="text"
                      value={formData.bankBranch}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankBranch: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. Kandivali East"
                    />
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  4. Workspace Styling & Subscription Tier
                </h4>
                <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Select Dashboard Theme</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {[
                        { id: 'DEFAULT', name: 'Classic Orange', color: '#fb923c' },
                        { id: 'EMERALD', name: 'Emerald Green', color: '#10b981' },
                        { id: 'SAPPHIRE', name: 'Sapphire Blue', color: '#3b82f6' },
                        { id: 'ROYAL', name: 'Royal Gold', color: '#fbbf24' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, theme: t.id }))}
                          style={{
                            flex: 1,
                            backgroundColor: formData.theme === t.id ? '#1e293b' : '#0f172a',
                            border: `2px solid ${formData.theme === t.id ? t.color : '#334155'}`,
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: '#fff',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: t.color }} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Workspace Subscription Tier</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {[
                        { id: 'FREE', name: 'Free Tier', badge: 'Standard Features' },
                        { id: 'PREMIUM', name: 'Premium Tier 👑', badge: 'Advanced Layouts' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tier: p.id }))}
                          style={{
                            flex: 1,
                            backgroundColor: formData.tier === p.id ? '#1e293b' : '#0f172a',
                            border: `2px solid ${formData.tier === p.id ? '#818cf8' : '#334155'}`,
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: '#fff',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{ fontWeight: formData.tier === p.id ? 'bold' : 'normal' }}>{p.name}</span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{p.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowOnboarding(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#94a3b8',
                    padding: '0.65rem 2rem',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.65rem 2.5rem',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  Complete Onboarding & Launch →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling Constants
const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(21, 28, 47, 0.45)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '18px',
  padding: '2rem',
  cursor: 'default',
  textAlign: 'left'
};

const iconContainerStyle: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '1rem',
  display: 'inline-block'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#94a3b8',
  marginBottom: '0.45rem',
  textAlign: 'left'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#0a0d16',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: '#fff',
  padding: '0.65rem 0.95rem',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  textAlign: 'left',
  transition: 'border-color 0.2s'
};
