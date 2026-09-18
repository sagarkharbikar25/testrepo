import { FolderOpen, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border-2 border-dashed border-white/10 bg-[#0A0A0E]/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white mb-4 shadow-inner">
        <Icon className="w-7 h-7 text-zinc-300" />
      </div>
      <h3 className="text-base font-semibold text-white font-[family-name:var(--font-plus-jakarta)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
