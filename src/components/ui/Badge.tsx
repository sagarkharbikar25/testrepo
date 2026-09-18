export function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'urgent' | 'medium' | 'low', className?: string }) {
  const variants = {
    default: "bg-[var(--color-card)] text-[var(--color-foreground)] border border-[var(--color-border)]",
    urgent: "bg-red-500/20 text-red-400 border border-red-500/30",
    medium: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
