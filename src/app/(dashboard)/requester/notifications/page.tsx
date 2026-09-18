'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Bell,
  CheckCheck,
  Sparkles,
  UserCheck,
  Clock,
  AlertTriangle,
  Phone,
  ArrowRight,
  Trash2,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'DISPATCH' | 'TRIAGE' | 'ALERT' | 'COMPLETED';
  read: boolean;
  action?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-1',
    title: 'Responder En-Route to Your Location',
    message: 'Dr. Rahul Sharma accepted your Medical Transport request (REQ-4091). Estimated arrival is 8 minutes.',
    timestamp: '12m ago',
    category: 'DISPATCH',
    read: false,
    action: {
      label: 'Call Dr. Sharma (+91 98230 44120)',
      href: 'tel:+919823044120',
      isExternal: true,
    },
  },
  {
    id: 'NOTIF-2',
    title: 'AI Urgent Triage Classification',
    message: 'Your emergency food & potable water requisition was classified as HIGH priority by Gemini AI. 4 verified volunteers notified.',
    timestamp: '45m ago',
    category: 'TRIAGE',
    read: false,
    action: {
      label: 'View Request Status',
      href: '/requester/dashboard',
    },
  },
  {
    id: 'NOTIF-3',
    title: 'Civil Relief Advisory: Waterlogging Sector 4',
    message: 'Nagpur Municipal Corporation issued an orange alert for low-lying sectors. 3 dry food distribution points opened.',
    timestamp: '3h ago',
    category: 'ALERT',
    read: true,
  },
  {
    id: 'NOTIF-4',
    title: 'Aid Request Resolved & Verified',
    message: 'Blanket and tarpaulin delivery (REQ-4075) was successfully verified by Red Cross Logistics Hub.',
    timestamp: 'Yesterday',
    category: 'COMPLETED',
    read: true,
    action: {
      label: 'View Audit Record',
      href: '/requester/history',
    },
  },
];

export default function RequesterNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ALERT'>('ALL');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'ALERT') return n.category === 'ALERT' || n.category === 'DISPATCH';
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Notifications & Incident Alerts
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Real-time updates on volunteer dispatches, AI triage scoring, and community civil alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={markAllRead}
              className="text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              title="Clear notifications"
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0D0D12] p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === 'ALL'
                ? 'bg-white text-black font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('UNREAD')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === 'UNREAD'
                ? 'bg-white text-black font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('ALERT')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === 'ALERT'
                ? 'bg-white text-black font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Dispatches & Alerts
          </button>
        </div>

        <span className="text-xs font-mono text-zinc-500">
          {unreadCount} unread incident notices
        </span>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0D0D12] border border-white/10 space-y-2">
            <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
            <div className="text-white font-semibold text-sm">No notifications found</div>
            <p className="text-xs text-zinc-500">You are all caught up on all emergency and dispatch updates.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const getIcon = () => {
              if (item.category === 'DISPATCH') return <UserCheck className="w-4 h-4 text-[#2EEA8D]" />;
              if (item.category === 'TRIAGE') return <Sparkles className="w-4 h-4 text-white" />;
              if (item.category === 'ALERT') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
              return <CheckCheck className="w-4 h-4 text-zinc-300" />;
            };

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !item.read
                    ? 'bg-[#121217] border-white/20 shadow-md'
                    : 'bg-[#0A0A0E] border-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon()}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
                        {item.title}
                      </h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {item.timestamp}
                      </span>
                      <span>•</span>
                      <span className="uppercase font-semibold tracking-wider text-zinc-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.action && (
                    item.action.isExternal ? (
                      <a
                        href={item.action.href}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-[#2EEA8D]" />
                        {item.action.label}
                      </a>
                    ) : (
                      <Link
                        href={item.action.href}
                        className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs inline-flex items-center gap-1 hover:bg-zinc-200 transition-colors"
                      >
                        {item.action.label}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => toggleRead(item.id)}
                    className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors text-xs"
                    title={item.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    <CheckCheck className={`w-4 h-4 ${item.read ? 'text-zinc-600' : 'text-zinc-400'}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
