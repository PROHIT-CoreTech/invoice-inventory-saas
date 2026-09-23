import React, { useState, useEffect } from 'react';
import { LandingHeader } from './landing/LandingHeader';
import { LandingHero } from './landing/LandingHero';
import { ParallaxDashboardPreview } from './landing/ParallaxDashboardPreview';
import { LandingFeatures } from './landing/LandingFeatures';
import { LandingPricing } from './landing/LandingPricing';
import { LandingFooter } from './landing/LandingFooter';
import { LandingCheckoutModal } from './landing/LandingCheckoutModal';
import { LandingOnboardingModal } from './landing/LandingOnboardingModal';

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

    let planCode = 'MON';
    if (selectedPlan.id === '6_MONTHS') planCode = 'PRO';
    else if (selectedPlan.id === '1_YEAR') planCode = 'ENT';
    else if (selectedPlan.id === 'LIFETIME') planCode = 'LIF';

    const tn = `SUB-${planCode}-${formattedTenant}`.substring(0, 35);
    const amountVal = typeof selectedPlan.price === 'number' ? selectedPlan.price : (parseFloat(String(selectedPlan.price || 0)) || 0);

    return `upi://pay?pa=rohitbarge22-3@okaxis&pn=ROHIT%20BARGE&am=${amountVal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(tn)}`;
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

  return (
    <div
      className="landing-container"
      style={{
        minHeight: '100vh',
        backgroundColor: '#070a13',
        color: '#f8fafc',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Decorative Background Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '45vw',
          height: '45vw',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'drift 25s infinite ease-in-out',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '-15%',
          width: '40vw',
          height: '40vw',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'drift 30s infinite ease-in-out alternate',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '40%',
          width: '30vw',
          height: '30vw',
          background: 'radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, transparent 60%)',
          filter: 'blur(70px)',
          animation: 'drift 20s infinite ease-in-out 3s',
          zIndex: 0
        }}
      />

      <LandingHeader />

      <section className="hero-grid hero-section">
        <LandingHero
          tenantName={tenantName}
          setTenantName={setTenantName}
          error={error}
          getSuffix={getSuffix}
          onLaunch={handleLaunch}
        />
        <ParallaxDashboardPreview />
      </section>

      <LandingFeatures />

      <LandingPricing
        dynamicPlans={dynamicPlans}
        onOpenCheckout={handleOpenCheckout}
      />

      <LandingFooter onOpenAdmin={onOpenAdmin} />

      <LandingCheckoutModal
        showCheckoutModal={showCheckoutModal}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        checkoutStep={checkoutStep}
        setCheckoutStep={setCheckoutStep}
        checkoutForm={checkoutForm}
        setCheckoutForm={setCheckoutForm}
        paymentLoading={paymentLoading}
        paymentStatusMessage={paymentStatusMessage}
        setPaymentStatusMessage={setPaymentStatusMessage}
        utrNumber={utrNumber}
        setUtrNumber={setUtrNumber}
        dynamicPlans={dynamicPlans}
        getSuffix={getSuffix}
        getUpiUrl={getUpiUrl}
        getUpiNote={getUpiNote}
        onClose={() => setShowCheckoutModal(false)}
        onStep1Next={handleStep1Next}
        onStep2Next={handleStep2Next}
        onUtrSubmit={handleUtrSubmit}
      />

      <LandingOnboardingModal
        showOnboarding={showOnboarding}
        onboardingTenant={onboardingTenant}
        formData={formData}
        setFormData={setFormData}
        getSuffix={getSuffix}
        onClose={() => setShowOnboarding(false)}
        onSubmit={handleOnboardingSubmit}
        onLogoUpload={handleLogoUpload}
        onSignatureUpload={handleSignatureUpload}
      />
    </div>
  );
}
