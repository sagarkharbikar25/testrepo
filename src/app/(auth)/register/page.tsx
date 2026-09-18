'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, HandHelping, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Role } from '@/components/layout/Sidebar';

const ROLE_REDIRECTS: Record<Role, string> = {
  requester: '/requester/dashboard',
  volunteer: '/volunteer/dashboard',
  ngo: '/ngo/dashboard',
};

const ROLES: { id: Role; title: string; subtitle: string; icon: React.ElementType }[] = [
  {
    id: 'requester',
    title: 'Need Help (Requester)',
    subtitle: 'Request emergency aid, medicine, rations, or volunteer support',
    icon: HandHelping,
  },
  {
    id: 'volunteer',
    title: 'Volunteer',
    subtitle: 'Lend skills, provide transport, or aid local response teams',
    icon: User,
  },
  {
    id: 'ngo',
    title: 'NGO / Community Admin',
    subtitle: 'Manage shelter capacity, supply logistics, and aid distribution',
    icon: Building2,
  },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const roleParam = searchParams.get('role') as Role | null;
  const initialRole = (roleParam === 'requester' || roleParam === 'volunteer' || roleParam === 'ngo') ? roleParam : 'requester';
  const [role, setRole] = useState<Role>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise((r) => setTimeout(r, 400));
      sessionStorage.setItem('nexora_role', role);
      sessionStorage.setItem('nexora_email', email || `${role}@nexoralink.org`);
      sessionStorage.setItem('nexora_name', name || 'Community Member');
      router.push(ROLE_REDIRECTS[role]);
    } catch {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto my-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-3 group mb-2">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-white/15 group-hover:border-white transition-all bg-[#121217]">
            <Image
              src="/logo-new.png"
              alt="NexoraLink"
              width={48}
              height={48}
              className="object-cover w-full h-full scale-105"
            />
          </div>
          <span className="font-extrabold text-2xl text-white font-[family-name:var(--font-plus-jakarta)] tracking-tight">
            Nexora<span className="text-zinc-400">Link</span>
          </span>
        </Link>
        <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500 font-mono">
          People • Resources • Stronger Communities
        </p>
      </div>

      {/* Card — Luxe Obsidian */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-7 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
            Create your account
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Select your role to configure your permissions and intelligent dispatch feed
          </p>
        </div>

        {/* Role Picker */}
        <div className="space-y-2.5 mb-6">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            Choose Your Platform Role
          </label>
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-white bg-white/10 shadow-[0_0_16px_rgba(255,255,255,0.12)]'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/[0.06] text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-white' : 'text-zinc-300'
                      }`}
                    >
                      {r.title}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                    {r.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Full Name / Organization Name
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lin or Red Cross Relief"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.org"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? (
              'Creating Account...'
            ) : (
              <span className="flex items-center justify-center gap-2">
                Continue to {role === 'requester' ? 'Requester' : role === 'volunteer' ? 'Volunteer' : 'NGO'} Workspace
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-zinc-400">
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-white hover:underline">
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-400">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
