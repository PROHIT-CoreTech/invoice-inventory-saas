import React from 'react';

interface LandingFooterProps {
  onOpenAdmin: () => void;
  onNavigate?: (path: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenAdmin, onNavigate }) => {
  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <footer
      style={{
        backgroundColor: '#090d16',
        color: '#94a3b8',
        borderTop: '1px solid #1e293b',
        padding: '4.5rem 2rem 2.5rem',
        fontFamily: "'Plus Jakarta Sans', 'Outfit', 'Inter', sans-serif",
        position: 'relative',
        zIndex: 10
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem'
        }}
      >
        {/* Brand & Overview Column */}
        <div style={{ maxWidth: '340px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1rem',
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}
          >
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
              }}
            >
              ⚡
            </span>
            <span>
              PROCash <span style={{ color: '#818cf8' }}>Invoices</span>
            </span>
          </div>

          <p
            style={{
              fontSize: '0.875rem',
              lineHeight: 1.65,
              color: '#94a3b8',
              marginBottom: '1.25rem'
            }}
          >
            Multi-tenant invoicing &amp; GST compliance billing engine. Automated tax calculations, digital quotation-to-invoice workflows, and isolated subdomains for modern enterprises.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#cbd5e1'
            }}
          >
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px'
              }}
            >
              🔒 256-Bit SSL
            </span>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px'
              }}
            >
              🛡️ Indian GST Compliant
            </span>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px'
              }}
            >
              ⚡ Tenant Isolation
            </span>
          </div>
        </div>

        {/* Product / Solutions Column */}
        <div>
          <h4
            style={{
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1.25rem',
              marginTop: 0
            }}
          >
            Product &amp; Features
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <li>
              <a
                href="#features"
                onClick={(e) => handleLinkClick(e, '#features')}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                GST Invoicing &amp; Quotations
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                onClick={(e) => handleLinkClick(e, '#pricing')}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                Subscription Plans &amp; Pricing
              </a>
            </li>
            <li>
              <a
                href="#features"
                onClick={(e) => handleLinkClick(e, '#features')}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                Android Companion App
              </a>
            </li>
            <li>
              <a
                href="#get-started"
                onClick={(e) => handleLinkClick(e, '#')}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                10-Day Free Trial
              </a>
            </li>
            <li>
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenAdmin();
                }}
                style={{
                  color: '#818cf8',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
              >
                <span>🔒</span> System Admin Portal
              </a>
            </li>
          </ul>
        </div>

        {/* COMPLIANCE & LEGAL (Exact match to user's screenshot!) */}
        <div>
          <h4
            style={{
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1.25rem',
              marginTop: 0
            }}
          >
            COMPLIANCE &amp; LEGAL
          </h4>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <li>
              <a
                href="/terms"
                onClick={(e) => handleLinkClick(e, '/terms')}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                Terms &amp; Conditions
              </a>
            </li>
            <li>
              <a
                href="/privacy"
                onClick={(e) => handleLinkClick(e, '/privacy')}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/refund-policy"
                onClick={(e) => handleLinkClick(e, '/refund-policy')}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                Refund &amp; Cancellation Policy
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, '#contact')}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Company Details */}
        <div>
          <h4
            style={{
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1.25rem',
              marginTop: 0
            }}
          >
            Direct Support
          </h4>
          <p
            style={{
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: '#94a3b8',
              marginBottom: '0.85rem'
            }}
          >
            Need enterprise billing setup, custom GST templates, or assistance?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Email: </span>
              <a href="mailto:info@prohitcoretech.com" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                info@prohitcoretech.com
              </a>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Phone: </span>
              <a href="tel:+917578397539" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                +91 757 839 7539
              </a>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Hours: Mon - Sat, 10:00 - 19:00 IST
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Separator & Copyright */}
      <div
        style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}
      >
        <div>
          © 2026 PROCash Invoices ERP. Developed &amp; Operated by <strong>PROHIT CORETECH</strong>. All rights reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'inline-block',
                boxShadow: '0 0 8px #10b981'
              }}
            />
            All Systems Operational
          </span>
          <span style={{ color: '#475569' }}>•</span>
          <span>v2.4.0 High-Availability</span>
        </div>
      </div>
    </footer>
  );
};
