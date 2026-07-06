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

  // For <tenant_name>.billing.prohitcoretech.com or <tenant_name>.biling.prohitcoretech.com
  const billingIndex = parts.findIndex(p => p === 'billing' || p === 'biling');
  if (billingIndex > 0) {
    return parts[billingIndex - 1];
  }

  // Fallback for standard <tenant_name>.domain.com structures
  if (parts.length > 2) {
    // Exclude subdomains like 'www', 'billing', or 'biling' directly if they aren't tenants
    const sub = parts[0];
    if (sub !== 'www' && sub !== 'billing' && sub !== 'biling') {
      return sub;
    }
  }

  return null;
};

export const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api', // default base URL
  timeout: 120000, // 120 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to update the base URL dynamically at runtime
export const setApiBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = url;
};

const updateActiveRequests = (delta: number) => {
  if (typeof window !== 'undefined') {
    (window as any).__activeRequests = Math.max(0, ((window as any).__activeRequests || 0) + delta);
    window.dispatchEvent(new CustomEvent('active-requests-changed', {
      detail: (window as any).__activeRequests
    }));
  }
};

// Request interceptor to inject X-Tenant-Id header and track active requests
apiClient.interceptors.request.use(
  (config) => {
    updateActiveRequests(1);
    const tenant = getSubdomain();
    if (tenant) {
      config.headers['X-Tenant-Id'] = tenant;
    }
    return config;
  },
  (error) => {
    updateActiveRequests(-1);
    return Promise.reject(error);
  }
);

// Response interceptor to track request completion/error
apiClient.interceptors.response.use(
  (response) => {
    updateActiveRequests(-1);
    return response;
  },
  (error) => {
    updateActiveRequests(-1);
    return Promise.reject(error);
  }
);

