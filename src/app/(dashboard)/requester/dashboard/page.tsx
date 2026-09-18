'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StatusBadge, UrgencyBadge, RequestStatus, UrgencyLevel } from '@/components/ui/StatusBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import {
  Clock,
  CheckCircle2,
  Plus,
  Sparkles,
  MapPin,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Filter,
  Phone,
} from 'lucide-react';

interface HelpRequest {
  id: string;
  category: string;
  description: string;
  location: string;
  status: RequestStatus;
  urgency: UrgencyLevel;
  createdAt: string;
  volunteer?: {
    name: string;
    phone: string;
    distance: string;
  } | null;
  aiNotes?: string;
}

const INITIAL_REQUESTS: HelpRequest[] = [
  {
    id: 'REQ-4091',
    category: 'Medical / Transport',
    description: 'Elderly patient needs urgent transportation to City Hospital for scheduled dialysis at 3:00 PM.',
    location: 'Sector 4, West Colony (1.2 km away)',
    status: 'IN_PROGRESS',
    urgency: 'CRITICAL',
    createdAt: '45 mins ago',
    volunteer: {
      name: 'Dr. Rahul Sharma',
      phone: '+91 98230 44120',
      distance: '0.8 km away',
    },
    aiNotes: 'Classified Critical based on medical dialysis window. Matched with verified medical driver.',
  },
  {
    id: 'REQ-4088',
    category: 'Food & Ration Pack',
    description: 'Family of 5 stranded due to waterlogging. Need clean drinking water and 3 days of dry ration packs.',
    location: 'Riverbed Lane, Block B',
    status: 'MATCHING',
    urgency: 'HIGH',
    createdAt: '2 hrs ago',
    volunteer: null,
    aiNotes: 'Gemini identified flood zone proximity. Auto-notified 4 nearby relief volunteers.',
  },
  {
    id: 'REQ-4075',
    category: 'Shelter / Blankets',
    description: '2 adult blankets and waterproof tarp needed for temporary shelter.',
    location: 'Community Hall Relief Shelter',
    status: 'COMPLETED',
    urgency: 'MEDIUM',
    createdAt: 'Yesterday',
    volunteer: {
      name: 'Priya Kulkarni',
      phone: '+91 94022 18923',
      distance: 'Completed',
    },
    aiNotes: 'Supplies sourced from Red Cross Central Depot.',
  },
];

export default function RequesterDashboard() {
  const [requests] = useState<HelpRequest[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REQUESTS;
    try {
      const stored = localStorage.getItem('nexora_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_REQUESTS];
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_REQUESTS;
  });
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('REQ-4091');

  const filteredRequests = requests.filter((r) => {
    if (filter === 'ACTIVE') return r.status !== 'COMPLETED' && r.status !== 'CANCELLED';
    if (filter === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  const activeCount = requests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  const inProgressCount = requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2EEA8D] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              My Help Requests
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Monitor real-time AI triage, volunteer assignments, and dispatch progress
          </p>
        </div>
        <Link href="/requester/request/new">
          <Button variant="primary" size="md" className="shadow-[0_0_20px_rgba(255,255,255,0.2)] w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            <Sparkles className="w-4 h-4 text-zinc-600" />
            Create AI Aid Request
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Active In-Flight
            </div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {activeCount}
            </div>
            <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Live matching in progress
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 text-white flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Assigned to Volunteers
            </div>
            <div className="text-2xl font-bold text-[#2EEA8D] font-mono mt-1">
              {inProgressCount}
            </div>
            <div className="text-[11px] text-[#2EEA8D]/80 font-medium mt-0.5">
              En-route or delivering
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 text-[#2EEA8D] flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Successfully Resolved
            </div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {completedCount}
            </div>
            <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Verified deliveries
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 text-zinc-300 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
            Filter:
          </span>
          <div className="flex items-center gap-1.5 bg-[#0D0D12] p-1 rounded-full border border-white/10">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === 'ALL'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === 'ACTIVE'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === 'COMPLETED'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((req) => {
          const isExpanded = expandedId === req.id;
          return (
            <div
              key={req.id}
              className="bg-[#0D0D12] rounded-2xl border border-white/10 shadow-lg transition-all overflow-hidden"
            >
              {/* Card Summary Header */}
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/15">
                      {req.id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.05] text-zinc-300 border border-white/15">
                      {req.category}
                    </span>
                    <UrgencyBadge urgency={req.urgency} />
                    <StatusBadge status={req.status} />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    {req.createdAt}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed mb-4">
                  {req.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                    <span>{req.location}</span>
                  </div>

                  {req.volunteer ? (
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#2EEA8D] bg-[#2EEA8D]/10 border border-[#2EEA8D]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        {req.volunteer.name} ({req.volunteer.distance})
                      </span>
                      <a
                        href={`tel:${req.volunteer.phone}`}
                        className="inline-flex items-center gap-1 text-white hover:underline font-semibold"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium">
                      <Clock className="w-3 h-3 animate-spin" />
                      AI Matcher Searching Volunteers...
                    </div>
                  )}
                </div>
              </div>

              {/* Expandable Lifecycle Timeline */}
              <div className="bg-black/40 px-5 sm:px-6 py-3 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white hover:underline"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Hide Status Timeline
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      View Full Dispatch Timeline
                    </>
                  )}
                </button>

                {req.aiNotes && (
                  <span className="text-[11px] text-zinc-400 hidden md:inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-white" />
                    {req.aiNotes}
                  </span>
                )}
              </div>

              {isExpanded && (
                <div className="p-6 bg-[#08080B] border-t border-white/10">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 font-mono">
                    Live Dispatch Progress
                  </div>
                  <StatusTimeline currentStatus={req.status} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
