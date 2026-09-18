'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // NGO and Admin are consolidated into the unified NGO/Admin module at /ngo/dashboard
    router.replace('/ngo/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-center">
      <div className="text-sm text-[var(--color-text-secondary)]">
        Redirecting to unified NGO / Admin Operations Center...
      </div>
    </div>
  );
}
