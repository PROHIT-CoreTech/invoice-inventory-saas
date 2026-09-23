import React from 'react';

interface PasswordModalProps {
  password: string;
  setPassword: (val: string) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function PasswordModal({
  password,
  setPassword,
  isLoading,
  error,
  onSubmit,
  onClose
}: PasswordModalProps) {
  return (
    <div className="admin-login-overlay">
      <div className="admin-login-card">
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          display: 'inline-block'
        }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          System Administrator
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Enter your admin password to view all workspace onboarding records.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Admin Password
            </label>
            <input 
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, textAlign: 'left' }}>
              ⚠️ {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              padding: '0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
          </button>

          <button 
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#64748b',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            ← Return to Landing Page
          </button>
        </form>
      </div>
    </div>
  );
}
