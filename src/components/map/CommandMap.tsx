'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type LeafletType from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

export interface IncidentPin {
  id: string;
  title: string;
  category: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  lat: number;
  lng: number;
  assignedTo?: string;
}

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const INCIDENTS: IncidentPin[] = [
  {
    id: 'PIN-1',
    title: 'Emergency Dialysis Transport',
    category: 'Medical',
    urgency: 'CRITICAL',
    lat: 21.1458,
    lng: 79.0882,
    assignedTo: 'Dr. Rahul Sharma',
  },
  {
    id: 'PIN-2',
    title: 'Food Supply for Stranded Family',
    category: 'Ration',
    urgency: 'HIGH',
    lat: 21.152,
    lng: 79.095,
  },
  {
    id: 'PIN-3',
    title: 'Insulin Cold Chain Request',
    category: 'Medical',
    urgency: 'CRITICAL',
    lat: 21.139,
    lng: 79.075,
    assignedTo: 'Volunteer Priority Unit',
  },
  {
    id: 'PIN-4',
    title: 'Flood Barrier Sandbag Placement',
    category: 'Shelter',
    urgency: 'MEDIUM',
    lat: 21.16,
    lng: 79.082,
  },
];

// Inner Leaflet Map Component loaded with CartoDB Dark Matter
function LeafletMapInner({ onSelectPin }: { onSelectPin: (pin: IncidentPin) => void }) {
  const [L, setL] = useState<typeof LeafletType | null>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  useEffect(() => {
    if (!L) return;

    const container = document.getElementById('leaflet-command-map');
    if (!container) return;

    const el = container as HTMLElement & { _leaflet_id?: number };
    if (el._leaflet_id) {
      return;
    }

    const map = L.map('leaflet-command-map', {
      center: [21.1458, 79.0882],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // CartoDB Dark Matter basemap for seamless dark command center integration
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    INCIDENTS.forEach((pin) => {
      const isCritical = pin.urgency === 'CRITICAL';
      const isHigh = pin.urgency === 'HIGH';
      const color = isCritical ? '#EF4444' : isHigh ? '#F59E0B' : '#FFFFFF';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            background: ${color};
            border: 2px solid #000;
            border-radius: 50%;
            box-shadow: 0 0 14px ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="width: 7px; height: 7px; background: #000; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onSelectPin(pin);
      });

      marker.bindTooltip(
        `<div style="background: #121217; color: #fff; font-family: monospace; font-size: 11px; padding: 4px 6px; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px;">
          ${pin.urgency}: ${pin.title}
        </div>`,
        { direction: 'top', offset: [0, -10], opacity: 0.95 }
      );
    });

    return () => {
      map.remove();
    };
  }, [L, onSelectPin]);

  return (
    <div id="leaflet-command-map" className="w-full h-full min-h-[380px] rounded-2xl z-0" />
  );
}

export function CommandMap() {
  const [selectedPin, setSelectedPin] = useState<IncidentPin | null>(INCIDENTS[0]);
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-[380px] bg-[#0A0A0E] animate-pulse rounded-2xl border border-white/10" />;
  }

  return (
    <div className="bg-[#0D0D12] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Map Control Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0D0D12]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/15 text-white flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white font-[family-name:var(--font-plus-jakarta)]">
              Geospatial Operations Map
            </h3>
            <p className="text-xs text-zinc-400">
              Live OpenStreetMap CartoDB Dark Matter tiles with AI incident coordinates
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold font-mono">
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            <span>Critical (2)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span>High (1)</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span>Standard (1)</span>
          </div>
        </div>
      </div>

      {/* Map Body & Pin Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 relative h-[380px] bg-black">
          {mounted ? (
            <LeafletMapInner onSelectPin={(pin) => setSelectedPin(pin)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
              Initializing Leaflet Coordinate Engine...
            </div>
          )}
        </div>

        {/* Selected Pin Details Panel */}
        <div className="p-5 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between bg-black/40">
          {selectedPin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-0.5 rounded border border-white/15">
                  {selectedPin.id}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                    selectedPin.urgency === 'CRITICAL'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : selectedPin.urgency === 'HIGH'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-white/10 text-white border-white/20'
                  }`}
                >
                  {selectedPin.urgency}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                  {selectedPin.category} Aid Mission
                </span>
                <h4 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)] mt-0.5">
                  {selectedPin.title}
                </h4>
              </div>

              <div className="p-3 bg-[#08080B] rounded-xl border border-white/10 space-y-2 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-mono text-[11px]">COORDINATES:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedPin.lat.toFixed(4)}, {selectedPin.lng.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-mono text-[11px]">ASSIGNED UNIT:</span>
                  <span className="font-semibold text-[#2EEA8D]">
                    {selectedPin.assignedTo || 'Unassigned (Pending)'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 text-center my-auto">
              Click any map pin to view real-time incident telemetry
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-white/10">
            <button
              type="button"
              className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-full shadow-[0_0_16px_rgba(255,255,255,0.25)] transition-all text-center"
            >
              Broadcast Alert to Sector Responders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
