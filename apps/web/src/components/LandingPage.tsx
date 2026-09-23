import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onOpenAdmin: () => void;
}

export default function LandingPage({ onOpenAdmin }: LandingPageProps) {
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');

  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${window.location.host}/api`;
    }
    return 'http://localhost:5001/api';
  };

  const [dynamicPlans, setDynamicPlans] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/subscription-plans`);
        if (res.ok) {
          const plansList = await res.json();
          const plansMap: Record<string, any> = {};
          plansList.forEach((p: any) => {
            plansMap[p.planId] = p;
          });
          setDynamicPlans(plansMap);
        }
      } catch (e) {
        console.error('Failed to load dynamic pricing plans:', e);
      }
    };
    fetchPlans();
  }, []);

  const getSuffix = () => {
    if (typeof window === 'undefined') return '.biling.prohitcoretech.com';
    const host = window.location.host;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return `.localhost${window.location.port ? `:${window.location.port}` : ''}`;
    }
    return `.${host}`;
  };

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number } | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'STEP1' | 'STEP2' | 'STEP3_PAYMENT'>('STEP1');
  const [checkoutForm, setCheckoutForm] = useState({
    tenant: '',
    companyName: '',
    name: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    bankName: '',
    bankAccHolder: '',
    bankAccNumber: '',
    bankIfsc: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  const getUpiUrl = () => {
    if (!selectedPlan) return '';
    const formattedTenant = checkoutForm.tenant.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Plan code mapping
    let planCode = 'MON';
    if (selectedPlan.id === '6_MONTHS') planCode = 'PRO';
    else if (selectedPlan.id === '1_YEAR') planCode = 'ENT';
    else if (selectedPlan.id === 'LIFETIME') planCode = 'LIF';

    // Strict 35 character max transaction note: SUB-[TIER_CODE]-[TENANT_ID]
    const tn = `SUB-${planCode}-${formattedTenant}`.substring(0, 35);
    
    return `upi://pay?pa=rohitbarge22-3@okaxis&pn=ROHIT%20BARGE&am=${selectedPlan.price.toFixed(2)}&cu=INR&tn=${encodeURIComponent(tn)}`;
  };

  const getUpiNote = () => {
    if (!selectedPlan) return '';
    const formattedTenant = checkoutForm.tenant.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    let planCode = 'MON';
    if (selectedPlan.id === '6_MONTHS') planCode = 'PRO';
    else if (selectedPlan.id === '1_YEAR') planCode = 'ENT';
    else if (selectedPlan.id === 'LIFETIME') planCode = 'LIF';
    return `SUB-${planCode}-${formattedTenant}`.substring(0, 35);
  };

  const handleOpenCheckout = (planId: string, planName: string, price: number) => {
    const currentTenant = tenantName.trim();
    setSelectedPlan({ id: planId, name: planName, price: price });
    setCheckoutForm({
      tenant: currentTenant,
      companyName: currentTenant ? currentTenant.toUpperCase() + ' INVOICES' : '',
      name: '',
      email: '',
      phone: '',
      gstin: '',
      pan: '',
      bankName: '',
      bankAccHolder: '',
      bankAccNumber: '',
      bankIfsc: ''
    });
    setCheckoutStep('STEP1');
    setUtrNumber('');
    setPaymentStatusMessage('');
    setShowCheckoutModal(true);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.tenant.trim()) {
      alert('Please enter a workspace subdomain.');
      return;
    }
    if (!checkoutForm.companyName.trim()) {
      alert('Please enter a company / workspace name.');
      return;
    }
    if (!checkoutForm.name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!checkoutForm.email.trim()) {
      alert('Please enter your email address.');
      return;
    }
    if (!checkoutForm.phone.trim()) {
      alert('Please enter your phone number.');
      return;
    }
    setCheckoutStep('STEP2');
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan?.id === 'TRIAL') {
      handleTrialActivation();
      return;
    }
    setCheckoutStep('STEP3_PAYMENT');
  };

  const handleTrialActivation = async () => {
    setPaymentLoading(true);
    setPaymentStatusMessage('Creating workspace & activating 10-day free trial...');
    const formattedTenant = checkoutForm.tenant.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/tenant-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': formattedTenant
        },
        body: JSON.stringify({
          companyName: checkoutForm.companyName || (formattedTenant.toUpperCase() + ' INVOICES'),
          proprietorName: checkoutForm.name,
          address: 'India',
          gstin: checkoutForm.gstin || null,
          pan: checkoutForm.pan || null,
          bankName: checkoutForm.bankName || null,
          bankAccHolder: checkoutForm.bankAccHolder || checkoutForm.name || null,
          bankAccNumber: checkoutForm.bankAccNumber || null,
          bankIfsc: checkoutForm.bankIfsc || null,
          theme: 'DEFAULT',
          tier: 'FREE'
        })
      });

      const res = await fetch(`${baseUrl}/payments/start-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': formattedTenant
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to activate free trial.');
      }

      setPaymentStatusMessage('🎉 Free trial activated successfully! Opening workspace...');
      setTimeout(() => {
        window.location.href = getRedirectUrl(formattedTenant);
      }, 1500);
    } catch (err: any) {
      setPaymentStatusMessage(`❌ Error: ${err.message}`);
      setPaymentLoading(false);
    }
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length !== 12) {
      alert('Please enter a valid 12-digit numeric UPI Ref / UTR number.');
      return;
    }

    setPaymentLoading(true);
    setPaymentStatusMessage('Saving profile & submitting UTR payment for activation...');
    const formattedTenant = checkoutForm.tenant.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    try {
      const baseUrl = getApiBaseUrl();

      // 1. Save Workspace Profile with Tax & Bank Credentials
      await fetch(`${baseUrl}/tenant-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': formattedTenant
        },
        body: JSON.stringify({
          companyName: checkoutForm.companyName || (formattedTenant.toUpperCase() + ' INVOICES'),
          proprietorName: checkoutForm.name,
          address: 'India',
          gstin: checkoutForm.gstin || null,
          pan: checkoutForm.pan || null,
          bankName: checkoutForm.bankName || null,
          bankAccHolder: checkoutForm.bankAccHolder || checkoutForm.name || null,
          bankAccNumber: checkoutForm.bankAccNumber || null,
          bankIfsc: checkoutForm.bankIfsc || null,
          theme: 'DEFAULT',
          tier: 'PREMIUM'
        })
      });

      // 2. Submit Subscription UTR
      const res = await fetch(`${baseUrl}/subscriptions/submit-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': formattedTenant
        },
        body: JSON.stringify({
          planTier: selectedPlan?.id,
          amountPaid: selectedPlan?.price,
          utrNumber: cleanUtr
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Verification submission failed.');
      }

      const responseData = await res.json();
      setPaymentStatusMessage(`🎉 ${responseData.message || 'Payment submitted successfully!'}`);
      
      setTimeout(() => {
        window.location.href = getRedirectUrl(formattedTenant);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setPaymentStatusMessage(`❌ Error: ${err.message || 'UTR submission failed.'}`);
      setPaymentLoading(false);
    }
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
      <header className="landing-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
          <span className="logo-title">
            PROCash <span style={{ color: '#818cf8' }}>Invoices</span>
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-grid hero-section">
        {/* Left Column: Hero badge, heading, subtitle and workspace access */}
        <div className="hero-left-content">
          {/* Glowing Premium Badge */}
          <div className="hero-badge">
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#818cf8', animation: 'pulse 1.8s infinite' }} />
            Enterprise Quotation & Billing Engine
          </div>

          {/* Heading */}
          <h1 className="hero-heading">
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
          <p className="hero-subtitle">
            Automate your quotation-to-invoice lifecycle, generate Tally-compliant GST reports, and isolate workflows under client-specific subdomains.
          </p>

          {/* Interactive Workspace Redirection Form */}
          <div className="hero-form-container">
            <h3 className="form-title">
              Launch or Access Workspace
            </h3>
            <form onSubmit={handleLaunch} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div className="subdomain-input-container" style={{
                transition: 'border-color 0.2s'
              }}>
                <input 
                  type="text"
                  placeholder="your-company-name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="subdomain-input"
                />
                <span className="subdomain-suffix">
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

      {/* Features Marquee Section */}
      <section id="features" style={{
        maxWidth: '1200px',
        margin: '6rem auto 4rem auto',
        padding: '0 1rem',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, textAlign: 'center', color: '#fff', marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>
          Engineered for Enterprise Productivity
        </h2>
        <div className="marquee-wrapper">
          <div className="marquee-track marquee-track-slow">
            {[1, 2].map((groupIndex) => (
              <React.Fragment key={groupIndex}>
                {/* Feature 1 */}
                <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                  <div style={iconContainerStyle}>📁</div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Lifecycle Conversion</h4>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Convert quotations directly to proforma or final invoices with a linked, searchable history trail.
                  </p>
                </div>
                {/* Feature 2 */}
                <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                  <div style={iconContainerStyle}>🇮🇳</div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>GST Tax Splitting</h4>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Automatic CGST/SGST calculation for intra-state clients and IGST for inter-state clients based on GSTIN codes.
                  </p>
                </div>
                {/* Feature 3 */}
                <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                  <div style={iconContainerStyle}>🔌</div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Multi-DB Automation</h4>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Optimized for SQLite locally, but ready to deploy onto enterprise PostgreSQL or MongoDB clusters instantly.
                  </p>
                </div>
                {/* Feature 4 */}
                <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                  <div style={iconContainerStyle}>🔒</div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Subdomain Isolation</h4>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Robust tenant multi-tenancy verification. Subdomain mapping isolates customer data structures securely.
                  </p>
                </div>
                {/* Feature 5 */}
                <div className="feature-card marquee-card-item" style={{ ...cardStyle, textAlign: 'left' }}>
                  <div style={iconContainerStyle}>📊</div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Instant Data Exports</h4>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    One-click Excel reports and CSV data exports formatted for seamless accounting audit workflows.
                  </p>
                </div>
                {/* Feature 6 */}
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

      {/* Pricing Section */}
      <section id="pricing" style={{
        maxWidth: '1200px',
        margin: '6rem auto 4rem auto',
        padding: '0 1rem',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Flexible Plans for Fast-Growing Teams
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          Upgrade your workspace in seconds. All plans feature secure routing, automatic offline capability, and instant client synchronization.
        </p>

        {/* Free Trial Button Option */}
        <div style={{ marginBottom: '2.5rem' }}>
          <button 
            type="button" 
            onClick={() => handleOpenCheckout('TRIAL', '10-Day Free Trial', 0)}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              padding: '0.85rem 2.5rem',
              borderRadius: '30px',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.4)';
            }}
          >
            ⚡ Start 10-Day Free Trial
          </button>
        </div>

        {/* Marquee Pricing Slider */}
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[1, 2].map((loopIndex) => (
              <React.Fragment key={loopIndex}>
                {/* Plan 1: Monthly Starter */}
                {(() => {
                  const plan = dynamicPlans['1_MONTH'];
                  if (!plan || plan.isActive === false) return null;
                  const isOffer = plan.isOfferActive;
                  const price = plan.effectivePrice ?? plan.regularPrice;
                  return (
                    <div className="pricing-card marquee-card-item" style={{
                      ...cardStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isOffer ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)',
                      boxSizing: 'border-box',
                      position: 'relative',
                      textAlign: 'left'
                    }}>
                      {isOffer && (
                        <div style={{ position: 'absolute', top: '-12px', right: '1.5rem', backgroundColor: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          🔥 {plan.offerBadge || `${plan.savingsPercentage}% OFF`}
                        </div>
                      )}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>1 Month Plan</span>
                          <span style={{ fontSize: '0.7rem', color: isOffer ? '#34d399' : '#94a3b8', backgroundColor: isOffer ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.06)', padding: '0.25rem 0.6rem', borderRadius: '30px', fontWeight: 600 }}>
                            {isOffer ? `Save ₹${plan.savingsAmount}` : 'Base Rate'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                            <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#34d399' : '#fff' }}>₹{price.toLocaleString('en-IN')}</span>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ month</span>
                          </div>
                          {isOffer && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                              Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                          <li>✓ Full Quotation & Billing Engine</li>
                          <li>✓ Auto CGST / SGST Splitting</li>
                          <li>✓ Custom Branding & Signature</li>
                          <li>✓ Subdomain Isolation</li>
                          <li>✓ PDF Export & Print Templates</li>
                        </ul>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleOpenCheckout('1_MONTH', plan.name || '1 Month Plan', price)}
                        style={pricingBtnStyle}
                      >
                        Subscribe Starter
                      </button>
                    </div>
                  );
                })()}

                {/* Plan 2: Bi-Annual Pro */}
                {(() => {
                  const plan = dynamicPlans['6_MONTHS'];
                  if (!plan || plan.isActive === false) return null;
                  const isOffer = plan.isOfferActive;
                  const price = plan.effectivePrice ?? plan.regularPrice;
                  const monthlyEquivalent = plan.monthlyEquivalentPrice || Math.round(price / 6);
                  const savingsVsMonthlyPct = plan.savingsVsMonthlyPercentage || 44;
                  const savingsAmount = plan.savingsVsMonthlyAmount || (1499 * 6 - price);
                  return (
                    <div className="pricing-card marquee-card-item" style={{
                      ...cardStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isOffer ? '1px solid #10b981' : '1px solid rgba(99, 102, 241, 0.4)',
                      position: 'relative',
                      backgroundColor: 'rgba(21, 28, 47, 0.6)',
                      boxSizing: 'border-box',
                      textAlign: 'left'
                    }}>
                      <div style={{ position: 'absolute', top: '-12px', right: '1.5rem', backgroundColor: isOffer ? '#10b981' : '#6366f1', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {isOffer ? `🔥 ${plan.offerBadge || 'OFFER'}` : `Save ${savingsVsMonthlyPct}%`}
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>6 Months Plan</span>
                          <span style={{ fontSize: '0.7rem', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '30px', fontWeight: 700 }}>
                            Save ₹{savingsAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                            <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#34d399' : '#fff' }}>₹{price.toLocaleString('en-IN')}</span>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 6 months</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>💡 Just ₹{monthlyEquivalent.toLocaleString('en-IN')}/mo</span>
                            <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>(Save {savingsVsMonthlyPct}% vs Monthly)</span>
                          </div>
                          {isOffer && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                              Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                          <li>✓ <strong>All Starter features included</strong></li>
                          <li>✓ Priority Database Syncing</li>
                          <li>✓ Multi-device Workspace Session</li>
                          <li>✓ Premium Document Layouts</li>
                          <li>✓ Dedicated Developer Support</li>
                        </ul>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleOpenCheckout('6_MONTHS', plan.name || '6 Months Plan', price)}
                        style={{...pricingBtnStyle, background: 'linear-gradient(135deg, #6366f1, #4f46e5)'}}
                      >
                        Subscribe Pro
                      </button>
                    </div>
                  );
                })()}

                {/* Plan 3: Annual Enterprise */}
                {(() => {
                  const plan = dynamicPlans['1_YEAR'];
                  if (!plan || plan.isActive === false) return null;
                  const isOffer = plan.isOfferActive;
                  const price = plan.effectivePrice ?? plan.regularPrice;
                  const monthlyEquivalent = plan.monthlyEquivalentPrice || Math.round(price / 12);
                  const savingsVsMonthlyPct = plan.savingsVsMonthlyPercentage || 44;
                  const savingsAmount = plan.savingsVsMonthlyAmount || (1499 * 12 - price);
                  return (
                    <div className="pricing-card marquee-card-item" style={{
                      ...cardStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isOffer ? '1px solid #10b981' : '1px solid rgba(251, 146, 60, 0.4)',
                      boxSizing: 'border-box',
                      position: 'relative',
                      textAlign: 'left'
                    }}>
                      <div style={{ position: 'absolute', top: '-12px', right: '1.5rem', backgroundColor: isOffer ? '#10b981' : '#f97316', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {isOffer ? `🔥 ${plan.offerBadge || 'OFFER'}` : '🏆 Best Value (Save 44%)'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>1 Year Plan</span>
                          <span style={{ fontSize: '0.7rem', color: '#fb923c', backgroundColor: 'rgba(251, 146, 60, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '30px', fontWeight: 700 }}>
                            Save ₹{savingsAmount.toLocaleString('en-IN')}/yr
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                            <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#34d399' : '#fff' }}>₹{price.toLocaleString('en-IN')}</span>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ year</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#fb923c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>💡 Just ₹{monthlyEquivalent.toLocaleString('en-IN')}/mo</span>
                            <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>(Save {savingsVsMonthlyPct}% vs Monthly)</span>
                          </div>
                          {isOffer && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                              Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                          <li>✓ <strong>All Pro features included</strong></li>
                          <li>✓ Zero Transaction Limits</li>
                          <li>✓ Advanced Analytics Dashboard</li>
                          <li>✓ Tally & ERP Compliant Exports</li>
                          <li>✓ Premium 24/7 SLA Service</li>
                        </ul>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleOpenCheckout('1_YEAR', plan.name || '1 Year Plan', price)}
                        style={{...pricingBtnStyle, background: 'linear-gradient(135deg, #ea580c, #c2410c)'}}
                      >
                        Subscribe Enterprise
                      </button>
                    </div>
                  );
                })()}

                {/* Plan 4: Lifetime Unlimited */}
                {(() => {
                  const plan = dynamicPlans['LIFETIME'];
                  if (!plan || plan.isActive === false) return null;
                  const isOffer = plan.isOfferActive;
                  const price = plan.effectivePrice ?? plan.regularPrice;
                  return (
                    <div className="pricing-card marquee-card-item" style={{
                      ...cardStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isOffer ? '1px solid #10b981' : '1px solid rgba(168, 85, 247, 0.4)',
                      backgroundColor: 'rgba(26, 21, 47, 0.55)',
                      boxSizing: 'border-box',
                      position: 'relative',
                      textAlign: 'left'
                    }}>
                      <div style={{ position: 'absolute', top: '-12px', right: '1.5rem', backgroundColor: isOffer ? '#10b981' : '#a855f7', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {isOffer ? `🔥 ${plan.offerBadge || 'OFFER'}` : '⚡ Lifetime Deal'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Lifetime</span>
                          <span style={{ fontSize: '0.7rem', color: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.2)', padding: '0.25rem 0.6rem', borderRadius: '30px', fontWeight: 700 }}>
                            Zero Renewal Fees
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                            <span style={{ fontSize: '2.25rem', fontWeight: 900, color: isOffer ? '#34d399' : '#fff' }}>₹{price.toLocaleString('en-IN')}</span>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ one-time</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>⚡ Pays for itself in ~17 months</span>
                          </div>
                          {isOffer && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>
                              Regular Price: ₹{plan.regularPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                          <li>✓ <strong>All Enterprise features included</strong></li>
                          <li>✓ Permanent Lifetime License</li>
                          <li>✓ No Recurring Subscriptions</li>
                          <li>✓ Future Platform Updates Free</li>
                          <li>✓ VIP Priority Line Support</li>
                        </ul>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleOpenCheckout('LIFETIME', plan.name || 'Lifetime Plan', price)}
                        style={{...pricingBtnStyle, background: 'linear-gradient(135deg, #a855f7, #7c3aed)'}}
                      >
                        Go Lifetime Unlimited
                      </button>
                    </div>
                  );
                })()}
              </React.Fragment>
            ))}
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
        <div className="onboarding-overlay" style={{
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
                    <div className="theme-selection-container" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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
                    <div className="tier-selection-container" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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

      {/* Checkout Modal Overlay */}
      {showCheckoutModal && selectedPlan && (
        <div className="checkout-overlay" style={{
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
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <div className="onboarding-modal-card" style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            position: 'relative',
            boxSizing: 'border-box',
            textAlign: 'left',
            color: '#0f172a'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Subscription Setup & Checkout
                </h2>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCheckoutModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* 3-Step Wizard Progress Indicator Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', backgroundColor: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: checkoutStep === 'STEP1' ? '#4f46e5' : '#e2e8f0',
                  color: checkoutStep === 'STEP1' ? '#fff' : '#64748b',
                  fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>1</div>
                <span style={{ fontSize: '0.75rem', fontWeight: checkoutStep === 'STEP1' ? 700 : 500, color: checkoutStep === 'STEP1' ? '#4f46e5' : '#64748b' }}>
                  Subdomain & Profile
                </span>
              </div>

              <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>→</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: checkoutStep === 'STEP2' ? '#4f46e5' : '#e2e8f0',
                  color: checkoutStep === 'STEP2' ? '#fff' : '#64748b',
                  fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>2</div>
                <span style={{ fontSize: '0.75rem', fontWeight: checkoutStep === 'STEP2' ? 700 : 500, color: checkoutStep === 'STEP2' ? '#4f46e5' : '#64748b' }}>
                  Tax & Bank Credentials
                </span>
              </div>

              <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>→</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: checkoutStep === 'STEP3_PAYMENT' ? '#059669' : '#e2e8f0',
                  color: checkoutStep === 'STEP3_PAYMENT' ? '#fff' : '#64748b',
                  fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>3</div>
                <span style={{ fontSize: '0.75rem', fontWeight: checkoutStep === 'STEP3_PAYMENT' ? 700 : 500, color: checkoutStep === 'STEP3_PAYMENT' ? '#059669' : '#64748b' }}>
                  QR Payment
                </span>
              </div>
            </div>

            {/* STEP 1: Workspace Subdomain & Profile */}
            {checkoutStep === 'STEP1' && (
              <form onSubmit={handleStep1Next} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                    Workspace Subdomain *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. company-a"
                      value={checkoutForm.tenant}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, tenant: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                      style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                    />
                    <span style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 700 }}>{getSuffix()}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                    Your subscription will be linked to this workspace.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                    Company / Business Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Acme Corp Invoices"
                    value={checkoutForm.companyName}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, companyName: e.target.value }))}
                    style={{
                      width: '100%',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                    Full Name / Proprietor Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. John Doe"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                      style={{
                        width: '100%',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. 9988776655"
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                      style={{
                        width: '100%',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Next: Tax & Bank Credentials →
                </button>
              </form>
            )}

            {/* STEP 2: Government Tax Identifiers & Settlement Bank Credentials */}
            {checkoutStep === 'STEP2' && (
              <form onSubmit={handleStep2Next} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                      GSTIN Number (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      value={checkoutForm.gstin}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      style={{
                        width: '100%',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                      PAN Number (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. ABCDE1234F"
                      value={checkoutForm.pan}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                      style={{
                        width: '100%',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                    Settlement Bank Name (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. HDFC Bank / ICICI Bank"
                    value={checkoutForm.bankName}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, bankName: e.target.value }))}
                    style={{
                      width: '100%',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                      Account Number (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 50100123456789"
                      value={checkoutForm.bankAccNumber}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, bankAccNumber: e.target.value }))}
                      style={{
                        width: '100%',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.35rem' }}>
                      IFSC Code (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. HDFC0001234"
                      value={checkoutForm.bankIfsc}
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                      style={{
                        width: '100%',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setCheckoutStep('STEP1')}
                    style={{
                      flex: 1,
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={paymentLoading}
                    style={{
                      flex: 2,
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: paymentLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {selectedPlan.id === 'TRIAL' ? 'Activate 10-Day Free Trial →' : 'Next: Proceed to QR Payment →'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: QR Payment UI matching Screenshot 3 & Tenant Dashboard */}
            {checkoutStep === 'STEP3_PAYMENT' && (
              <form onSubmit={handleUtrSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Plan selector cards matching Screenshot 3 */}
                {Object.keys(dynamicPlans).length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                      SELECT / CHANGE SUBSCRIPTION PLAN:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                      {Object.values(dynamicPlans)
                        .filter((p: any) => p.isActive !== false)
                        .map((plan: any) => {
                          const isSelected = selectedPlan?.id === plan.planId;
                          return (
                            <button
                              key={plan.planId}
                              type="button"
                              onClick={() => setSelectedPlan({ id: plan.planId, name: plan.name, price: plan.price })}
                              style={{
                                backgroundColor: isSelected ? '#e0e7ff' : '#0f172a',
                                border: isSelected ? '2px solid #6366f1' : '1px solid #1e293b',
                                borderRadius: '8px',
                                padding: '0.55rem 0.75rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ color: isSelected ? '#4f46e5' : '#ffffff', fontWeight: 700, fontSize: '0.8rem' }}>
                                {plan.name}
                              </div>
                              <div style={{ color: isSelected ? '#6366f1' : '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                ₹{plan.price.toLocaleString()} / {plan.duration || 'period'}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Target plan summary banner matching Screenshot 3 */}
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '10px', padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>SELECTED TARGET PLAN</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{selectedPlan.name}</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>₹{selectedPlan.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* QR Payment UI */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    Scan the QR code below via GPay/PhonePe to make your payment, then enter the 12-digit UTR verification code.
                  </p>

                  {/* Dynamic UPI QR Code */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0 0.75rem 0' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=5&data=${encodeURIComponent(getUpiUrl())}`} 
                        alt="UPI QR Code" 
                        style={{ display: 'block', width: '180px', height: '180px' }} 
                      />
                    </div>
                  </div>

                  {/* Dark Payee Details Box */}
                  <div style={{ backgroundColor: '#0f172a', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem', textAlign: 'left' }}>
                    <div><span style={{ color: '#64748b' }}>Payee Name:</span> <strong style={{ color: '#ffffff' }}>ROHIT BARGE</strong></div>
                    <div><span style={{ color: '#64748b' }}>VPA:</span> <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>rohitbarge22-3@okaxis</strong></div>
                    <div><span style={{ color: '#64748b' }}>Transaction Note:</span> <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{getUpiNote()}</strong></div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>
                    Enter 12-digit UPI Ref / UTR Number *
                  </label>
                  <input 
                    type="text" 
                    required
                    pattern="\d{12}"
                    maxLength={12}
                    placeholder="e.g. 123456789012"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').substring(0, 12))}
                    style={{
                      width: '100%',
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {paymentStatusMessage && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#0f172a',
                    lineHeight: 1.4
                  }}>
                    {paymentStatusMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setCheckoutStep('STEP2');
                      setPaymentStatusMessage('');
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={paymentLoading}
                    style={{
                      flex: 2,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: paymentLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                      opacity: paymentLoading ? 0.7 : 1
                    }}
                  >
                    {paymentLoading ? 'Submitting...' : 'Submit Payment'}
                  </button>
                </div>
              </form>
            )}
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
  color: '#334155',
  marginBottom: '0.45rem',
  textAlign: 'left'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  color: '#0f172a',
  padding: '0.65rem 0.95rem',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  textAlign: 'left',
  transition: 'all 0.2s'
};

const pricingBtnStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#fff',
  padding: '0.75rem',
  borderRadius: '10px',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxSizing: 'border-box',
  marginTop: '1.5rem'
};
