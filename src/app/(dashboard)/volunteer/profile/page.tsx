'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  User,
  ShieldCheck,
  Check,
  Plus,
} from 'lucide-react';

const AVAILABLE_SKILLS = [
  'First Aid / CPR Certified',
  'Emergency Vehicle Driver',
  'Medical / Nursing Staff',
  'Search & Rescue Training',
  'Disaster Relief Food Logistics',
  'Multilingual Translation',
  'Elderly Care Assistance',
  'Flood Water Operations',
];

export default function VolunteerProfilePage() {
  const [name, setName] = useState('Dr. Rahul Sharma');
  const [phone, setPhone] = useState('+91 98230 44120');
  const [city, setCity] = useState('Nagpur Metropolitan');
  const [radiusKm, setRadiusKm] = useState(5);
  const [vehicleType, setVehicleType] = useState('SUV / 4x4');
  const [activeSkills, setActiveSkills] = useState<string[]>([
    'First Aid / CPR Certified',
    'Emergency Vehicle Driver',
    'Medical / Nursing Staff',
    'Elderly Care Assistance',
  ]);
  const [saved, setSaved] = useState(false);

  const toggleSkill = (skill: string) => {
    if (activeSkills.includes(skill)) {
      setActiveSkills(activeSkills.filter((s) => s !== skill));
    } else {
      setActiveSkills([...activeSkills, skill]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-[#2EEA8D] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Volunteer Profile & Verified Credentials
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Our AI matcher uses your verified certifications and radius to calculate match relevance scores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2EEA8D]/15 border border-[#2EEA8D]/30 text-[#2EEA8D] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#2EEA8D]" />
            <span>ID Verified Responder</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)] pb-2 border-b border-white/10">
            Personal & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Primary Phone (for urgent dispatch)
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Base City / Area
              </label>
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Vehicle Access
              </label>
              <Input
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="e.g. Motorcycle, Sedan, Pickup Van"
              />
            </div>
          </div>
        </div>

        {/* Dispatch Radius */}
        <div className="bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
                Dispatch Response Radius
              </h3>
              <p className="text-xs text-zinc-400">
                Maximum distance you are willing to travel for critical community missions
              </p>
            </div>
            <span className="font-mono font-bold text-lg text-white bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
              {radiusKm} km
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
            <span>1 km (Hyperlocal)</span>
            <span>10 km</span>
            <span>25 km (Regional Response)</span>
          </div>
        </div>

        {/* Skills & AI Matching Tags */}
        <div className="bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <div>
            <h3 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Verified Skills & Capabilities
            </h3>
            <p className="text-xs text-zinc-400">
              Select all skills that apply. The AI matching algorithm scores requests against these tags.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {AVAILABLE_SKILLS.map((skill) => {
              const selected = activeSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                    selected
                      ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)] font-bold'
                      : 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
                  }`}
                >
                  {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-bold text-[#2EEA8D] flex items-center gap-1.5 font-mono">
              <Check className="w-4 h-4" /> Profile credentials updated successfully!
            </span>
          ) : (
            <span />
          )}

          <Button type="submit" variant="primary" size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
