'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge, UrgencyBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Phone,
  Navigation,
  Check,
} from 'lucide-react';

interface Assignment {
  id: string;
  category: string;
  title: string;
  recipient: string;
  phone: string;
  address: string;
  status: 'IN_PROGRESS' | 'ACCEPTED' | 'COMPLETED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deadline: string;
  suppliesNeeded: string[];
}

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'ASN-102',
    category: 'Prescription Medication',
    title: 'Emergency insulin vial delivery for elderly patient',
    recipient: 'Kavita Patel',
    phone: '+91 98200 41122',
    address: 'Flat 402, Sai Vihar, Sector 8 (0.9 km)',
    status: 'IN_PROGRESS',
    urgency: 'CRITICAL',
    deadline: 'Within 45 mins',
    suppliesNeeded: ['1x Insulatard 100IU/ml', 'Syringe Pack'],
  },
  {
    id: 'ASN-101',
    category: 'Ration Kits',
    title: 'Deliver 2 emergency food & hydration boxes to stranded family',
    recipient: 'Sunil Rao',
    phone: '+91 98110 33455',
    address: 'Old Police Quarters, Block C (1.6 km)',
    status: 'ACCEPTED',
    urgency: 'HIGH',
    deadline: 'Today by 5:00 PM',
    suppliesNeeded: ['Dry Grains 5kg', 'Mineral Water 5L x2'],
  },
  {
    id: 'ASN-094',
    category: 'Mobility Transport',
    title: 'Wheelchair hospital transit for orthopedic checkup',
    recipient: 'Meera Deshmukh',
    phone: '+91 97660 88210',
    address: 'Near Central Bus Station (2.3 km)',
    status: 'COMPLETED',
    urgency: 'MEDIUM',
    deadline: 'Completed Yesterday',
    suppliesNeeded: ['Vehicle with trunk space'],
  },
];

export default function VolunteerAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);

  const handleMarkDone = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'COMPLETED' } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              My Active Assignments
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Manage your committed volunteer tasks, contact recipients, and log delivery completion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.06] text-white border border-white/15 font-mono">
            {assignments.filter((a) => a.status !== 'COMPLETED').length} Ongoing Tasks
          </span>
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="space-y-4">
        {assignments.map((item) => {
          const isDone = item.status === 'COMPLETED';
          return (
            <div
              key={item.id}
              className={`bg-[#0D0D12] rounded-2xl border p-5 sm:p-6 shadow-md transition-all ${
                isDone ? 'border-white/5 opacity-60' : 'border-white/15 hover:border-white/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-md border border-white/15">
                    {item.id}
                  </span>
                  <span className="text-xs font-semibold text-zinc-300 bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/15">
                    {item.category}
                  </span>
                  <UrgencyBadge urgency={item.urgency} />
                  <StatusBadge status={item.status} />
                </div>

                <div className="text-xs font-medium text-zinc-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {item.deadline}
                </div>
              </div>

              <h3 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)] mb-2">
                {item.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300 mb-4 bg-white/[0.03] p-3.5 rounded-xl border border-white/10">
                <div>
                  <span className="font-semibold text-zinc-400 block mb-0.5 font-mono text-[11px]">RECIPIENT & CONTACT:</span>
                  <div className="text-white font-medium">{item.recipient}</div>
                  <a
                    href={`tel:${item.phone}`}
                    className="inline-flex items-center gap-1 text-white hover:underline font-semibold mt-0.5"
                  >
                    <Phone className="w-3 h-3 text-zinc-400" />
                    {item.phone}
                  </a>
                </div>

                <div>
                  <span className="font-semibold text-zinc-400 block mb-0.5 font-mono text-[11px]">DESTINATION:</span>
                  <div className="text-white flex items-start gap-1">
                    <Navigation className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{item.address}</span>
                  </div>
                </div>
              </div>

              {/* Required supplies */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Supplies:</span>
                  {item.suppliesNeeded.map((sup, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300 font-medium"
                    >
                      {sup}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!isDone ? (
                    <>
                      <Link
                        href="/volunteer/map"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Live Route
                      </Link>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleMarkDone(item.id)}
                        className="shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Task Completed
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-[#2EEA8D] bg-[#2EEA8D]/10 border border-[#2EEA8D]/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Delivered & Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
