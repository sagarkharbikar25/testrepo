'use client';

import { CheckCircle2, Clock, Sparkles, UserCheck, Play, Flag, XCircle } from 'lucide-react';
import type { RequestStatus } from './StatusBadge';

interface StatusTimelineProps {
  currentStatus: RequestStatus;
  className?: string;
}

interface StepConfig {
  key: RequestStatus;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  { key: 'REQUESTED', label: 'Submitted', sublabel: 'Request logged', icon: Clock },
  { key: 'ANALYZED', label: 'AI Analyzed', sublabel: 'Urgency scored', icon: Sparkles },
  { key: 'MATCHING', label: 'Matching', sublabel: 'Finding help', icon: Play },
  { key: 'ASSIGNED', label: 'Assigned', sublabel: 'Volunteer ready', icon: UserCheck },
  { key: 'IN_PROGRESS', label: 'In Progress', sublabel: 'Underway', icon: Play },
  { key: 'COMPLETED', label: 'Completed', sublabel: 'Verified', icon: Flag },
];

const STATUS_ORDER: RequestStatus[] = [
  'REQUESTED',
  'ANALYZED',
  'MATCHING',
  'ASSIGNED',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
];

export function StatusTimeline({ currentStatus, className = '' }: StatusTimelineProps) {
  const isCancelled = currentStatus === 'CANCELLED';
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div className={`p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 ${className}`}>
        <XCircle className="w-5 h-5 shrink-0" />
        <div>
          <div className="font-semibold text-sm">Request Cancelled</div>
          <div className="text-xs text-red-400/80">This request was cancelled before completion.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-0.5 bg-white/10 z-0" />

        {/* Active progress line */}
        <div
          className="absolute left-4 top-4 -translate-y-1/2 h-0.5 bg-white transition-all duration-500 z-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            width: `${Math.min(100, Math.max(0, (currentIndex / (STATUS_ORDER.length - 1)) * 100))}%`,
          }}
        />

        {STEPS.map((step) => {
          const stepOrderIndex = STATUS_ORDER.indexOf(step.key);
          const isDone = currentIndex > stepOrderIndex;
          const isCurrent = currentStatus === step.key || (step.key === 'ASSIGNED' && currentStatus === 'ACCEPTED');
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-[#2EEA8D] text-black shadow-[0_0_12px_rgba(46,234,141,0.4)]'
                    : isCurrent
                    ? 'bg-white text-black ring-4 ring-white/20 shadow-[0_0_16px_rgba(255,255,255,0.6)] scale-110'
                    : 'bg-[#0D0D12] border border-white/15 text-zinc-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-black" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="mt-2 hidden sm:block">
                <div
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-white'
                      : isDone
                      ? 'text-zinc-200'
                      : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 max-w-[80px]">
                  {step.sublabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
