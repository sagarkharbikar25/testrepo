'use client';

import { useEffect } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

// global-error.tsx catches errors in the root layout itself.
// It MUST include its own <html> and <body> tags since the root layout may be broken.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[NexoraLink] Critical global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#08090D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#F8FAFC',
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#12141C',
            border: '1px solid rgba(220,38,38,0.4)',
            clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
            padding: '2.5rem',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <AlertOctagon style={{ width: 40, height: 40, color: '#DC2626', margin: '0 auto 1.5rem' }} />

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Critical Error
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            NexoraLink encountered a critical failure and couldn&apos;t recover. This has been logged automatically.
          </p>
          {error.digest && (
            <p style={{ color: '#262A38', fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
              {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#22D3EE',
              color: '#08090D',
              fontWeight: 700,
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <RotateCcw style={{ width: 16, height: 16 }} />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
