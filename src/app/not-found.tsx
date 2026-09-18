import Link from 'next/link';
import Image from 'next/image';
import { Crosshair } from 'lucide-react';

export default function NotFoundPage() {
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

      {/* 404 display */}
      <div
        className="text-[9rem] font-bold leading-none text-[var(--color-border)] select-none mb-0"
        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        404
      </div>

      <div className="mb-8">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 mb-5"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
            background: 'rgba(34,211,238,0.1)',
            border: '1px solid rgba(34,211,238,0.3)',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-orbitron)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <Crosshair className="w-3 h-3" /> Target Not Found
        </div>

        <h1
          className="text-3xl font-bold text-[var(--color-text)] mb-3"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          Page not found
        </h1>
        <p
          className="text-[var(--color-muted)] text-sm leading-relaxed max-w-sm mx-auto"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the URL or navigate back to safety.
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-surface)] font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Go to Landing Page
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] px-6 py-2.5 rounded-lg transition-colors text-sm"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
