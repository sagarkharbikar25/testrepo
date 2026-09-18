import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'urgent' | 'medium' | 'low' | 'success' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-white/[0.06] text-zinc-300 border border-white/15',
    primary: 'bg-white/15 text-white border border-white/30',
    urgent: 'bg-red-500/15 text-red-400 border border-red-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    success: 'bg-[#2EEA8D]/15 text-[#2EEA8D] border border-[#2EEA8D]/30',
    outline: 'bg-transparent text-zinc-300 border border-white/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide backdrop-blur-xs ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
