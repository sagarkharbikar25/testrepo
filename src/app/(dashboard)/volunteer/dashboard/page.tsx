'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { UrgencyBadge, UrgencyLevel } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Activity,
  ArrowRight,
  Sparkles,
  Phone,
  Navigation,
} from 'lucide-react';

interface NearbyOpportunity {
  id: string;
  category: string;
  description: string;
  urgency: UrgencyLevel;
  distance: string;
  postedAt: string;
  matchScore: number;
  matchReason: string;
  location: string;
  requesterName: string;
}

const INITIAL_NEARBY: NearbyOpportunity[] = [
  {
    id: 'OPP-502',
    category: 'Medical Transport',
    description: 'Elderly neighbor needs transport to oncology follow-up clinic. Needs vehicle with clean interior.',
    urgency: 'CRITICAL',
    distance: '0.8 km',
    postedAt: '12m ago',
    matchScore: 96,
    matchReason: 'Within 1 km + Matches your "First Aid" & "Vehicle Access" tags',
    location: 'Sector 3, Block D',
    requesterName: 'Kavita Patel',
  },
  {
    id: 'OPP-488',
    category: 'Food Relief Logistics',
    description: 'Help deliver 4 prepared meal boxes from central kitchen to flood-affected tenements.',
    urgency: 'HIGH',
    distance: '1.4 km',
    postedAt: '25m ago',
    matchScore: 89,
    matchReason: 'High priority + Direct route along your commute corridor',
    location: 'Bridgeview Crossing',
    requesterName: 'Ward Relief Squad',
  },
  {
    id: 'OPP-471',
    category: 'Essential Supplies',
    description: 'Pickup prescribed heart medication from Apollo Pharmacy and hand over to resident.',
    urgency: 'HIGH',
    distance: '2.1 km',
    postedAt: '45m ago',
    matchScore: 82,
    matchReason: 'Medical delivery match + Verified volunteer ID required',
    location: 'City Center Plaza',
    requesterName: 'Ramesh Sen',
  },
];

export default function VolunteerDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [nearby, setNearby] = useState<NearbyOpportunity[]>(INITIAL_NEARBY);
  const [activeTask, setActiveTask] = useState<{
    id: string;
    title: string;
    requester: string;
    phone: string;
    address: string;
    distance: string;
  } | null>({
    id: 'OPP-499',
    title: 'Deliver emergency baby formula and clean water pack',
    requester: 'Ananya Sharma',
    phone: '+91 98330 19283',
    address: 'Apt 402, Lotus Towers, 0.6 km away',
    distance: '0.6 km',
  });

  const handleAccept = (opp: NearbyOpportunity) => {
    setActiveTask({
      id: opp.id,
      title: opp.description,
      requester: opp.requesterName,
      phone: '+91 98000 11223',
      address: opp.location,
      distance: opp.distance,
    });
    setNearby((prev) => prev.filter((item) => item.id !== opp.id));
  };

  const handleCompleteActive = () => {
    setActiveTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2EEA8D] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Volunteer Dispatch Center
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            High-match aid requests within your verified response zone
          </p>
        </div>

        {/* Availability Switch */}
        <div className="flex items-center gap-3 bg-white/[0.04] p-2 rounded-full border border-white/10 self-start sm:self-auto">
          <span className="text-xs font-semibold text-zinc-300 pl-2">
            {isAvailable ? 'Ready to Dispatch' : 'On Standby'}
          </span>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              isAvailable ? 'bg-[#2EEA8D]' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                isAvailable ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Active Assignment Banner */}
      {activeTask && (
        <div className="bg-[#0F1612] border border-[#2EEA8D]/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2EEA8D] bg-[#2EEA8D]/15 px-3 py-0.5 rounded-full flex items-center gap-1.5 border border-[#2EEA8D]/30 font-mono">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Active Mission Underway
              </span>
              <span className="text-xs font-mono font-bold text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-white/15">
                {activeTask.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/volunteer/map"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 border border-blue-400/30 rounded-full transition-colors shadow-[0_0_12px_rgba(59,130,246,0.3)]"
              >
                <Navigation className="w-3.5 h-3.5" />
                Live Route Map
              </Link>
              <a
                href={`tel:${activeTask.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white/[0.06] text-white hover:bg-white/15 border border-white/20 rounded-full transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-300" />
                Call Requester
              </a>
              <button
                type="button"
                onClick={handleCompleteActive}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-white text-black hover:bg-zinc-200 rounded-full transition-colors shadow-[0_0_12px_rgba(255,255,255,0.25)]"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Completed
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              {activeTask.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-[#2EEA8D]" />
                {activeTask.address}
              </span>
              <span>•</span>
              <span>Contact: {activeTask.requester}</span>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Missions Completed
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            24
          </div>
          <div className="text-[11px] text-[#2EEA8D] font-medium mt-0.5">
            +3 this week
          </div>
        </div>

        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            People Aided
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            36
          </div>
          <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
            Direct community impact
          </div>
        </div>

        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Reliability Rating
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1 flex items-center gap-1">
            4.9 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
            Based on 21 verified reviews
          </div>
        </div>

        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Response Radius
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            5.0 km
          </div>
          <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
            West Metropolitan Sector
          </div>
        </div>
      </div>

      {/* Nearby AI-Matched Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Nearby Opportunities (AI Matched)
            </h2>
            <p className="text-xs text-zinc-400">
              Ranked by distance, urgency, and compatibility with your verified skills
            </p>
          </div>
          <span className="text-xs font-semibold text-zinc-300 bg-white/[0.05] px-3 py-1 rounded-full border border-white/10 font-mono">
            {nearby.length} Opportunities Available
          </span>
        </div>

        <div className="space-y-4">
          {nearby.map((opp) => (
            <div
              key={opp.id}
              className="bg-[#0D0D12] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-md hover:border-white/25 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold bg-white/10 text-white px-2 py-0.5 rounded border border-white/15">
                    {opp.id}
                  </span>
                  <span className="text-xs font-semibold text-zinc-300 bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/15">
                    {opp.category}
                  </span>
                  <UrgencyBadge urgency={opp.urgency} />
                  <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {opp.postedAt}
                  </span>
                </div>

                <p className="text-sm font-semibold text-zinc-100 leading-relaxed mb-3">
                  {opp.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                    <span>{opp.location} ({opp.distance})</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-1 text-zinc-300 bg-white/[0.04] px-2.5 py-0.5 rounded-md font-mono text-[11px] border border-white/10">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span>{opp.matchReason}</span>
                  </div>
                </div>
              </div>

              {/* Match Score Ring & Accept CTA */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Match Rank</div>
                    <div className="text-xs font-semibold text-white">High Precision</div>
                  </div>
                  <ScoreRing score={opp.matchScore} size={64} label="COMPAT" />
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => handleAccept(opp)}
                  className="rounded-full shadow-sm"
                >
                  Accept Mission
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {nearby.length === 0 && (
            <div className="p-8 text-center bg-[#0D0D12] rounded-2xl border border-white/10 text-sm text-zinc-400">
              No more nearby requests in your queue right now. Excellent work!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
