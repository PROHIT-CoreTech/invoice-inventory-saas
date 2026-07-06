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
    signatureUrl: ''
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
          signatureUrl: ''
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

  return (
    <div className="landing-container" style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Decorative Background Gradients */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '15%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '35vw',
        height: '35vw',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
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
          <img src="/images/hero.png" alt="Logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff' }}>
            PROCash <span style={{ color: '#6366f1' }}>Invoices</span>
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '900px',
        margin: '5rem auto 3rem auto',
        textAlign: 'center',
        padding: '0 1.5rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          padding: '0.35rem 1rem',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 15 pink, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#818cf8',
          marginBottom: '2rem'
        }}>
          ✨ Next-Gen SaaS Billing Solution
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: '#fff',
          marginBottom: '1.5rem'
        }}>
          The Automated Billing Engine For <br />
          <span style={{
            background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Growing Businesses
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.25rem',
          color: '#94a3b8',
          maxWidth: '650px',
          margin: '0 auto 3rem auto',
          lineHeight: 1.5
        }}>
          Automate your quotation-to-invoice lifecycle, generate Tally-compliant GST reports dynamically, and route workflows under client subdomains.
        </p>

        {/* Interactive Workspace Redirection Form */}
        <div style={{
          maxWidth: '550px',
          margin: '0 auto',
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '1rem', textAlign: 'left' }}>
            Access or Create Workspace
          </h3>
          <form onSubmit={handleLaunch} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#0f172a',
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              position: 'relative'
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
                  fontWeight: 500
                }}
              />
              <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
                {getSuffix()}
              </span>
            </div>
            
            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, textAlign: 'left' }}>
                ⚠️ {error}
              </p>
            )}

            <button type="submit" style={{
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              padding: '0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
              boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
            >
              Launch Invoice Workspace →
            </button>
          </form>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.85rem', textAlign: 'center' }}>
            Try routing with "company-a" or "sandbox" for local testing.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{
        maxWidth: '1100px',
        margin: '6rem auto 3rem auto',
        padding: '0 1.5rem',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', color: '#fff', marginBottom: '3rem' }}>
          Engineered for Enterprise Productivity
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1 */}
          <div className="feature-card" style={cardStyle}>
            <div style={iconContainerStyle}>📁</div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Lifecycle Conversion</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Convert quotation directly to proforma or final invoice with a linked conversion history trail automatically.
            </p>
          </div>
          {/* Card 2 */}
          <div className="feature-card" style={cardStyle}>
            <div style={iconContainerStyle}>🇮🇳</div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>GST Tax Splitting</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Compliant tax splitting. Auto CGST/SGST for local clients, and IGST for inter-state clients based on GSTIN codes.
            </p>
          </div>
          {/* Card 3 */}
          <div className="feature-card" style={cardStyle}>
            <div style={iconContainerStyle}>🔌</div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Multi-DB Automation</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Run with SQLite locally for offline speeds, and deploy to PostgreSQL, MySQL or MongoDB cluster instantly.
            </p>
          </div>
          {/* Card 4 */}
          <div className="feature-card" style={cardStyle}>
            <div style={iconContainerStyle}>🔒</div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Subdomain Isolation</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Dynamic tenant isolation mapping routing. Subdomain detection separates client records seamlessly.
            </p>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1e293b',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.875rem',
        position: 'relative',
        zIndex: 1
      }}>
        <p>© 2026 PROCash Invoices ERP. All rights reserved.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
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
              padding: 0
            }}
          >
            🔒 System Admin
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
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            boxSizing: 'border-box'
          }}>
            <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                🏢 Onboard Your Invoice Workspace
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Enter the branding, tax, and bank details for <strong style={{ color: '#818cf8' }}>{onboardingTenant}{getSuffix()}</strong>. These details will render on your professional GST invoices automatically.
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '1.25rem', textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Company Profile
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
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

              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '1.25rem', textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Tax Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ textAlign: 'left' }}>
                <h4 style={{ color: '#818cf8', fontSize: '0.9rem', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3. Bank Account Details (For Invoice Printing)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowOnboarding(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #475569',
                    color: '#94a3b8',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
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
                    backgroundColor: '#6366f1',
                    border: 'none',
                    color: '#fff',
                    padding: '0.65rem 2rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  Launch Workspace →
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
  backgroundColor: 'rgba(30, 41, 59, 0.4)',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  padding: '1.75rem',
  transition: 'transform 0.25s, border-color 0.25s',
  cursor: 'default'
};

const iconContainerStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  marginBottom: '1rem',
  display: 'inline-block'
};

const pricingCardStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '2rem',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
  color: '#94a3b8',
  marginBottom: '0.35rem',
  textAlign: 'left'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#0f172a',
  border: '1px solid #475569',
  borderRadius: '6px',
  color: '#fff',
  padding: '0.5rem 0.75rem',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  textAlign: 'left'
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  fontSize: '0.875rem',
  color: '#e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
  textAlign: 'left'
};
