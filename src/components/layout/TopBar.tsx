'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Sparkles, ShieldCheck } from 'lucide-react';
import { useSessionRole } from './Sidebar';

export function TopBar() {
  const pathname = usePathname();
  const role = useSessionRole();

  // Page title inference
  const getTitle = () => {
    if (pathname.includes('/notifications')) return 'Notifications & Incident Alerts';
    if (pathname.includes('/requester/profile')) return 'Requester Profile & Contacts';
    if (pathname.includes('/requester/request/new')) return 'Create AI Aid Request';
    if (pathname.includes('/requester/history')) return 'Request Audit History';
    if (pathname.includes('/requester/dashboard')) return 'Requester Dashboard';
    if (pathname.includes('/volunteer/map')) return 'Live GPS & Tactical Routing';
    if (pathname.includes('/volunteer/assignments')) return 'Active Assignments';
    if (pathname.includes('/volunteer/profile')) return 'Volunteer Profile & Skills';
    if (pathname.includes('/volunteer/dashboard')) return 'Nearby Aid Opportunities';
    if (pathname.includes('/ngo/resources')) return 'Resource Inventory & Mesh';
    if (pathname.includes('/ngo/requests')) return 'Inbound Supply Requisitions';
    if (pathname.includes('/ngo/profile')) return 'Organization & Logistics Profile';
    if (pathname.includes('/ngo/dashboard')) return 'Command Operations & Map';
    return 'Community Coordination';
  };

  return (
    <header className="sticky top-0 h-16 bg-[#08080B] border-b border-white/10 flex items-center justify-between px-4 md:px-8 shrink-0 z-40 w-full shadow-lg">
      {/* Left: Mobile Brand & Desktop Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/15 bg-[#121217]">
            <Image src="/logo-new.png" alt="NexoraLink" width={32} height={32} className="object-cover scale-105" />
          </div>
          <span className="font-extrabold text-base text-white font-[family-name:var(--font-plus-jakarta)]">
            Nexora<span className="text-zinc-400">Link</span>
          </span>
        </Link>

        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-white font-[family-name:var(--font-plus-jakarta)]">
              {getTitle()}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/15 font-mono">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Right: Status Indicators & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* AI Engine Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-zinc-200 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            AI Engine Online
          </span>
        </div>

        {/* Rapid Role Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-xs text-zinc-300 font-medium capitalize">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>{role === 'ngo' ? 'NGO / Admin' : role}</span>
        </div>

        {/* Notifications */}
        <Link
          href={`/${role}/notifications`}
          aria-label="Notifications"
          className="relative p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/15 transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
        </Link>

        {/* User avatar chip */}
        <Link href={`/${role}/profile`} className="flex items-center gap-2 pl-2 border-l border-white/10 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shadow-[0_0_12px_rgba(255,255,255,0.3)]">
            NL
          </div>
        </Link>
      </div>
    </header>
  );
}
