'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  Check,
  AlertCircle,
  Accessibility,
  Baby,
  Users,
} from 'lucide-react';

interface RequesterProfileData {
  name: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  specialNeeds: string[];
  notes: string;
}

const DEFAULT_PROFILE: RequesterProfileData = {
  name: 'Sagar Kharbikar',
  phone: '+91 98230 11492',
  email: 'sagar@nexoralink.org',
  address: 'Flat 302, Green Valley Apartments, Near City Bus Depot, Sector 4',
  emergencyContactName: 'Anil Kharbikar (Father)',
  emergencyContactPhone: '+91 98220 99401',
  specialNeeds: ['Elderly Household Member (65+)', 'Diabetic / Cold-Chain Medicine Required'],
  notes: 'First floor apartment with lift access. Power backup available during localized outages.',
};

const NEED_OPTIONS = [
  { id: 'Elderly Household Member (65+)', label: 'Elderly Household Member (65+)', icon: Users },
  { id: 'Wheelchair / Mobility Assistance', label: 'Wheelchair / Mobility Assistance', icon: Accessibility },
  { id: 'Diabetic / Cold-Chain Medicine Required', label: 'Diabetic / Cold-Chain Medication', icon: Heart },
  { id: 'Infant / Small Children (0-5 yrs)', label: 'Infant / Small Children (0-5 yrs)', icon: Baby },
];

export default function RequesterProfilePage() {
  const [profile, setProfile] = useState<RequesterProfileData>(() => {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
      const stored = localStorage.getItem('nexora_requester_profile');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  const [saved, setSaved] = useState(false);

  const toggleNeed = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      specialNeeds: prev.specialNeeds.includes(id)
        ? prev.specialNeeds.filter((n) => n !== id)
        : [...prev.specialNeeds, id],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('nexora_requester_profile', JSON.stringify(profile));
      sessionStorage.setItem('nexora_name', profile.name);
      sessionStorage.setItem('nexora_email', profile.email);
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Requester Profile & Coordination Info
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Keep your contact details, emergency coordinates, and household special needs up to date for faster AI triage dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-xs text-zinc-200 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Citizen
          </span>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300 text-sm font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Profile and emergency coordination information saved successfully!</span>
          </div>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)] flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-400" />
            Personal & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Full Legal Name
              </label>
              <Input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="e.g. Sagar Kharbikar"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Primary Phone Number (for Volunteer Calls)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <Input
                  type="tel"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="pl-10 font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address (for Status Receipts)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <Input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="user@nexoralink.org"
                  className="pl-10 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Primary Address & Location */}
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-zinc-400" />
            Primary Residence & Default Landmark
          </h2>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Default Residential Address / Landmark
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <Input
                type="text"
                required
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Flat / House No, Street, Landmark, Ward / Sector"
                className="pl-10"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">
              Pre-populates new aid requests when requesting from your home address.
            </p>
          </div>
        </div>

        {/* Section 3: Household Special Needs & Accessibility */}
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-400" />
              Household Special Needs & Medical Flags
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">Auto-passed to AI Triage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NEED_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = profile.specialNeeds.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleNeed(opt.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-white/10 border-white text-white font-semibold'
                      : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white text-black' : 'bg-white/[0.06] text-zinc-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Access Instructions or Medical Constraints
            </label>
            <Textarea
              rows={3}
              value={profile.notes}
              onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
              placeholder="e.g. Needs elevator access, gate passcode, power backup availability..."
            />
          </div>
        </div>

        {/* Section 4: Emergency Contacts */}
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)] flex items-center gap-2">
            <Heart className="w-4 h-4 text-zinc-400" />
            Emergency Secondary Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Contact Person Name & Relationship
              </label>
              <Input
                type="text"
                value={profile.emergencyContactName}
                onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                placeholder="e.g. Anil Kharbikar (Father)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Emergency Contact Phone
              </label>
              <Input
                type="tel"
                value={profile.emergencyContactPhone}
                onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                placeholder="+91 98000 00000"
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" size="lg" className="px-8 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
