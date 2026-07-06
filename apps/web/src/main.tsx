import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { setApiBaseUrl } from '@procash-invoices/api-client';

// Configure API Client base URL dynamically from environment variables
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
setApiBaseUrl(apiUrl);

// Patch window.fetch to track active requests globally and enforce 120s timeout
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const finalInit = {
      ...init,
      signal: init?.signal || controller.signal
    };

    (window as any).__activeRequests = ((window as any).__activeRequests || 0) + 1;
    window.dispatchEvent(new CustomEvent('active-requests-changed', {
      detail: (window as any).__activeRequests
    }));

    try {
      const response = await originalFetch(input, finalInit);
      return response;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out after 120 seconds.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      (window as any).__activeRequests = Math.max(0, ((window as any).__activeRequests || 0) - 1);
      window.dispatchEvent(new CustomEvent('active-requests-changed', {
        detail: (window as any).__activeRequests
      }));
    }
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
