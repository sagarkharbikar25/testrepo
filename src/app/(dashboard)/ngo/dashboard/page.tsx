'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { StatusBadge, UrgencyBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import {
  Users,
  ClipboardList,
  Package,
  AlertTriangle,
  Activity,
  CheckCircle,
  Clock,
  UserCheck,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';

const CommandMap = dynamic(
  () => import('@/components/map/CommandMap').then((mod) => mod.CommandMap),
  { ssr: false, loading: () => <div className="h-[380px] bg-[#0A0A0E] animate-pulse rounded-2xl border border-white/10" /> }
);

interface LiveIncident {
  id: string;
  category: string;
  description: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'REQUESTED' | 'MATCHING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  area: string;
  responder?: string;
}

interface PendingVerification {
  id: string;
  name: string;
  type: 'Volunteer' | 'Community Partner';
  credentials: string;
  submitted: string;
}

const STATS = [
  { label: 'Total Aid Requests', value: '1,248', icon: ClipboardList },
  { label: 'Active Volunteers', value: '874', icon: Users },
  { label: 'Supplies in Stock', value: '342', icon: Package },
  { label: 'Active Deficit Gaps', value: '2', icon: AlertTriangle },
  { label: 'Missions In-Flight', value: '89', icon: Activity },
  { label: 'Completed Today', value: '41', icon: CheckCircle },
  { label: 'Avg Triage Time', value: '2.4m', icon: Clock },
  { label: 'Pending Verifications', value: '3', icon: UserCheck },
];

const INITIAL_REQUESTS: LiveIncident[] = [
  {
    id: 'REQ-4091',
    category: 'Medical',
    description: 'Elderly patient needs urgent transportation to City Hospital for dialysis.',
    urgency: 'CRITICAL',
    status: 'IN_PROGRESS',
    area: 'Sector 4, West',
    responder: 'Dr. Rahul Sharma',
  },
  {
    id: 'REQ-4088',
    category: 'Food Relief',
    description: 'Family of 5 stranded due to waterlogging, needs 3-day dry rations.',
    urgency: 'HIGH',
    status: 'MATCHING',
    area: 'Riverbed Lane, Block B',
  },
  {
    id: 'REQ-4085',
    category: 'Medical Supply',
    description: 'Insulin vial emergency dispatch required for juvenile patient.',
    urgency: 'CRITICAL',
    status: 'ASSIGNED',
    area: 'Sector 8, Lotus Towers',
    responder: 'Volunteer Unit #4',
  },
  {
    id: 'REQ-4079',
    category: 'Shelter',
    description: 'Roof tarpaulins and thermal blankets for storm damage repair.',
    urgency: 'MEDIUM',
    status: 'IN_PROGRESS',
    area: 'Old Market Road',
    responder: 'NGO Fleet Van 2',
  },
];

const INITIAL_VERIFICATIONS: PendingVerification[] = [
  {
    id: 'VER-01',
    name: 'Dr. Amit Sharma, MD',
    type: 'Volunteer',
    credentials: 'MBBS Medical License #MH-8812',
    submitted: '15m ago',
  },
  {
    id: 'VER-02',
    name: 'Care Foundation Logistics',
    type: 'Community Partner',
    credentials: 'NGO DARPAN ID: MH/2021/02918',
    submitted: '1h ago',
  },
  {
    id: 'VER-03',
    name: 'Sunita Patel (Heavy Vehicle Driver)',
    type: 'Volunteer',
    credentials: 'Commercial HMV License #99102',
    submitted: '3h ago',
  },
];

export default function NGODashboard() {
  const [incidents] = useState<LiveIncident[]>(INITIAL_REQUESTS);
  const [verifications, setVerifications] = useState<PendingVerification[]>(INITIAL_VERIFICATIONS);

  const handleVerify = (id: string) => {
    setVerifications((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              NGO / Admin Command Operations Center
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            High-level platform telemetry, automated triage queues, and geospatial responder deployment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/ngo/resources">
            <Button variant="primary" size="md" className="shadow-[0_0_18px_rgba(255,255,255,0.25)]">
              <Package className="w-4 h-4" />
              Manage Inventory
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Telemetry Stats Grid (8 KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {s.value}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-1 font-mono">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Geospatial Leaflet Operations Map (CartoDB Dark Matter) */}
      <CommandMap />

      {/* Split Grid: Live Incidents & Pending Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Incidents (2 Columns) */}
        <div className="lg:col-span-2 bg-[#0D0D12] rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
                Active Incident Feed
              </h2>
              <p className="text-xs text-zinc-400">
                Live updates streaming across city coordination corridors
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white border border-white/15 font-mono">
              {incidents.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {incidents.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-black/70 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">
                      {req.id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.05] text-zinc-300 border border-white/15">
                      {req.category}
                    </span>
                    <UrgencyBadge urgency={req.urgency} />
                    <StatusBadge status={req.status} />
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-zinc-200 line-clamp-1">
                    {req.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5 font-mono">
                    <span>Location: {req.area}</span>
                    {req.responder && (
                      <>
                        <span>•</span>
                        <span className="text-[#2EEA8D] font-semibold">
                          Assigned: {req.responder}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Queue (1 Column) */}
        <div className="bg-[#0D0D12] rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="pb-3 border-b border-white/10">
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Verification Queue
            </h2>
            <p className="text-xs text-zinc-400">
              Verify volunteer licenses & partner credentials
            </p>
          </div>

          <div className="space-y-3">
            {verifications.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {item.submitted}
                  </span>
                </div>

                <div className="text-xs text-zinc-300 bg-[#121217] p-2.5 rounded-lg border border-white/10">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono">
                    {item.type} Credential:
                  </div>
                  <div className="font-mono text-[11px] font-semibold text-zinc-200 mt-0.5">
                    {item.credentials}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleVerify(item.id)}
                    className="flex-1 py-1.5 rounded-full border border-white/15 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center gap-1 font-medium transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-red-400" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerify(item.id)}
                    className="flex-1 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs flex items-center justify-center gap-1 font-bold shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                </div>
              </div>
            ))}

            {verifications.length === 0 && (
              <div className="p-6 text-center text-xs text-zinc-500 font-mono">
                All pending verifications cleared!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
