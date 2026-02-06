/**
 * Global Error Handler
 *
 * This page handles errors that occur at the root layout level.
 * It's a fallback for errors that can't be caught by the regular error.tsx.
 *
 * Note: This component must include its own <html> and <body> tags
 * because it replaces the root layout when rendered.
 *
 * @module app/global-error
 */

'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console and potentially to error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              width: '100%',
              textAlign: 'center',
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                width: '6rem',
                height: '6rem',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Error Message */}
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 600,
                color: '#000000',
                marginBottom: '0.5rem',
              }}
            >
              Application Error
            </h1>
            <p
              style={{
                color: '#4b5563',
                marginBottom: '2rem',
              }}
            >
              A critical error has occurred. Please refresh the page or try again later.
            </p>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <button
                onClick={reset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#000000',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Go to Home
              </button>
            </div>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '0.5rem',
                  }}
                >
                  Error Details:
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#4b5563',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {error.message}
                </p>
                {error.digest && (
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontFamily: 'monospace',
                      marginTop: '0.5rem',
                    }}
                  >
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Help Text */}
            <div
              style={{
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#4b5563',
                }}
              >
                Need help?{' '}
                <a
                  href="mailto:hello@ai-agentsplus.com"
                  style={{
                    color: '#000000',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
