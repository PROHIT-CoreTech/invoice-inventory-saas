import React, { useState } from 'react';

type FrameworkOption = 'Next.js' | 'React (Vite / CRA)' | 'Remix' | 'Nuxt' | 'SvelteKit';
type PackageManager = 'npm' | 'yarn' | 'pnpm';

export default function VercelAnalyticsGuide() {
  const [framework, setFramework] = useState<FrameworkOption>('Next.js');
  const [pkgManager, setPkgManager] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState(false);

  const getInstallCommand = () => {
    switch (pkgManager) {
      case 'yarn':
        return 'yarn add @vercel/analytics';
      case 'pnpm':
        return 'pnpm add @vercel/analytics';
      case 'npm':
      default:
        return 'npm i @vercel/analytics';
    }
  };

  const getImportStatement = () => {
    switch (framework) {
      case 'React (Vite / CRA)':
        return 'import { Analytics } from "@vercel/analytics/react";';
      case 'Remix':
        return 'import { Analytics } from "@vercel/analytics/remix";';
      case 'Nuxt':
        return 'import { Analytics } from "@vercel/analytics/nuxt";';
      case 'SvelteKit':
        return 'import { injectSpeedInsights } from "@vercel/analytics/sveltekit";';
      case 'Next.js':
      default:
        return 'import { Analytics } from "@vercel/analytics/next";';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getInstallCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#111827',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
            color: '#111827'
          }}>
            Get Started
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: '#6b7280',
            margin: '0.35rem 0 0 0'
          }}>
            To start counting visitors and page views, follow these steps.
          </p>
        </div>

        {/* Framework Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value as FrameworkOption)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '0.55rem 2.25rem 0.55rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <option value="Next.js">Next.js</option>
            <option value="React (Vite / CRA)">React (Vite / CRA)</option>
            <option value="Remix">Remix</option>
            <option value="Nuxt">Nuxt</option>
            <option value="SvelteKit">SvelteKit</option>
          </select>
          <div style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#6b7280',
            fontSize: '0.75rem'
          }}>
            ▼
          </div>
        </div>
      </div>

      {/* 3 Step Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: '1.5rem',
        marginTop: '1.75rem'
      }}>
        {/* Card 1: Install our package */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#111827',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                Install our package
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Start by installing <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8125rem' }}>@vercel/analytics</code> in your existing project.
            </p>
          </div>

          <div>
            {/* Package Manager Tabs & Copy Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(['npm', 'yarn', 'pnpm'] as PackageManager[]).map((mgr) => (
                  <button
                    key={mgr}
                    type="button"
                    onClick={() => setPkgManager(mgr)}
                    style={{
                      border: 'none',
                      backgroundColor: pkgManager === mgr ? '#f3f4f6' : 'transparent',
                      color: pkgManager === mgr ? '#111827' : '#6b7280',
                      fontWeight: pkgManager === mgr ? 600 : 400,
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {mgr}
                  </button>
                ))}
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                title="Copy command"
                style={{
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.8125rem',
                  color: copied ? '#10b981' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {copied ? (
                  <>
                    <span>✓</span> Copied
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Code Box */}
            <div style={{
              backgroundColor: '#fafafa',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
              fontSize: '0.875rem',
              color: '#111827',
              whiteSpace: 'nowrap',
              overflowX: 'auto'
            }}>
              {getInstallCommand()}
            </div>
          </div>
        </div>

        {/* Card 2: Add the React component */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#111827',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                Add the React component
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Import and use the <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8125rem' }}>&lt;Analytics/&gt;</code> React component into your app's layout.
            </p>

            {/* Code Box */}
            <div style={{
              backgroundColor: '#fafafa',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
              fontSize: '0.85rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowX: 'auto',
              marginBottom: '1rem'
            }}>
              <span style={{ color: '#d97706', fontWeight: 600 }}>import</span>{' '}
              <span style={{ color: '#111827' }}>{'{ Analytics }'}</span>{' '}
              <span style={{ color: '#d97706', fontWeight: 600 }}>from</span>{' '}
              <span style={{ color: '#059669', fontWeight: 500 }}>
                "{getImportStatement().split('from "')[1]?.replace('";', '') || '@vercel/analytics/react'}"
              </span>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
              For full examples and further reference, please refer to our{' '}
              <a
                href="https://vercel.com/docs/analytics/quickstart"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
              >
                documentation ↗
              </a>
            </p>
          </div>
        </div>

        {/* Card 3: Deploy & Visit your Site */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#111827',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                Deploy & Visit your Site
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Deploy your changes and visit the deployment to collect your page views.
            </p>

            <p style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.5, margin: 0 }}>
              If you don't see data after 30 seconds, please check for content blockers and try to navigate between pages on your site.
            </p>
          </div>

          <div style={{
            marginTop: '1.25rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
            }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#065f46' }}>
              Analytics Ready in @procash-invoices/web
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
