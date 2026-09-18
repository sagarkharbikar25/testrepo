import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 bg-[var(--color-card)] border-r border-[var(--color-border)] h-screen hidden md:flex flex-col">
      <div className="p-4 font-bold text-xl text-[var(--color-primary)] border-b border-[var(--color-border)] h-16 flex items-center">
        NexoraLink
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/dashboard" className="block px-4 py-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">
          Dashboard
        </Link>
        <Link href="/requests" className="block px-4 py-2 rounded-lg hover:bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors">
          Requests
        </Link>
      </nav>
    </aside>
  );
}
