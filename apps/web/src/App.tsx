import React, { useState } from 'react';
import { getSubdomain } from '@procash-invoices/api-client';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const subdomain = getSubdomain();
  const [isAdminMode, setIsAdminMode] = useState(false);

  if (isAdminMode) {
    return <AdminPortal onClose={() => setIsAdminMode(false)} />;
  }

  if (!subdomain) {
    return <LandingPage onOpenAdmin={() => setIsAdminMode(true)} />;
  }

  return <Dashboard />;
}
