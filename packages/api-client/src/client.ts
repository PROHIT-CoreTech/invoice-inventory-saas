import axios from 'axios';

export const getSubdomain = () => {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Local development fallback (e.g., tenant1.localhost:3000)
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    if (parts.length > 1) {
      return parts[0];
    }
    return null;
  }

  // Special handling for Vercel default domains (*.vercel.app)
  if (hostname.endsWith('.vercel.app')) {
    if (parts.length > 3) {
      return parts[0];
    }
    return null;
  }

  // For <tenant_name>.billing.prohitcoretech.com
  const billingIndex = parts.indexOf('billing');
  if (billingIndex > 0) {
    return parts[billingIndex - 1];
  }

  // Fallback for standard <tenant_name>.domain.com structures
  if (parts.length > 2) {
    // Exclude subdomains like 'www' or 'billing' directly if they aren't tenants
    const sub = parts[0];
    if (sub !== 'www' && sub !== 'billing') {
      return sub;
    }
  }

  return null;
};

export const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api', // default base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to update the base URL dynamically at runtime
export const setApiBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = url;
};

// Request interceptor to inject X-Tenant-Id header
apiClient.interceptors.request.use(
  (config) => {
    const tenant = getSubdomain();
    if (tenant) {
      config.headers['X-Tenant-Id'] = tenant;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

