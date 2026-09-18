'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus,
  History,
  MapPin,
  Briefcase,
  User,
  Package,
  InboxIcon,
  Building2,
  Shield,
  LogOut,
  Sparkles,
  Bell,
  Navigation,
} from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';

export type Role = 'requester' | 'volunteer' | 'ngo';

const emptySubscribe = () => () => {};

export function useSessionRole(): Role {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === 'undefined') return 'requester';
      const raw = sessionStorage.getItem('nexora_role');
      return (raw === 'admin' ? 'ngo' : raw || 'requester') as Role;
    },
    () => 'requester'
  );
}

function useSessionEmail(): string {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === 'undefined') return 'user@nexoralink.org';
      return sessionStorage.getItem('nexora_email') || 'user@nexoralink.org';
    },
    () => 'user@nexoralink.org'
  );
}

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

// Strictly separate nav configurations for the 3 distinct modules
const NAV_ITEMS: Record<Role, NavItem[]> = {
  requester: [
    { href: '/requester/dashboard', label: 'My Requests', icon: LayoutDashboard },
    { href: '/requester/request/new', label: 'New Request', icon: FilePlus, badge: 'AI' },
    { href: '/requester/history', label: 'Request History', icon: History },
    { href: '/requester/notifications', label: 'Notifications', icon: Bell },
    { href: '/requester/profile', label: 'My Profile', icon: User },
  ],
  volunteer: [
    { href: '/volunteer/dashboard', label: 'Nearby Requests', icon: MapPin },
    { href: '/volunteer/assignments', label: 'My Assignments', icon: Briefcase },
    { href: '/volunteer/map', label: 'Live GPS & Route', icon: Navigation, badge: 'GPS' },
    { href: '/volunteer/notifications', label: 'Notifications', icon: Bell },
  ],
  ngo: [
    { href: '/ngo/dashboard', label: 'Command & Map', icon: Shield, badge: 'Live' },
    { href: '/ngo/resources', label: 'Resource Inventory', icon: Package },
    { href: '/ngo/requests', label: 'Inbound Requisitions', icon: InboxIcon },
    { href: '/ngo/notifications', label: 'Command Alerts', icon: Bell },
    { href: '/ngo/profile', label: 'Organization Profile', icon: Building2 },
  ],
};

const ROLE_LABELS: Record<Role, { title: string; badge: string; color: string; dot: string }> = {
  requester: {
    title: 'Requester Portal',
    badge: 'ACTIVE',
    color: 'text-zinc-200 bg-white/10 border-white/20',
    dot: 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]',
  },
  volunteer: {
    title: 'Volunteer Network',
    badge: 'VOLUNTEER',
    color: 'text-zinc-200 bg-white/10 border-white/20',
    dot: 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]',
  },
  ngo: {
    title: 'NGO / Admin Center',
    badge: 'COORDINATOR',
    color: 'text-zinc-200 bg-white/10 border-white/20',
    dot: 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]',
  },
};

const ROLE_HOME: Record<Role, string> = {
  requester: '/requester/dashboard',
  volunteer: '/volunteer/dashboard',
  ngo: '/ngo/dashboard',
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useSessionRole();
  const userEmail = useSessionEmail();
  const mounted = useMounted();

  // Strict Role Guard: Ensures complete isolation between the 3 modules
  useEffect(() => {
    if (!mounted) return;

    // Forward any legacy /admin path to /ngo/dashboard
    if (pathname.startsWith('/admin')) {
      router.replace('/ngo/dashboard');
      return;
    }

    // Other roles routes check
    const otherRoles: Role[] = (['requester', 'volunteer', 'ngo'] as Role[]).filter(
      (r) => r !== role
    );
    const isOnForeignRoute = otherRoles.some((r) => pathname.startsWith(`/${r}`));
    if (isOnForeignRoute) {
      router.replace(ROLE_HOME[role]);
    }
  }, [role, pathname, router, mounted]);

  const navItems = NAV_ITEMS[role] || NAV_ITEMS.requester;
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.requester;

  return (
    <aside className="w-64 bg-[#08080B] border-r border-white/10 h-screen hidden md:flex flex-col shrink-0 text-white select-none z-30 sticky top-0">
      {/* Brand Header — Matching logo.png */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg flex items-center justify-center bg-[#121217] border border-white/15 group-hover:border-white transition-all">
            <Image
              src="/logo-new.png"
              alt="NexoraLink"
              width={40}
              height={40}
              priority
              className="object-cover w-full h-full scale-105"
            />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight font-[family-name:var(--font-plus-jakarta)] flex items-center text-white">
              Nexora<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">Link</span>
            </div>
            <div className="text-[9px] font-bold tracking-wider uppercase text-zinc-400">
              People • Resources • Community
            </div>
          </div>
        </Link>

        {/* Active Role Indicator Badge (Role-specific, no switcher) */}
        <div className="mt-4 flex items-center justify-between bg-[#121217] border border-white/10 rounded-xl px-3 py-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${roleInfo.dot} animate-pulse`} />
            <span className="text-xs font-bold tracking-wide text-zinc-200">
              {roleInfo.title}
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${roleInfo.color}`}>
            {roleInfo.badge}
          </span>
        </div>
      </div>

      {/* Role-Specific Navigation (Strictly for the current module) */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-3 mb-2">
          {role === 'requester' ? 'Requester Workspace' : role === 'volunteer' ? 'Volunteer Workspace' : 'NGO / Admin Operations'}
        </div>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                active
                  ? 'bg-white/[0.08] text-white font-semibold border-l-2 border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                  <Sparkles className="w-2.5 h-2.5 text-zinc-300" />
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Sign Out */}
      <div className="p-4 border-t border-white/10 bg-[#08080B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xs shadow-[0_0_12px_rgba(255,255,255,0.3)] shrink-0">
              {userEmail.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {userEmail.split('@')[0]}
              </div>
              <div className="text-[10px] text-zinc-400 truncate capitalize font-mono">
                {role === 'ngo' ? 'NGO / Admin' : role}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sessionStorage.clear();
              router.push('/login');
            }}
            title="Sign Out"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
