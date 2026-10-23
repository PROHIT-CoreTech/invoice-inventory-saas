import React, { useState, useEffect } from 'react';
import { LandingFooter } from '../landing/LandingFooter';

export type LegalDocType = 'terms' | 'privacy' | 'refund';

interface LegalPageProps {
  initialDoc?: LegalDocType;
  onNavigate: (path: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  initialDoc = 'terms',
  onNavigate
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  useEffect(() => {
    setActiveDoc(initialDoc);
  }, [initialDoc]);

  const switchDoc = (doc: LegalDocType) => {
    setActiveDoc(doc);
    let path = '/terms';
    if (doc === 'privacy') path = '/privacy';
    if (doc === 'refund') path = '/refund-policy';
    onNavigate(path);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        position: 'relative'
      }}
    >
      {/* Top Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1.25rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div
            onClick={() => onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>P</span>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
              PROCash <span style={{ color: '#4f46e5' }}>Invoices</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }}
          >
            ← Return to Home
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem 5rem 1.5rem' }}>
        {/* Page Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              color: '#4f46e5',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '999px',
              padding: '0.35rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Compliance &amp; Legal Center
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              margin: '0 0 0.5rem 0'
            }}
          >
            {activeDoc === 'terms' && 'Terms & Conditions'}
            {activeDoc === 'privacy' && 'Privacy Policy'}
            {activeDoc === 'refund' && 'Refund & Cancellation Policy'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Last Revised: October 2026 • Effective Date: October 23, 2026
          </p>
        </div>

        {/* Tab Navigation Switcher */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2.5rem'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '999px',
              padding: '4px',
              gap: '4px',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => switchDoc('terms')}
              style={{
                backgroundColor: activeDoc === 'terms' ? '#4f46e5' : 'transparent',
                color: activeDoc === 'terms' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              📜 Terms &amp; Conditions
            </button>
            <button
              type="button"
              onClick={() => switchDoc('privacy')}
              style={{
                backgroundColor: activeDoc === 'privacy' ? '#4f46e5' : 'transparent',
                color: activeDoc === 'privacy' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              🔒 Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => switchDoc('refund')}
              style={{
                backgroundColor: activeDoc === 'refund' ? '#4f46e5' : 'transparent',
                color: activeDoc === 'refund' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              💳 Refund &amp; Cancellation
            </button>
          </div>
        </div>

        {/* Legal Document Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: 'clamp(1.75rem, 5vw, 3.5rem)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.06)',
            lineHeight: 1.75,
            color: '#334155',
            fontSize: '0.975rem',
            textAlign: 'left'
          }}
        >
          {/* ========================================================== */}
          {/* 1. TERMS & CONDITIONS */}
          {/* ========================================================== */}
          {activeDoc === 'terms' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>
                1. Acceptance of Terms &amp; Scope of Services
              </h2>
              <p>
                Welcome to <strong>PROCash Invoices</strong> (accessible at billing.prohitcoretech.com and subdomains), an enterprise software-as-a-service billing, quotation, and client ledger platform operated by <strong>PROHIT CORETECH</strong> (referred to as "Company", "we", "us", or "our").
              </p>
              <p>
                By creating a workspace, registering an account, or subscribing to any of our plans, you ("Customer", "Merchant", or "User") agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must discontinue using our services immediately.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                2. Subdomain Architecture &amp; Account Responsibility
              </h2>
              <p>
                PROCash Invoices operates on a secure multi-tenant architecture where each subscriber is provisioned with a dedicated subdomain (e.g., <code>yourcompany.billing.prohitcoretech.com</code>). 
              </p>
              <ul>
                <li>You are solely responsible for safeguarding the credentials, administrator passwords, and access tokens for your workspace.</li>
                <li>You agree to notify us immediately at <code>info@prohitcoretech.com</code> upon discovering any unauthorized access to your account.</li>
                <li>The Company shall not be held liable for any data loss, inadvertent invoice issuance, or financial damage resulting from compromised credentials on the user’s end.</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                3. Customer Data Ownership &amp; Integrity
              </h2>
              <p>
                You retain complete, exclusive intellectual property rights and legal ownership over all business data entered into your workspace, including client databases, quotation items, final tax invoices, bank credentials, and digital signatures.
              </p>
              <p>
                We do not sell, inspect, or commercially monetize your customer records. Our processing is strictly limited to rendering invoice PDFs, calculating taxes (CGST, SGST, IGST), and maintaining database backups.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                4. Acceptable Use Policy
              </h2>
              <p>
                You agree not to use PROCash Invoices to:
              </p>
              <ul>
                <li>Generate deceptive, unlawful, fraudulent, or fake tax invoices for money laundering or tax evasion.</li>
                <li>Interfere with, overload, or attack the underlying MongoDB/PostgreSQL clusters or API servers.</li>
                <li>Reverse-engineer, decompile, or copy the proprietary source code, document layout designs, or algorithms.</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                5. Subscription Fees &amp; Taxes
              </h2>
              <p>
                Access to premium features, high-volume invoice generation, and mobile companion features requires an active subscription (Monthly, Bi-Annual, Annual, or Lifetime Deal).
              </p>
              <p>
                All fees are billed in Indian Rupees (INR) or localized foreign currencies. Taxes are calculated in accordance with applicable statutory regulations (e.g., Indian GST or Zero-Rated Export with LUT for foreign entities).
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                6. Service Uptime &amp; SLA
              </h2>
              <p>
                We take reasonable commercial efforts to maintain a 99.9% uptime for cloud services. Periodic scheduled maintenance will be communicated in advance. We shall not be liable for service disruptions caused by force majeure events, telecom gateway failures, or third-party cloud infrastructure downtime.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                7. Governing Law &amp; Dispute Resolution
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Mumbai, Maharashtra, India</strong>.
              </p>

              <div
                style={{
                  marginTop: '2.5rem',
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }}
              >
                <strong>Contact for Legal Queries:</strong><br />
                PROHIT CORETECH<br />
                Mumbai, Maharashtra, India<br />
                Email: <a href="mailto:info@prohitcoretech.com" style={{ color: '#4f46e5' }}>info@prohitcoretech.com</a> | Phone: +91 757 839 7539
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. PRIVACY POLICY */}
          {/* ========================================================== */}
          {activeDoc === 'privacy' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>
                1. Commitment to User Privacy
              </h2>
              <p>
                At <strong>PROCash Invoices</strong> (operated by <strong>PROHIT CORETECH</strong>), we understand that your invoicing data contains sensitive commercial records. This Privacy Policy details the types of information we collect, how it is secured, and your legal rights under applicable privacy laws, including the Information Technology Act, 2000 (India) and general international data protection principles.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                2. Information We Collect
              </h2>
              <p>When you register, onboard your company, or issue documents, we collect:</p>
              <ul>
                <li><strong>Merchant Identity Details:</strong> Company name, proprietor name, business address, email, phone number, GSTIN, and PAN.</li>
                <li><strong>Bank &amp; Settlement Details:</strong> Bank account holder name, account type, account number, IFSC code, and branch name (used solely to print payment remittance info on your invoices).</li>
                <li><strong>Branding Assets:</strong> Company logos and authorized digital signatures uploaded for invoice rendering.</li>
                <li><strong>Customer/Client Records:</strong> Client contact details, billing addresses, tax IDs, and ledger payment records.</li>
                <li><strong>Technical Logs:</strong> IP address, device metadata, browser information, and access timestamps for audit and security monitoring.</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                3. Purpose of Processing
              </h2>
              <p>We process collected information strictly to:</p>
              <ul>
                <li>Authenticate your identity and provide isolated subdomain workspace routing.</li>
                <li>Render PDF invoices, calculate CGST/SGST/IGST tax splits, and maintain historical payment records.</li>
                <li>Verify subscription payments (via Cashfree, UPI, or manual UTR reconciliation).</li>
                <li>Send transactional receipts, software updates, and support responses.</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                4. Data Protection &amp; Security Standards
              </h2>
              <p>
                We employ enterprise-grade security protocols:
              </p>
              <ul>
                <li>All network communications are encrypted in transit using Transport Layer Security (TLS 1.3 / HTTPS).</li>
                <li>Database records are stored in secure cloud clusters with encryption at rest and strict tenant isolation middleware.</li>
                <li>We do not store complete debit/credit card numbers; all payment transactions are routed through PCI-DSS compliant gateways.</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                5. Third-Party Disclosures
              </h2>
              <p>
                We do not sell, rent, or trade your data to advertisers or third parties. We only share information with trusted service providers necessary to operate the application:
              </p>
              <ul>
                <li><strong>Payment Processors:</strong> Cashfree Payments, Razorpay, or UPI routing partners.</li>
                <li><strong>Infrastructure Providers:</strong> Vercel for web hosting and MongoDB Atlas / PostgreSQL for cloud databases.</li>
                <li><strong>Legal Authorities:</strong> Only when strictly mandated by enforceable court orders or Indian law enforcement.</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                6. Data Retention &amp; User Rights
              </h2>
              <p>
                You may export your complete invoice database to Excel or CSV at any time through the workspace dashboard. Upon closing your account, your data will be permanently wiped from active servers within 30 days, subject to mandatory statutory tax audit retention requirements under Indian GST law.
              </p>

              <div
                style={{
                  marginTop: '2.5rem',
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }}
              >
                <strong>Grievance &amp; Privacy Officer:</strong><br />
                PROHIT CORETECH<br />
                Attention: Privacy Compliance<br />
                Email: <a href="mailto:info@prohitcoretech.com" style={{ color: '#4f46e5' }}>info@prohitcoretech.com</a>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 3. REFUND & CANCELLATION POLICY */}
          {/* ========================================================== */}
          {activeDoc === 'refund' && (
            <div>
              {/* Highlight Banner */}
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <h4 style={{ margin: '0 0 0.35rem 0', color: '#92400e', fontSize: '1rem', fontWeight: 800 }}>
                    STRICT NON-REFUNDABLE POLICY NOTICE
                  </h4>
                  <p style={{ margin: 0, color: '#b45309', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    Please read this policy carefully prior to subscribing. All subscription payments, software activations, renewals, and lifetime deals on PROCash Invoices are strictly <strong>NON-REFUNDABLE</strong> under all circumstances once purchased.
                  </p>
                </div>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>
                1. 10-Day Free Trial (Try Before You Buy)
              </h2>
              <p>
                To ensure complete satisfaction with our platform, PROCash Invoices offers an unrestricted <strong>10-Day Full-Feature Free Trial</strong> with:
              </p>
              <ul>
                <li><strong>Zero Financial Commitment:</strong> No credit card, debit card, or advance payment required.</li>
                <li><strong>Complete Feature Access:</strong> Test quotation conversion, GST splitting, PDF printing, WhatsApp sharing, and mobile companion app synchronization.</li>
              </ul>
              <p>
                We strongly advise all customers to make full use of the 10-Day Free Trial to ensure the software satisfies their business and accounting workflows before purchasing a paid plan.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                2. Non-Refundable Nature of Subscriptions
              </h2>
              <p>
                Because our service delivers immediate digital access to software infrastructure, automated database isolation, and instant document generation capabilities:
              </p>
              <ul>
                <li><strong>No Refunds on Activation:</strong> Once a payment is completed and a subscription plan (Monthly Starter, Bi-Annual Pro, Annual Enterprise, or Lifetime Unlimited) is activated, all fees paid are <strong>100% non-refundable</strong>.</li>
                <li><strong>No Partial or Prorated Refunds:</strong> We do not offer refunds, credits, or fee adjustments for partial billing periods, unused days, account downgrades, or early abandonment of your workspace.</li>
                <li><strong>No Refunds for Lack of Use:</strong> Subscriptions will not be refunded simply because the account was not actively used during the billing cycle.</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                3. Subscription Cancellation Policy
              </h2>
              <p>
                You have the full right to cancel your subscription renewal at any time:
              </p>
              <ul>
                <li><strong>How to Cancel:</strong> You may cancel by reaching out to support at <code>info@prohitcoretech.com</code> or through your workspace settings before your next billing date.</li>
                <li><strong>Access Until Period End:</strong> Upon cancellation, your workspace remains fully operational with all premium features until the final date of your current pre-paid cycle.</li>
                <li><strong>No Subsequent Charges:</strong> Once canceled, your card or payment mandate will not be charged for subsequent renewal cycles.</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                4. Lifetime Deal Special Terms
              </h2>
              <p>
                The <strong>Lifetime Unlimited Plan</strong> is offered as a single one-time payment conferring permanent digital usage rights without recurring renewal charges. As this provides irreversible lifetime access to software assets, Lifetime purchases are strictly non-refundable once workspace provisioning is completed.
              </p>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                5. Duplicate Charges &amp; Technical Glitches
              </h2>
              <p>
                In the rare event of an inadvertent technical payment error:
              </p>
              <ul>
                <li>If your bank account was debited multiple times due to a payment gateway timeout for the exact same order, please notify us within <strong>48 hours</strong> at <code>info@prohitcoretech.com</code> with your UTR or payment reference number.</li>
                <li>Verified duplicate debits will be refunded back to the original source of payment within <strong>5 to 7 working days</strong>.</li>
              </ul>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2.5rem', marginBottom: '1rem' }}>
                6. Unjustified Chargebacks &amp; Dispute Policy
              </h2>
              <p>
                Initiating a chargeback or payment dispute with your bank or credit card provider without contacting our customer support violates these terms. In the event of an unjustified chargeback, we reserve the right to immediately suspend your tenant workspace, lock PDF exports, and restrict access across our cloud platform.
              </p>

              <div
                style={{
                  marginTop: '2.5rem',
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }}
              >
                <strong>Billing Support &amp; Assistance:</strong><br />
                PROHIT CORETECH<br />
                Email: <a href="mailto:info@prohitcoretech.com" style={{ color: '#4f46e5' }}>info@prohitcoretech.com</a> | Helpline: +91 757 839 7539<br />
                Support Hours: Monday to Saturday, 10:00 – 19:00 IST
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer with Compliance & Legal Links */}
      <LandingFooter onOpenAdmin={() => onNavigate('/admin')} onNavigate={onNavigate} />
    </div>
  );
};
