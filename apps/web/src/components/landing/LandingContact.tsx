import React, { useState } from 'react';

export const LandingContact: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    workEmail: '',
    fleetSize: '1 - 10 Vehicles',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

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
          subject: `New Fleet Inquiry from ${formData.fullName}`,
          from_name: 'PROCash Invoices Landing Page',
          name: formData.fullName,
          phone: formData.mobileNumber,
          email: formData.workEmail,
          fleet_size: formData.fleetSize,
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
            fleetSize: '1 - 10 Vehicles',
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
          backgroundColor: '#f4f8fd',
          borderRadius: '24px',
          padding: '3.5rem 2.5rem',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
            WE'RE HERE TO HELP YOU SCALE YOUR FLEET
          </h2>
          <p
            style={{
              color: '#64748b',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Have questions about enterprise custom plans, API integrations, or hardware compatibility? Our specialist team is ready to assist.
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
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              <h4
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#334155',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  marginTop: 0
                }}
              >
                LOCATION
              </h4>
              <p style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.5, fontWeight: 600 }}>
                Mumbai, Maharashtra, India
              </p>
            </div>

            {/* Card 2: Email Us Directly */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              <h4
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#334155',
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
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                Typical response time: under 2 hours
              </p>
            </div>

            {/* Card 3: Hours */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              <h4
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#334155',
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
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                Direct Phone Support: +91 757 839 7539
              </p>
            </div>
          </div>

          {/* Right Column - Send Us a Message Form Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '2.25rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
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
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#166534'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 700 }}>Inquiry Submitted!</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#15803d' }}>
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
                        transition: 'border-color 0.2s'
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
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>
                </div>

                {/* Row 2: Work Email & Fleet Size */}
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
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label
                      htmlFor="fleetSize"
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: '#475569',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}
                    >
                      FLEET SIZE
                    </label>
                    <select
                      id="fleetSize"
                      value={formData.fleetSize}
                      onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
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
                    >
                      <option value="1 - 10 Vehicles">1 - 10 Vehicles</option>
                      <option value="11 - 50 Vehicles">11 - 50 Vehicles</option>
                      <option value="51 - 200 Vehicles">51 - 200 Vehicles</option>
                      <option value="200+ Vehicles">200+ Vehicles</option>
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
                    placeholder="Tell us about your fleet requirements..."
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
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Row 4: Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: loading ? '#94a3b8' : '#0284c7',
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
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(2, 132, 199, 0.3)',
                    opacity: loading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#0369a1';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#0284c7';
                      e.currentTarget.style.transform = 'translateY(0px)';
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
