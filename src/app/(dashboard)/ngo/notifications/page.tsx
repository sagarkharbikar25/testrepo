'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Bell,
  CheckCheck,
  Sparkles,
  Package,
  InboxIcon,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Clock,
  Trash2,
  CheckCircle2,
  Building2,
  Activity,
} from 'lucide-react';

interface NgoNotification {
  id: string;
  title: string;
  message: string;
  category: 'REQUISITION' | 'SUPPLY' | 'ALERT' | 'VERIFICATION';
  severity: 'CRITICAL' | 'HIGH' | 'INFO';
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

const DEFAULT_NGO_NOTIFICATIONS: NgoNotification[] = [
  {
    id: 'NGO-NTF-1',
    title: 'Critical Supply Depletion: Cold-Chain Insulin',
    message: 'Central Warehouse storage is below 15% safety buffer threshold. 12 urgent requesters awaiting allocation.',
    category: 'SUPPLY',
    severity: 'CRITICAL',
    timestamp: '8m ago',
    read: false,
    action: {
      label: 'Inspect Inventory',
      href: '/ngo/resources',
    },
  },
  {
    id: 'NGO-NTF-2',
    title: 'High-Priority Inbound Requisition: Flood Zone 3',
    message: 'Medical transport and high-capacity water pumps requested for 14 families stranded near Wardha Canal.',
    category: 'REQUISITION',
    severity: 'HIGH',
    timestamp: '25m ago',
    read: false,
    action: {
      label: 'Review Requisitions',
      href: '/ngo/requests',
    },
  },
  {
    id: 'NGO-NTF-3',
    title: 'Gemini AI Incident Triage Escalation',
    message: 'Regional hydrological telemetry detected rising water levels in Sector 4. Geospatial risk index elevated to Level 3.',
    category: 'ALERT',
    severity: 'HIGH',
    timestamp: '1h ago',
    read: false,
    action: {
      label: 'Open Command Map',
      href: '/ngo/dashboard',
    },
  },
  {
    id: 'NGO-NTF-4',
    title: 'Volunteer Network Deployment Verified',
    message: 'Disaster response team Alpha checked in at Northern Relief Staging Hub with 40 dry ration kits.',
    category: 'VERIFICATION',
    severity: 'INFO',
    timestamp: '2h ago',
    read: true,
  },
];

const emptySubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function NgoNotificationsPage() {
  const mounted = useMounted();
  const [notifications, setNotifications] = useState<NgoNotification[]>(DEFAULT_NGO_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL'>('ALL');

  // Dynamically sync new requests raised by requesters as inbound requisitions for the NGO
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('nexora_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const freshRequisitions: NgoNotification[] = parsed.map((item: any, idx: number) => ({
            id: `NGO-REQ-NTF-${item.id || idx}`,
            title: `New Inbound Requisition: ${item.category || 'Aid Requisition'}`,
            message: `${item.name || 'Citizen'} submitted an urgent aid request for ${item.address || 'Nagpur Urban Ward'}. Requires NGO coordinator triage.`,
            category: 'REQUISITION',
            severity: item.urgency === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
            timestamp: 'Recent',
            read: false,
            action: {
              label: 'Review & Allocate',
              href: '/ngo/requests',
            },
          }));

          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const fresh = freshRequisitions.filter((r) => !existingIds.has(r.id));
            return [...fresh, ...prev];
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'CRITICAL') return n.severity === 'CRITICAL';
    return true;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Command Incident & Resource Alerts
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Real-time telemetry for NGO logistics coordinators, inbound citizen requisitions, and supply depletion flags.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={markAllRead}
              className="text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              Mark All Read
            </Button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-colors"
              title="Clear all alerts"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {(
            [
              { id: 'ALL', label: 'All Alerts', count: notifications.length },
              { id: 'CRITICAL', label: 'Critical Supply & Risks', count: notifications.filter((n) => n.severity === 'CRITICAL').length },
              { id: 'UNREAD', label: 'Unread', count: unreadCount },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-white text-black shadow-md'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-zinc-500 font-mono hidden sm:block">
          {filtered.length} active alerts
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3 text-zinc-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Active Incident Alerts</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              All municipal logistics, supply inventories, and citizen requisition streams are currently normalized.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isCritical = item.severity === 'CRITICAL';
            const isHigh = item.severity === 'HIGH';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                  !item.read
                    ? 'bg-[#121218] border-white/20 shadow-xl'
                    : 'bg-[#0A0A0E] border-white/5 opacity-75 hover:opacity-100 hover:border-white/10'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isCritical
                      ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                      : isHigh
                      ? 'bg-amber-400'
                      : 'bg-white/40'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0 pl-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/10 text-zinc-300 border-white/20'
                        }`}
                      >
                        {item.severity} • {item.category}
                      </span>

                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {item.title}
                    </h4>

                    <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 pt-2 sm:pt-0">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.action && (
                        <Link
                          href={item.action.href}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-black hover:bg-zinc-200 rounded-xl shadow-md transition-all"
                        >
                          <span>{item.action.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleRead(item.id)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors"
                        title={item.read ? 'Mark as unread' : 'Mark as read'}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${item.read ? 'text-emerald-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
