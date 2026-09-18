'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      console.error('[NexoraLink] Runtime error:', error?.message || String(error));
    } catch {
      // ignore
    }
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--color-surface)] text-center"
      style={{
        backgroundImage:
          'linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/15 bg-[#121217]">
          <Image src="/logo-new.png" alt="NexoraLink" width={40} height={40} className="w-full h-full object-cover scale-105" />
        </div>
        <span className="font-extrabold text-xl text-white font-[family-name:var(--font-plus-jakarta)]">
          Nexora<span className="text-zinc-400">Link</span>
        </span>
      </div>

      {/* Error Card */}
      <div
        className="bg-[var(--color-card)] p-8 max-w-md w-full"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
          border: '1px solid rgba(220,38,38,0.4)',
        }}
      >
        {/* Error badge */}
        <div
          className="inline-flex items-center gap-2 mb-6 px-3 py-1"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
            background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.4)',
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-orbitron)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <AlertTriangle className="w-3 h-3" /> System Error
        </div>

        <h1
          className="text-3xl font-bold text-[var(--color-text)] mb-3"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          Something went wrong
        </h1>
        <p
          className="text-[var(--color-muted)] text-sm leading-relaxed mb-2"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          An unexpected error occurred. Our system has logged this incident automatically.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p
            className="text-xs text-[var(--color-border)] mb-6"
            style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-surface)] font-bold py-2.5 rounded-lg transition-colors text-sm"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] py-2.5 rounded-lg transition-colors text-sm"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
