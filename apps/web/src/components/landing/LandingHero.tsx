import React from 'react';

interface LandingHeroProps {
  tenantName: string;
  setTenantName: (val: string) => void;
  error: string;
  getSuffix: () => string;
  onLaunch: (e: React.FormEvent) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  tenantName,
  setTenantName,
  error,
  getSuffix,
  onLaunch
}) => {
  return (
    <div className="hero-left-content">
      {/* Glowing Premium Badge */}
      <div className="hero-badge">
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#818cf8',
            animation: 'pulse 1.8s infinite'
          }}
        />
        Enterprise Quotation & Billing Engine
      </div>

      {/* Heading */}
      <h1 className="hero-heading">
        The Automated Billing <br />
        <span
          style={{
            background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #fb923c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}
        >
          Engine For SaaS
        </span>
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle">
        Automate your quotation-to-invoice lifecycle, generate Tally-compliant GST reports, and isolate workflows under client-specific subdomains.
      </p>

      {/* Interactive Workspace Redirection Form */}
      <div className="hero-form-container">
        <h3 className="form-title">Launch or Access Workspace</h3>
        <form
          onSubmit={onLaunch}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          <div className="subdomain-input-container">
            <input
              type="text"
              placeholder="your-company-name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="subdomain-input"
            />
            <span className="subdomain-suffix">{getSuffix()}</span>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, textAlign: 'left', fontWeight: 600 }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            style={{
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
  );
};
