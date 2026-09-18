export function TopBar() {
  return (
    <header className="h-16 bg-[var(--color-card)] border-b border-[var(--color-border)] flex items-center justify-between px-6 shrink-0">
      <div className="md:hidden font-bold text-[var(--color-primary)]">
        NexoraLink
      </div>
      <div className="hidden md:block">
        <h1 className="font-semibold text-lg text-[var(--color-foreground)]">Overview</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center font-bold text-sm">
          U
        </div>
      </div>
    </header>
  );
}
