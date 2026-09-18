// src/lib/status-colors.ts
export const STATUS_COLORS: Record<string, string> = {
  REQUESTED:   'bg-zinc-800 text-zinc-300 border border-zinc-700',
  AI_ANALYZED: 'bg-white/10 text-white border border-white/20',
  MATCHING:    'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  ASSIGNED:    'bg-zinc-800 text-zinc-200 border border-zinc-700',
  ACCEPTED:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  IN_PROGRESS: 'bg-white/15 text-white border border-white/25',
  COMPLETED:   'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  CANCELLED:   'bg-red-500/15 text-red-400 border border-red-500/30',
}

export const URGENCY_COLORS: Record<string, string> = {
  LOW:      'bg-zinc-900 text-zinc-400 border border-zinc-800',
  MEDIUM:   'bg-zinc-800 text-zinc-200 border border-zinc-700',
  HIGH:     'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
}
