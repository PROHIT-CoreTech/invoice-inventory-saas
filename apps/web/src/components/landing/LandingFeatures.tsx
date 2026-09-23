import React from 'react';

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

export const LandingFeatures: React.FC = () => {
  return (
    <section
      id="features"
      style={{
        maxWidth: '1200px',
        margin: '6rem auto 4rem auto',
        padding: '0 1rem',
        position: 'relative',
        zIndex: 1
      }}
    >
      <h2
        style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          textAlign: 'center',
          color: '#fff',
          marginBottom: '2.5rem',
          letterSpacing: '-0.02em'
        }}
      >
        Engineered for Enterprise Productivity
      </h2>
      <div className="marquee-wrapper">
        <div className="marquee-track marquee-track-slow">
          {[1, 2].map((groupIndex) => (
            <React.Fragment key={groupIndex}>
              <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                <div style={iconContainerStyle}>📁</div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Lifecycle Conversion</h4>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Convert quotations directly to proforma or final invoices with a linked, searchable history trail.
                </p>
              </div>

              <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                <div style={iconContainerStyle}>🇮🇳</div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>GST Tax Splitting</h4>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Automatic CGST/SGST calculation for intra-state clients and IGST for inter-state clients based on GSTIN codes.
                </p>
              </div>

              <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                <div style={iconContainerStyle}>🔌</div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Multi-DB Automation</h4>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Optimized for SQLite locally, but ready to deploy onto enterprise PostgreSQL or MongoDB clusters instantly.
                </p>
              </div>

              <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                <div style={iconContainerStyle}>🔒</div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Subdomain Isolation</h4>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Robust tenant multi-tenancy verification. Subdomain mapping isolates customer data structures securely.
                </p>
              </div>

              <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                <div style={iconContainerStyle}>📊</div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Instant Data Exports</h4>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  One-click Excel reports and CSV data exports formatted for seamless accounting audit workflows.
                </p>
              </div>

              <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                <div style={iconContainerStyle}>💬</div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>One-Click Sharing</h4>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Send professional PDF invoices directly to clients via WhatsApp web API or automated email links.
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
