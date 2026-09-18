'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Package,
  Plus,
  AlertTriangle,
  Shield,
  X,
  Search,
} from 'lucide-react';

interface ResourceItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
  allocated: number;
  location: string;
}

const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'RES-101',
    name: 'Emergency Food Ration Packs',
    category: 'Food & Nutrition',
    quantity: 65,
    unit: 'packs',
    threshold: 30,
    allocated: 20,
    location: 'Warehouse Bay A-2',
  },
  {
    id: 'RES-102',
    name: 'Insulin Cold-Storage Ampoules',
    category: 'Medical Supplies',
    quantity: 8,
    unit: 'vials',
    threshold: 15,
    allocated: 6,
    location: 'Refrigerated Depot 1',
  },
  {
    id: 'RES-103',
    name: 'Clean Drinking Water Cans (20L)',
    category: 'Water & Sanitation',
    quantity: 120,
    unit: 'cans',
    threshold: 50,
    allocated: 45,
    location: 'Hydration Staging Yard',
  },
  {
    id: 'RES-104',
    name: 'Thermal Blankets & Tarpaulins',
    category: 'Emergency Shelter',
    quantity: 42,
    unit: 'sets',
    threshold: 25,
    allocated: 18,
    location: 'Shelter Hub B',
  },
  {
    id: 'RES-105',
    name: 'Portable Oxygen Concentrators',
    category: 'Medical Supplies',
    quantity: 4,
    unit: 'units',
    threshold: 6,
    allocated: 3,
    location: 'Bio-Medical Locker',
  },
];

export default function NGOResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Food & Nutrition');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('packs');
  const [newThreshold, setNewThreshold] = useState('10');

  const handleAdjustStock = (id: string, delta: number) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, quantity: Math.max(0, r.quantity + delta) } : r))
    );
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newQty) return;

    const newItem: ResourceItem = {
      id: `RES-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      category: newCat,
      quantity: Number(newQty),
      unit: newUnit,
      threshold: Number(newThreshold) || 10,
      allocated: 0,
      location: 'Central Depot',
    };

    setResources([newItem, ...resources]);
    setShowAddModal(false);
    setNewName('');
    setNewQty('');
  };

  const filtered = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = resources.filter((r) => r.quantity <= r.threshold).length;
  const totalStockCount = resources.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
              Resource Inventory & Stock Mesh
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Manage physical supplies, set replenishment thresholds, and feed real-time stock into AI dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/ngo/dashboard">
            <Button variant="secondary" size="md">
              <Shield className="w-4 h-4 text-zinc-300" />
              Command Center
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddModal(true)}
            className="shadow-[0_0_18px_rgba(255,255,255,0.25)]"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Critical Gap Alert */}
      {lowStockCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-md">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
              Supply Shortage Alert ({lowStockCount} items below threshold)
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
              Insulin packs & oxygen concentrators are running low in your coverage corridor. Re-order or reallocate from partner hubs.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Total Units Stocked
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {totalStockCount}
          </div>
          <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Across 5 categories</div>
        </div>

        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Active Allocations
          </div>
          <div className="text-2xl font-bold text-[#2EEA8D] font-mono mt-1">
            92 units
          </div>
          <div className="text-[11px] text-[#2EEA8D]/80 font-medium mt-0.5">Dispatched to missions</div>
        </div>

        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Deficit / Low Stock
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {lowStockCount} items
          </div>
          <div className="text-[11px] text-amber-400/80 font-medium mt-0.5">Requires restock</div>
        </div>

        <div className="bg-[#0D0D12] p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Depot Facilities
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            3 Facilities
          </div>
          <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Central & North Depots</div>
        </div>
      </div>

      {/* Inventory Search & Table */}
      <div className="bg-[#0D0D12] rounded-2xl border border-white/10 shadow-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <h2 className="text-lg font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
            Active Inventory Items
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search resource by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((item) => {
            const isLow = item.quantity <= item.threshold;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isLow ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 bg-black/40 hover:bg-black/60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{item.name}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
                        {item.id}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2 font-mono text-[11px]">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                  <div className="text-right">
                    <div className="font-mono font-bold text-base text-white flex items-center gap-1.5">
                      <span>{item.quantity}</span>
                      <span className="text-xs font-normal text-zinc-400">{item.unit}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Threshold: {item.threshold} {item.unit}
                    </div>
                  </div>

                  {/* Stock Adjuster */}
                  <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => handleAdjustStock(item.id, -1)}
                      className="w-7 h-7 rounded bg-black/60 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center transition-colors"
                      title="Decrement Stock"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleAdjustStock(item.id, 1)}
                      className="w-7 h-7 rounded bg-black/60 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center transition-colors"
                      title="Increment Stock"
                    >
                      +
                    </button>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isLow ? (
                      <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 font-mono">
                        LOW STOCK
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#2EEA8D] bg-[#2EEA8D]/15 px-3 py-1 rounded-full border border-[#2EEA8D]/30 font-mono">
                        STOCKED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0D12] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-base text-white font-[family-name:var(--font-plus-jakarta)]">
                Add Inventory Resource
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Resource Name
                </label>
                <Input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Pediatric ORS Electrolyte Packs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full bg-[#08080B] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                >
                  <option>Food & Nutrition</option>
                  <option>Medical Supplies</option>
                  <option>Water & Sanitation</option>
                  <option>Emergency Shelter</option>
                  <option>Logistics & Equipment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Initial Quantity
                  </label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Unit
                  </label>
                  <Input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="boxes / cans / kits"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Low Stock Alert Threshold
                </label>
                <Input
                  type="number"
                  required
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder="15"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save to Inventory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
