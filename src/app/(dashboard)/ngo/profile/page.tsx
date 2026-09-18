'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Building2,
  ShieldCheck,
  Check,
  MapPin,
  Truck,
  Warehouse,
} from 'lucide-react';

export default function NGOProfilePage() {
  const [orgName, setOrgName] = useState('Red Cross Humanitarian Logistics Hub');
  const [regId, setRegId] = useState('NGO-MH-2021-8902');
  const [contactEmail, setContactEmail] = useState('dispatch@redcross-metro.org');
  const [phone, setPhone] = useState('+91 712 255 4910');
  const [warehouseAddress, setWarehouseAddress] = useState('Plot 14, Central Logistics Park, Hingna Road, Nagpur');
  const [storageCapacity, setStorageCapacity] = useState('12,000 sq ft (Cold Chain Ready)');
  const [saved, setSaved] = useState(false);

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
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Organization & Warehouse Profile
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Verify official NGO credentials, register relief warehouses, and manage logistics dispatch permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-white text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#2EEA8D]" />
            <span>Verified NGO Partner</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Information */}
        <div className="bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)] pb-2 border-b border-white/10">
            Organization Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Registered Organization Name
              </label>
              <Input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Official Registration / NGO DARPAN ID
              </label>
              <Input
                type="text"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Emergency Dispatch Email
              </label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Control Room Phone Hotline
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Warehouse & Storage Logistics */}
        <div className="bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)] pb-2 border-b border-white/10">
            Warehouse Staging & Fleet Infrastructure
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Primary Supply Depot Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <Input
                  type="text"
                  value={warehouseAddress}
                  onChange={(e) => setWarehouseAddress(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Storage Facility Details
                </label>
                <div className="relative">
                  <Warehouse className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <Input
                    type="text"
                    value={storageCapacity}
                    onChange={(e) => setStorageCapacity(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Transport Fleet Capacity
                </label>
                <div className="relative">
                  <Truck className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <Input
                    type="text"
                    defaultValue="4 Relief Vans + 2 Heavy Trucks"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-bold text-[#2EEA8D] flex items-center gap-1.5 font-mono">
              <Check className="w-4 h-4" /> Organization settings saved successfully!
            </span>
          ) : (
            <span />
          )}

          <Button type="submit" variant="primary" size="lg">
            Update NGO Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
