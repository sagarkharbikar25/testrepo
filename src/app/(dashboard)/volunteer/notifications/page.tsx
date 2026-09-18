'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  Bell,
  CheckCheck,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  Phone,
  Navigation,
  CheckCircle2,
  Trash2,
  Radio,
  PlusCircle,
  ShieldCheck,
  Package,
} from 'lucide-react';

interface VolunteerNotification {
  id: string;
  requestId?: string;
  requesterName: string;
  category: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
  location: string;
  timestamp: string;
  phone: string;
  itemsNeeded?: string[];
  read: boolean;
  type: 'NEW_REQUEST' | 'ASSIGNMENT_UPDATE' | 'CIVIL_ALERT';
}

const DEFAULT_NOTIFICATIONS: VolunteerNotification[] = [
  {
    id: 'VNOTIF-1',
    requestId: 'REQ-4091',
    requesterName: 'Sagar Kharbikar',
    category: 'Medical Transport',
    urgency: 'CRITICAL',
    message: 'New critical request: Diabetic household requires urgent cold-chain insulin transport to sector 4 clinic.',
    location: 'Flat 302, Green Valley Apartments, Sector 4 (1.8 km away)',
    timestamp: 'Just now',
    phone: '+91 98230 11492',
    itemsNeeded: ['Cold-chain Insulin transport', 'Mobility Van'],
    read: false,
    type: 'NEW_REQUEST',
  },
  {
    id: 'VNOTIF-2',
    requestId: 'REQ-3820',
    requesterName: 'Pooja Sharma',
    category: 'Food & Potable Water',
    urgency: 'HIGH',
    message: 'New relief requisition: Stranded family of 5 requires potable drinking water cans and dry ration packets.',
    location: 'Near Old Water Reservoir, Dhantoli (2.4 km away)',
    timestamp: '18m ago',
    phone: '+91 98211 44582',
    itemsNeeded: ['20L Drinking Water', 'Dry Ration Pack x4'],
    read: false,
    type: 'NEW_REQUEST',
  },
  {
    id: 'VNOTIF-3',
    requesterName: 'Nagpur Civil Defense Authority',
    category: 'Weather Warning',
    urgency: 'MEDIUM',
    message: 'Flash precipitation warning for Ward 7. Volunteers equipped with 4x4 vehicles are requested on standby.',
    location: 'North Ward Corridor',
    timestamp: '1h ago',
    phone: '+91 71225 61234',
    read: true,
    type: 'CIVIL_ALERT',
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

export default function VolunteerNotificationsPage() {
  const mounted = useMounted();
  const router = useRouter();
  const [notifications, setNotifications] = useState<VolunteerNotification[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'REQUESTS'>('ALL');
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Sync real requests raised by requesters from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('nexora_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const generatedNotifs: VolunteerNotification[] = parsed.map((item: any, idx: number) => ({
            id: `VNOTIF-REQ-${item.id || idx}`,
            requestId: item.id || `REQ-${idx + 100}`,
            requesterName: item.name || 'Community Requester',
            category: item.category || 'Disaster Relief Support',
            urgency: item.urgency || 'HIGH',
            message: item.description || `Immediate assistance requested for ${item.category || 'emergency supplies'}.`,
            location: item.address || 'Nagpur Urban Sector',
            timestamp: item.createdAt || 'Recent',
            phone: item.phone || '+91 98000 00000',
            itemsNeeded: item.itemsNeeded || ['Emergency Kit'],
            read: false,
            type: 'NEW_REQUEST',
          }));

          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const fresh = generatedNotifs.filter((n) => !existingIds.has(n.id));
            return [...fresh, ...prev];
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen to cross-tab storage events when a requester submits in another tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nexora_requests' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const latest = parsed[0];
            const newNotif: VolunteerNotification = {
              id: `VNOTIF-REQ-${latest.id || Date.now()}`,
              requestId: latest.id || 'REQ-LIVE',
              requesterName: latest.name || 'New Requester',
              category: latest.category || 'Aid Requisition',
              urgency: latest.urgency || 'CRITICAL',
              message: latest.description || 'New aid request just raised nearby.',
              location: latest.address || 'Nearby Location',
              timestamp: 'Just now',
              phone: latest.phone || '+91 98000 00000',
              itemsNeeded: latest.itemsNeeded || ['Supplies'],
              read: false,
              type: 'NEW_REQUEST',
            };

            setNotifications((prev) => [newNotif, ...prev]);
            setAlertBanner(`🚨 New Request Raised by ${newNotif.requesterName} (${newNotif.category})!`);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'REQUESTS') return n.type === 'NEW_REQUEST';
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

  // Quick test helper for user demonstration
  const handleSimulateNewRequest = () => {
    const demoId = `REQ-DEMO-${Date.now().toString().slice(-4)}`;
    const demoNotif: VolunteerNotification = {
      id: `VNOTIF-${Date.now()}`,
      requestId: demoId,
      requesterName: 'Aarav Deshmukh',
      category: 'Emergency Medical Kit',
      urgency: 'CRITICAL',
      message: 'Urgent: Oxygen cylinder and nebulizer required immediately for asthma patient stranded in flood zone.',
      location: 'Plot 45, By-pass Ring Road (1.2 km away)',
      timestamp: 'Just now',
      phone: '+91 98221 55432',
      itemsNeeded: ['Oxygen Cylinder', 'Nebulizer Kit'],
      read: false,
      type: 'NEW_REQUEST',
    };

    setNotifications((prev) => [demoNotif, ...prev]);
    setAlertBanner(`🚨 Incoming Request: ${demoNotif.requesterName} requires ${demoNotif.category}!`);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Real-time Alert Banner */}
      {alertBanner && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-red-400 shrink-0 animate-ping" />
            <div>
              <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                LIVE DISPATCH BROADCAST
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{alertBanner}</div>
            </div>
          </div>
          <button
            onClick={() => setAlertBanner(null)}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-black/40 border border-white/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Volunteer Dispatch Alerts
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE SYNC
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Real-time incoming alerts whenever a requester raises an aid or medical requisition.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulation button to test requester raising request */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSimulateNewRequest}
            className="text-xs flex items-center gap-1.5 border-dashed border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
            title="Simulate incoming requester aid request"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
            Test Requester Alert
          </Button>

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
              title="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {(
            [
              { id: 'ALL', label: 'All Alerts', count: notifications.length },
              { id: 'REQUESTS', label: 'New Requester Requests', count: notifications.filter((n) => n.type === 'NEW_REQUEST').length },
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
          {filtered.length} visible of {notifications.length} total
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3 text-zinc-500">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Notifications in this view</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Whenever a community requester raises an emergency request in your radius, you will receive real-time notifications here.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isCritical = item.urgency === 'CRITICAL';
            const isHigh = item.urgency === 'HIGH';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                  !item.read
                    ? 'bg-[#121218] border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]'
                    : 'bg-[#0A0A0E] border-white/5 opacity-75 hover:opacity-100 hover:border-white/10'
                }`}
              >
                {/* Left urgency indicator strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isCritical
                      ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                      : isHigh
                      ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                      : 'bg-blue-400'
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
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {item.urgency} DISPATCH
                      </span>

                      <span className="text-xs font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
                        {item.category}
                      </span>

                      {item.requestId && (
                        <span className="text-[10px] font-mono text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                          {item.requestId}
                        </span>
                      )}

                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse" />
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      Raised by <span className="text-white font-bold">{item.requesterName}</span>
                    </h4>

                    <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                      {item.message}
                    </p>

                    {/* Location and Items needed */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="text-zinc-300">{item.location}</span>
                      </div>

                      {item.itemsNeeded && item.itemsNeeded.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Package className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.itemsNeeded.map((it, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-zinc-300 border border-white/10 font-mono"
                              >
                                {it}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Timestamp */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 pt-2 sm:pt-0">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Navigate via Live GPS Route */}
                      <Link
                        href="/volunteer/map"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Live Route Map
                      </Link>

                      {/* Direct phone call */}
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/15 text-white border border-white/15 transition-colors"
                          title="Call Requester"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
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
