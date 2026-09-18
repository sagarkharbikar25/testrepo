// StatusBadge — maps request lifecycle states to visual treatment in dark monochrome aesthetic
export type RequestStatus =
  | 'REQUESTED'
  | 'ANALYZED'
  | 'MATCHING'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

const STATUS_CONFIG: Record<RequestStatus, { label: string; dot: string; style: string }> = {
  REQUESTED: {
    label: 'Requested',
    dot: 'bg-zinc-400',
    style: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60',
  },
  ANALYZED: {
    label: 'AI Analyzed',
    dot: 'bg-white animate-pulse',
    style: 'bg-white/10 text-white border-white/25',
  },
  MATCHING: {
    label: 'Matching',
    dot: 'bg-amber-400 animate-ping',
    style: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  },
  ASSIGNED: {
    label: 'Assigned',
    dot: 'bg-zinc-300',
    style: 'bg-zinc-800 text-zinc-200 border-zinc-700',
  },
  ACCEPTED: {
    label: 'Accepted',
    dot: 'bg-emerald-400',
    style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    dot: 'bg-white animate-pulse',
    style: 'bg-white/10 text-white border-white/30',
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  CANCELLED: {
    label: 'Cancelled',
    dot: 'bg-red-400',
    style: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
};

const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; style: string }> = {
  CRITICAL: {
    label: 'CRITICAL',
    style: 'bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
  },
  HIGH: {
    label: 'HIGH',
    style: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  MEDIUM: {
    label: 'MEDIUM',
    style: 'bg-zinc-800/90 text-zinc-200 border-zinc-700',
  },
  LOW: {
    label: 'LOW',
    style: 'bg-zinc-900 text-zinc-400 border-zinc-800',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.REQUESTED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border tracking-wide backdrop-blur-xs ${config.style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function UrgencyBadge({ urgency, className = '' }: UrgencyBadgeProps) {
  const config = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.MEDIUM;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono tracking-wider ${config.style} ${className}`}
    >
      {config.label}
    </span>
  );
}
