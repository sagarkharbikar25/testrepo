'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, HandHelping, Building2, ArrowRight } from 'lucide-react';
import type { Role } from '@/components/layout/Sidebar';

const ROLE_REDIRECTS: Record<Role, string> = {
  requester: '/requester/dashboard',
  volunteer: '/volunteer/dashboard',
  ngo: '/ngo/dashboard',
};

const ROLES: { id: Role; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'requester', label: 'Requester', desc: 'Need aid or supplies', icon: HandHelping },
  { id: 'volunteer', label: 'Volunteer', desc: 'Ready to help nearby', icon: User },
  { id: 'ngo', label: 'NGO / Admin', desc: 'Manage inventory & ops', icon: Building2 },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(() => {
    if (typeof window === 'undefined') return 'requester';
    const raw = sessionStorage.getItem('nexora_role');
    return (raw === 'admin' ? 'ngo' : raw || 'requester') as Role;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise((r) => setTimeout(r, 350));
      sessionStorage.setItem('nexora_role', selectedRole);
      sessionStorage.setItem('nexora_email', email || `${selectedRole}@nexoralink.org`);
      router.push(ROLE_REDIRECTS[selectedRole]);
    } catch {
      setError('An error occurred during authentication.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto my-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group mb-3">
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

      {/* Login Card — Luxe Obsidian */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-7 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
            Sign in to your account
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Choose your role to access the relevant coordination workspace
          </p>
        </div>

        {/* Role Selector Tabs (3 Roles) */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
            Select Workspace Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'border-white bg-white/10 text-white font-semibold shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                      : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`e.g. ${selectedRole}@nexoralink.org`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Password
              </label>
              <a href="#" className="text-xs text-zinc-400 hover:text-white hover:underline">
                Forgot?
              </a>
            </div>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
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
              'Authenticating...'
            ) : (
              <span className="flex items-center justify-center gap-2">
                Enter {selectedRole === 'requester' ? 'Requester' : selectedRole === 'volunteer' ? 'Volunteer' : 'NGO / Admin'} Workspace
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-zinc-400">
            Don&apos;t have an account yet?{' '}
            <Link
              href={`/register?role=${selectedRole}`}
              className="font-semibold text-white hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
