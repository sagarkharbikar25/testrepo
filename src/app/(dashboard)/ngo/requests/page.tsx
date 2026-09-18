'use client';

import { useState } from 'react';
import { UrgencyBadge, UrgencyLevel } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import {
  InboxIcon,
  CheckCircle2,
  XCircle,
  Package,
  MapPin,
  Clock,
} from 'lucide-react';

interface ResourceRequest {
  id: string;
  requesterType: 'Volunteer' | 'Community Member' | 'Hospital Hub';
  requesterName: string;
  resourceName: string;
  quantityRequested: number;
  unit: string;
  urgency: UrgencyLevel;
  destination: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const INITIAL_REQUESTS: ResourceRequest[] = [
  {
    id: 'REQ-RES-01',
    requesterType: 'Volunteer',
    requesterName: 'Dr. Rahul Sharma',
    resourceName: 'Insulin Cold-Storage Ampoules',
    quantityRequested: 2,
    unit: 'vials',
    urgency: 'CRITICAL',
    destination: 'Sector 8, Lotus Towers (0.9 km)',
    requestedAt: '15m ago',
    status: 'PENDING',
  },
  {
    id: 'REQ-RES-02',
    requesterType: 'Community Member',
    requesterName: 'Family stranded at Riverbed',
    resourceName: 'Emergency Food Ration Packs',
    quantityRequested: 3,
    unit: 'packs',
    urgency: 'HIGH',
    destination: 'Riverbed Lane, Block B',
    requestedAt: '35m ago',
    status: 'PENDING',
  },
  {
    id: 'REQ-RES-03',
    requesterType: 'Hospital Hub',
    requesterName: 'East Suburban Relief Camp',
    resourceName: 'Drinking Water Cans (20L)',
    quantityRequested: 10,
    unit: 'cans',
    urgency: 'MEDIUM',
    destination: 'Camp Staging Area 2',
    requestedAt: '2 hrs ago',
    status: 'APPROVED',
  },
];

export default function NGORequestsPage() {
  const [requests, setRequests] = useState<ResourceRequest[]>(INITIAL_REQUESTS);

  const handleAction = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
              <InboxIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Inbound Resource Requests
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Review and authorize supply requisitions from field volunteers and community shelters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.06] text-zinc-200 border border-white/15 font-mono">
            {requests.filter((r) => r.status === 'PENDING').length} Pending Approvals
          </span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((item) => (
          <div
            key={item.id}
            className="bg-[#0D0D12] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-md hover:border-white/25 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded border border-white/15">
                  {item.id}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.05] text-zinc-300 border border-white/15">
                  {item.requesterType}: {item.requesterName}
                </span>
                <UrgencyBadge urgency={item.urgency} />
              </div>

              <div className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.requestedAt}
              </div>
            </div>

            {/* Requested Supplies Callout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.08] text-white flex items-center justify-center border border-white/15 shadow-inner">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase font-mono">
                    Requisition Item:
                  </div>
                  <div className="text-sm font-bold text-white">
                    {item.quantityRequested} {item.unit} of {item.resourceName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>Destination: {item.destination}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {item.status === 'APPROVED' && (
                  <span className="text-xs font-semibold text-[#2EEA8D] bg-[#2EEA8D]/10 px-3 py-1 rounded-full border border-[#2EEA8D]/20 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Authorized for Release
                  </span>
                )}
                {item.status === 'REJECTED' && (
                  <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-1 font-mono">
                    <XCircle className="w-3.5 h-3.5" />
                    Requisition Declined
                  </span>
                )}
                {item.status === 'PENDING' && (
                  <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-mono">
                    Awaiting NGO Dispatch Approval
                  </span>
                )}
              </div>

              {item.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(item.id, 'REJECTED')}
                    className="text-red-400 border border-red-500/30 hover:bg-red-500/20"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Decline
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleAction(item.id, 'APPROVED')}
                    className="shadow-sm font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Authorize & Dispatch
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
