'use client';

import { useState } from 'react';
import { StatusBadge, UrgencyBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  History,
  Search,
  Download,
  Calendar,
  Star,
  UserCheck,
} from 'lucide-react';

interface PastRequest {
  id: string;
  category: string;
  description: string;
  date: string;
  resolvedIn: string;
  volunteer: string;
  rating: number;
  notes: string;
  status: 'COMPLETED' | 'CANCELLED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const PAST_REQUESTS: PastRequest[] = [
  {
    id: 'REQ-3920',
    category: 'Medical Supply',
    description: 'Emergency insulin pack delivery during localized flash flooding in Sector 2.',
    date: '12 Sep 2026',
    resolvedIn: '34 minutes',
    volunteer: 'Dr. Rahul Sharma',
    rating: 5,
    notes: 'Delivered securely in insulated cooling pack with cold gel compresses.',
    status: 'COMPLETED',
    urgency: 'CRITICAL',
  },
  {
    id: 'REQ-3841',
    category: 'Ration Kits',
    description: 'Weekly dry ration hamper and 15 liters of mineral water for elderly residents.',
    date: '04 Sep 2026',
    resolvedIn: '1 hour 15 mins',
    volunteer: 'Priya Kulkarni',
    rating: 5,
    notes: 'Provided by Red Cross Central Warehouse depot.',
    status: 'COMPLETED',
    urgency: 'HIGH',
  },
  {
    id: 'REQ-3712',
    category: 'Emergency Transport',
    description: 'Transit assistance to public health clinic for follow-up orthopedic checkup.',
    date: '28 Aug 2026',
    resolvedIn: '48 minutes',
    volunteer: 'Amit Verma',
    rating: 5,
    notes: 'Completed with return trip safely.',
    status: 'COMPLETED',
    urgency: 'MEDIUM',
  },
  {
    id: 'REQ-3601',
    category: 'Shelter Equipment',
    description: 'Heavy duty waterproof tarpaulins for monsoon wind damage.',
    date: '15 Aug 2026',
    resolvedIn: 'N/A',
    volunteer: 'Unassigned',
    rating: 0,
    notes: 'Resolved directly by neighborhood municipal works squad.',
    status: 'CANCELLED',
    urgency: 'LOW',
  },
];

export default function RequesterHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const filtered = PAST_REQUESTS.filter((req) => {
    const matchesSearch =
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Request History & Audit Log
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Archive of your resolved community assistance requests, delivery ETAs, and verified volunteers.
          </p>
        </div>

        <Button variant="secondary" size="md">
          <Download className="w-4 h-4" />
          Export Log (CSV)
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D0D12] p-4 rounded-xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search by ID, keyword, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            All Past ({PAST_REQUESTS.length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'COMPLETED'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'CANCELLED'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-md hover:border-white/25 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-md border border-white/15">
                  {item.id}
                </span>
                <span className="text-xs font-semibold text-zinc-300 bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/15">
                  {item.category}
                </span>
                <UrgencyBadge urgency={item.urgency} />
                <StatusBadge status={item.status} />
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.date}
                </span>
                {item.resolvedIn !== 'N/A' && (
                  <span className="text-[#2EEA8D] bg-[#2EEA8D]/10 border border-[#2EEA8D]/20 px-2.5 py-0.5 rounded-full font-medium">
                    Resolved in {item.resolvedIn}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-zinc-200 font-medium mb-3">
              {item.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-3 border-t border-white/10 text-zinc-400">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2EEA8D]" />
                <span>
                  Volunteer: <strong className="text-white">{item.volunteer}</strong>
                </span>
                {item.rating > 0 && (
                  <div className="flex items-center gap-0.5 text-amber-400 ml-2">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                )}
              </div>

              <div className="italic text-[11px] text-zinc-500">
                &ldquo;{item.notes}&rdquo;
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
