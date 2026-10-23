import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { getSubdomain } from '@procash-invoices/api-client';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AdminPortal from './components/AdminPortal';
import { LegalPage } from './components/legal/LegalPage';

function GlobalLoader() {
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    const handleActiveRequestsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveRequests(customEvent.detail || 0);
    };

    window.addEventListener('active-requests-changed', handleActiveRequestsChange);
    
    // Read initial state if available
    if ((window as any).__activeRequests) {
      setActiveRequests((window as any).__activeRequests);
    }

    return () => {
      window.removeEventListener('active-requests-changed', handleActiveRequestsChange);
    };
  }, []);

  if (activeRequests <= 0) return null;

  return (
    <>
      <style>{`
        @keyframes loading-bar-anim {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin-anim {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Top glowing progress loader */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #6366f1, #818cf8, #3b82f6, #6366f1)',
        backgroundSize: '200% 100%',
        animation: 'loading-bar-anim 1.5s infinite linear',
        zIndex: 99999,
        boxShadow: '0 1px 8px rgba(99, 102, 241, 0.4)'
      }} />

      {/* Floating corner sync notification */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid #334155',
        backdropFilter: 'blur(12px)',
        padding: '0.65rem 1.15rem',
        borderRadius: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        zIndex: 99999,
        fontFamily: "'Outfit', 'Inter', sans-serif",
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#fff'
      }}>
        {/* Spinner */}
        <div style={{
          width: '12px',
          height: '12px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderTop: '2px solid #818cf8',
          borderRadius: '50%',
          animation: 'spin-anim 0.8s infinite linear'
        }} />
        <span>Syncing database...</span>
      </div>
    </>
  );
}

export default function App() {
  const subdomain = getSubdomain();
  
  // Track pathname and hash for clean SPA URL routing
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  // Dedicated System Admin Route detection
  const isSystemAdminPath = 
    currentPath === '/admin' || 
    currentPath === '/admin/' || 
    currentPath.startsWith('/admin') ||
    currentPath === '/system-admin' ||
    currentPath === '/system-admin/' ||
    (typeof window !== 'undefined' && (window.location.hash.toLowerCase() === '#admin' || window.location.hash.toLowerCase() === '#/admin'));

  // Legal & Compliance Routes
  const isTermsRoute =
    currentPath === '/terms' ||
    currentPath === '/terms/' ||
    currentPath === '/terms-and-conditions' ||
    currentPath === '/terms-and-conditions/' ||
    (typeof window !== 'undefined' && (window.location.hash.toLowerCase() === '#terms' || window.location.hash.toLowerCase() === '#/terms'));

  const isPrivacyRoute =
    currentPath === '/privacy' ||
    currentPath === '/privacy/' ||
    currentPath === '/privacy-policy' ||
    currentPath === '/privacy-policy/' ||
    (typeof window !== 'undefined' && (window.location.hash.toLowerCase() === '#privacy' || window.location.hash.toLowerCase() === '#/privacy'));

  const isRefundRoute =
    currentPath === '/refund-policy' ||
    currentPath === '/refund-policy/' ||
    currentPath === '/refund' ||
    currentPath === '/refund/' ||
    currentPath === '/cancellation-policy' ||
    currentPath === '/cancellation-policy/' ||
    currentPath === '/refund-and-cancellation' ||
    currentPath === '/refund-and-cancellation/' ||
    (typeof window !== 'undefined' && (window.location.hash.toLowerCase() === '#refund' || window.location.hash.toLowerCase() === '#/refund'));

  const renderContent = () => {
    // 1. Dedicated System Admin Portal Page Route (/admin)
    if (isSystemAdminPath) {
      return <AdminPortal onClose={() => navigateTo('/')} />;
    }

    // 2. Legal Center Pages
    if (isTermsRoute) {
      return <LegalPage initialDoc="terms" onNavigate={navigateTo} />;
    }
    if (isPrivacyRoute) {
      return <LegalPage initialDoc="privacy" onNavigate={navigateTo} />;
    }
    if (isRefundRoute) {
      return <LegalPage initialDoc="refund" onNavigate={navigateTo} />;
    }

    // 3. Public Root Domain Landing Page
    if (!subdomain) {
      return <LandingPage onOpenAdmin={() => navigateTo('/admin')} onNavigate={navigateTo} />;
    }

    // 4. Isolated Workspace Tenant Dashboard
    return <Dashboard />;
  };

  return (
    <>
      {renderContent()}
      <GlobalLoader />
      <Analytics />
    </>
  );
}
