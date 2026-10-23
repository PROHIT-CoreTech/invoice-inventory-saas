import React, { useState } from 'react';

export const LandingContact: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    workEmail: '',
    companySize: '1 - 10 Employees (Small Business)',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'fb606c64-f1b5-4d59-aac9-e8b592ffce07';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `New Business Inquiry from ${formData.fullName}`,
          from_name: 'PROCash Invoices Landing Page',
          name: formData.fullName,
          phone: formData.mobileNumber,
          email: formData.workEmail,
          company_size: formData.companySize,
          message: formData.message
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            fullName: '',
            mobileNumber: '',
            workEmail: '',
            companySize: '1 - 10 Employees (Small Business)',
            message: ''
          });
        }, 5000);
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Web3Forms submit error:', error);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      style={{
        maxWidth: '1200px',
        margin: '5rem auto 4rem auto',
        padding: '0 1rem',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div
        className="get-in-touch-container"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '3.5rem 2.5rem',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          color: '#0f172a'
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              color: '#0284c7',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '0.5rem'
            }}
          >
            GET IN TOUCH
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}
          >
            WE'RE HERE TO HELP YOU SCALE YOUR BUSINESS
          </h2>
          <p
            style={{
              color: '#475569',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Have questions about enterprise custom plans, multi-user workflows, or custom GST billing requirements? Our specialist team is ready to assist.
          </p>
        </div>

        {/* Content Grid */}
        <div
          className="get-in-touch-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start'
          }}
        >
          {/* Left Column - Contact Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Card 1: Location */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
              }}
            >
              <h4
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  marginTop: 0
                }}
              >
                LOCATION
              </h4>
              <p style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.5, fontWeight: 700 }}>
                Mumbai, Maharashtra, India
              </p>
            </div>

            {/* Card 2: Email Us Directly */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
              }}
            >
              <h4
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  marginTop: 0
                }}
              >
                EMAIL US DIRECTLY
              </h4>
              <a
                href="mailto:info@prohitcoretech.com"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0284c7',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginBottom: '0.4rem'
                }}
              >
                info@prohitcoretech.com
              </a>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                Typical response time: under 2 hours
              </p>
            </div>

            {/* Card 3: Hours */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
              }}
            >
              <h4
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  marginTop: 0
                }}
              >
                HOURS
              </h4>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '0.4rem'
                }}
              >
                Mon–Sat, 10:00–19:00 IST
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                Direct Phone Support: +91 757 839 7539
              </p>
            </div>
          </div>

          {/* Right Column - Send Us a Message Form Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '2.25rem',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
            }}
          >
            <h3
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#0f172a',
                marginTop: 0,
                marginBottom: '1.75rem'
              }}
            >
              Send Us a Message
            </h3>

            {submitted ? (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #10b981',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#059669'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 700 }}>Inquiry Submitted!</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#047857' }}>
                  Thank you for contacting us. Our specialist team will reach out to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Row 1: Full Name & Mobile Number */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label
                      htmlFor="fullName"
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#475569',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}
                    >
                      FULL NAME
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.95rem',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0284c7';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label
                      htmlFor="mobileNumber"
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#475569',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}
                    >
                      MOBILE NUMBER
                    </label>
                    <input
                      id="mobileNumber"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.95rem',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0284c7';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Row 2: Work Email & Business Size */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label
                      htmlFor="workEmail"
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#475569',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}
                    >
                      WORK EMAIL
                    </label>
                    <input
                      id="workEmail"
                      type="email"
                      required
                      placeholder="john@company.com"
                      value={formData.workEmail}
                      onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.95rem',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0284c7';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label
                      htmlFor="companySize"
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#475569',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}
                    >
                      BUSINESS / COMPANY SIZE
                    </label>
                    <select
                      id="companySize"
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.95rem',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        appearance: 'auto'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0284c7';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="1 - 10 Employees (Small Business)">1 - 10 Employees (Small Business)</option>
                      <option value="11 - 50 Employees (Mid-Market)">11 - 50 Employees (Mid-Market)</option>
                      <option value="51 - 200 Employees (Growing Business)">51 - 200 Employees (Growing Business)</option>
                      <option value="200+ Employees (Enterprise ERP)">200+ Employees (Enterprise ERP)</option>
                      <option value="Freelancer / Independent">Freelancer / Independent</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Message / Requirement */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label
                    htmlFor="message"
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#475569',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}
                  >
                    MESSAGE / REQUIREMENT
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    placeholder="Tell us about your billing & invoice requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0284c7';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Row 4: Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(2, 132, 199, 0.3)',
                    opacity: loading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(2, 132, 199, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(2, 132, 199, 0.3)';
                    }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Inquiry \u2192'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
