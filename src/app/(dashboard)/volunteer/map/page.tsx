'use client';

import { useEffect, useState, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import type LeafletType from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  MapPin,
  Compass,
  Phone,
  Clock,
  Gauge,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RequesterTarget {
  id: string;
  name: string;
  phone: string;
  category: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  address: string;
  lat: number;
  lng: number;
  itemsNeeded: string[];
}

interface RouteStep {
  instruction: string;
  distance: string;
  icon: 'straight' | 'right' | 'left' | 'destination';
}

const DEFAULT_REQUESTERS: RequesterTarget[] = [
  {
    id: 'REQ-4091',
    name: 'Sagar Kharbikar',
    phone: '+91 98230 11492',
    category: 'Medical Transport',
    urgency: 'CRITICAL',
    address: 'Flat 302, Green Valley Apts, Sector 4',
    lat: 21.1585,
    lng: 79.098,
    itemsNeeded: ['Cold-chain Insulin transport', 'Mobility Van'],
  },
  {
    id: 'REQ-3820',
    name: 'Pooja Sharma',
    phone: '+91 98211 44582',
    category: 'Food & Potable Water',
    urgency: 'HIGH',
    address: 'Near Old Water Reservoir, Dhantoli',
    lat: 21.134,
    lng: 79.082,
    itemsNeeded: ['20L Drinking Water', 'Dry Ration Pack x4'],
  },
  {
    id: 'REQ-2941',
    name: 'Ramesh Verma',
    phone: '+91 97654 33210',
    category: 'Elderly Evacuation',
    urgency: 'HIGH',
    address: 'House 14, Wardha Road By-pass, Laxmi Nagar',
    lat: 21.121,
    lng: 79.068,
    itemsNeeded: ['Wheelchair Transfer', 'Basic First Aid Kit'],
  },
  {
    id: 'REQ-5102',
    name: 'Sunita Patil',
    phone: '+91 98224 88319',
    category: 'Sanitation & Baby Care',
    urgency: 'MEDIUM',
    address: 'Block C, Sitabuldi Commercial Lane',
    lat: 21.146,
    lng: 79.089,
    itemsNeeded: ['Baby Formula Pack', 'Sterile Wipes', 'Diapers'],
  },
];

// Haversine direct distance calculation in KM
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

const emptySubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function VolunteerMapPage() {
  const mounted = useMounted();
  const [L, setL] = useState<typeof LeafletType | null>(null);

  // Volunteer's position (defaults to Nagpur Command Center coordinates)
  const [volunteerCoords, setVolunteerCoords] = useState<[number, number]>([21.1458, 79.0882]);
  const [locating, setLocating] = useState(false);
  const [requesters, setRequesters] = useState<RequesterTarget[]>(DEFAULT_REQUESTERS);
  const [selectedRequester, setSelectedRequester] = useState<RequesterTarget>(DEFAULT_REQUESTERS[0]);

  // Routing metrics
  const [routeType, setRouteType] = useState<'fastest' | 'alternate'>('fastest');
  const [distanceKm, setDistanceKm] = useState<number>(2.4);
  const [etaMinutes, setEtaMinutes] = useState<number>(6);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [turnInstructions, setTurnInstructions] = useState<RouteStep[]>([]);

  // Turn-by-turn Navigation Simulation
  const [isNavigating, setIsNavigating] = useState(false);
  const [navStepIndex, setNavStepIndex] = useState(0);
  const [simulatedVehicleCoords, setSimulatedVehicleCoords] = useState<[number, number] | null>(null);
  const [emergencySiren, setEmergencySiren] = useState(false);

  // Map references
  const mapRef = useRef<LeafletType.Map | null>(null);
  const routePolylineRef = useRef<LeafletType.Polyline | null>(null);
  const altPolylineRef = useRef<LeafletType.Polyline | null>(null);
  const volunteerMarkerRef = useRef<LeafletType.Marker | null>(null);
  const destinationMarkerRef = useRef<LeafletType.Marker | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Dynamic hydration: Pull newly created requests from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('nexora_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: RequesterTarget[] = parsed.map((item: any, idx: number) => ({
            id: item.id || `REQ-NEW-${idx}`,
            name: item.name || 'Emergency Requester',
            phone: item.phone || '+91 98230 00000',
            category: item.category || 'Disaster Relief',
            urgency: item.urgency || 'HIGH',
            address: item.address || 'Nagpur Urban Ward',
            lat: item.lat ? Number(item.lat) : 21.1458 + (idx + 1) * 0.008,
            lng: item.lng ? Number(item.lng) : 79.0882 + (idx + 1) * 0.006,
            itemsNeeded: item.itemsNeeded || ['Emergency Provisions'],
          }));

          setRequesters((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const fresh = mapped.filter((m) => !existingIds.has(m.id));
            return [...fresh, ...prev];
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 2. Load Leaflet library dynamically on client
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // 3. Obtain real live GPS geolocation if granted
  const detectLiveLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setVolunteerCoords(coords);
        setLocating(false);
        if (mapRef.current) {
          mapRef.current.flyTo(coords, 14, { duration: 1.2 });
        }
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // 4. Calculate route and generate road steps (with OSRM road coordinates)
  useEffect(() => {
    if (!selectedRequester) return;

    const startLat = volunteerCoords[0];
    const startLng = volunteerCoords[1];
    const endLat = selectedRequester.lat;
    const endLng = selectedRequester.lng;

    const directDist = calculateDistanceKm(startLat, startLng, endLat, endLng);
    // Real road factor: 1.35x direct straight distance
    const roadDist = Number((directDist * 1.35).toFixed(1));
    const calculatedMinutes = Math.max(3, Math.round((roadDist / 35) * 60)); // ~35 km/h urban speed

    setDistanceKm(roadDist);
    setEtaMinutes(calculatedMinutes);

    // Fetch realistic road route via OSRM open routing API
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
          const rawCoords = data.routes[0].geometry.coordinates;
          const latLngs: [number, number][] = rawCoords.map((pt: [number, number]) => [pt[1], pt[0]]);
          setRouteCoordinates(latLngs);

          const durationMin = Math.round(data.routes[0].duration / 60);
          const distanceValKm = Number((data.routes[0].distance / 1000).toFixed(1));
          setEtaMinutes(durationMin || calculatedMinutes);
          setDistanceKm(distanceValKm || roadDist);

          // Extract steps
          if (data.routes[0].legs?.[0]?.steps) {
            const steps = data.routes[0].legs[0].steps.slice(0, 5).map((st: any, i: number) => {
              let iconType: 'straight' | 'right' | 'left' | 'destination' = 'straight';
              const modifier = st.maneuver?.modifier || '';
              if (modifier.includes('right')) iconType = 'right';
              else if (modifier.includes('left')) iconType = 'left';
              if (i === data.routes[0].legs[0].steps.length - 1) iconType = 'destination';

              return {
                instruction: st.maneuver?.instruction || `Proceed on ${st.name || 'Main Route'}`,
                distance: `${Math.round(st.distance)}m`,
                icon: iconType,
              };
            });
            setTurnInstructions(steps);
          }
        } else {
          generateInterpolatedRoute();
        }
      })
      .catch(() => {
        generateInterpolatedRoute();
      });

    function generateInterpolatedRoute() {
      // Fallback realistic road curve interpolation
      const steps = 20;
      const pts: [number, number][] = [];
      const midLat = (startLat + endLat) / 2 + 0.003;
      const midLng = (startLng + endLng) / 2 - 0.002;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Quadratic bezier to simulate street curves
        const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * midLat + t * t * endLat;
        const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * midLng + t * t * endLng;
        pts.push([lat, lng]);
      }
      setRouteCoordinates(pts);
      setTurnInstructions([
        { instruction: 'Depart from Current Responder Staging Area', distance: '250m', icon: 'straight' },
        { instruction: 'Turn right onto North Corridor Arterial', distance: '1.2 km', icon: 'right' },
        { instruction: 'Merge onto Expressway Overpass (Priority Lane)', distance: '850m', icon: 'straight' },
        { instruction: `Arrive at destination: ${selectedRequester.address}`, distance: '100m', icon: 'destination' },
      ]);
    }
  }, [selectedRequester, volunteerCoords]);

  // 5. Initialize & manage Leaflet Map canvas
  useEffect(() => {
    if (!L) return;

    const container = document.getElementById('volunteer-leaflet-map');
    if (!container) return;

    const el = container as HTMLElement & { _leaflet_id?: number };
    if (el._leaflet_id) return;

    const map = L.map('volunteer-leaflet-map', {
      center: volunteerCoords,
      zoom: 13,
      zoomControl: false,
    });

    mapRef.current = map;

    // CartoDB Dark Matter base layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [L]);

  // 6. Update Markers & Fast Road Polyline whenever routeCoordinates change
  useEffect(() => {
    if (!L || !mapRef.current) return;
    const map = mapRef.current;

    // Remove previous markers & polylines
    if (volunteerMarkerRef.current) map.removeLayer(volunteerMarkerRef.current);
    if (destinationMarkerRef.current) map.removeLayer(destinationMarkerRef.current);
    if (routePolylineRef.current) map.removeLayer(routePolylineRef.current);
    if (altPolylineRef.current) map.removeLayer(altPolylineRef.current);

    const curVehiclePos = simulatedVehicleCoords || volunteerCoords;

    // 1. Volunteer Responder Marker (Glowing Blue Beacon)
    const volunteerIcon = L.divIcon({
      className: 'custom-volunteer-beacon',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            background: rgba(59, 130, 246, 0.35);
            border-radius: 50%;
            animation: pulse 1.8s infinite;
          "></div>
          <div style="
            width: 22px;
            height: 22px;
            background: #2563EB;
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 16px rgba(59, 130, 246, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 800;
          ">
            ▲
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    volunteerMarkerRef.current = L.marker(curVehiclePos, { icon: volunteerIcon })
      .bindTooltip('<b>You (Responder)</b><br>Priority Dispatch Vehicle', {
        permanent: false,
        direction: 'top',
        className: 'bg-black text-white px-2 py-1 rounded text-xs border border-white/20',
      })
      .addTo(map);

    // 2. Requester Target Destination Marker (Glowing Red/Amber Beacon)
    const isCritical = selectedRequester.urgency === 'CRITICAL';
    const pinColor = isCritical ? '#EF4444' : '#F59E0B';

    const targetIcon = L.divIcon({
      className: 'custom-target-beacon',
      html: `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 36px;
            height: 36px;
            background: ${isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'};
            border-radius: 50%;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            width: 26px;
            height: 26px;
            background: ${pinColor};
            border: 2px solid #000000;
            border-radius: 50%;
            box-shadow: 0 0 18px ${pinColor};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: 900;
            font-size: 12px;
          ">
            ★
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    destinationMarkerRef.current = L.marker([selectedRequester.lat, selectedRequester.lng], { icon: targetIcon })
      .bindTooltip(`<b>${selectedRequester.name}</b><br>${selectedRequester.category} • ${distanceKm} km`, {
        permanent: true,
        direction: 'top',
        className: 'bg-zinc-900 text-white px-2.5 py-1 rounded-md text-xs border border-white/20 font-sans shadow-lg',
      })
      .addTo(map);

    // 3. Draw Route Polyline (Google Maps fast route styling)
    if (routeCoordinates.length > 1) {
      // Primary route (Fastest)
      routePolylineRef.current = L.polyline(routeCoordinates, {
        color: routeType === 'fastest' ? '#38BDF8' : '#71717A',
        weight: routeType === 'fastest' ? 6 : 4,
        opacity: routeType === 'fastest' ? 0.95 : 0.6,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Fit bounds to show entire route with breathing room
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [L, routeCoordinates, selectedRequester, simulatedVehicleCoords, routeType, volunteerCoords, distanceKm]);

  // 7. Navigation Simulation (Moves vehicle along route coordinates)
  const toggleNavigationSimulation = () => {
    if (isNavigating) {
      // Pause
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      setIsNavigating(false);
    } else {
      if (routeCoordinates.length < 2) return;
      setIsNavigating(true);

      let currentIdx = navStepIndex;
      simulationTimerRef.current = setInterval(() => {
        currentIdx += 1;
        if (currentIdx >= routeCoordinates.length) {
          if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
          setIsNavigating(false);
          setNavStepIndex(0);
          setSimulatedVehicleCoords(null);
          alert(`🏁 You have arrived at ${selectedRequester.name}'s location! Emergency dispatch handover complete.`);
          return;
        }

        setNavStepIndex(currentIdx);
        const nextPt = routeCoordinates[currentIdx];
        setSimulatedVehicleCoords(nextPt);

        // Smoothly pan map to follow vehicle
        if (mapRef.current) {
          mapRef.current.panTo(nextPt, { animate: true, duration: 0.5 });
        }

        // Recalculate remaining distance
        const remainingSteps = routeCoordinates.length - currentIdx;
        const progressFrac = remainingSteps / routeCoordinates.length;
        setDistanceKm(Number((distanceKm * progressFrac).toFixed(1)));
        setEtaMinutes(Math.max(1, Math.round(etaMinutes * progressFrac)));
      }, 700);
    }
  };

  const resetNavigation = () => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setIsNavigating(false);
    setNavStepIndex(0);
    setSimulatedVehicleCoords(null);
    if (mapRef.current && L && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const nextManeuver = turnInstructions[0] || {
    instruction: 'Continue straight onto Main Highway',
    distance: '400m',
    icon: 'straight',
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#08080B] text-white overflow-hidden select-none">
      {/* Top Floating Turn-by-Turn Navigation HUD (Google Maps Style) */}
      <div className="bg-[#121217]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 shadow-xl">
        <div className="flex items-center gap-3">
          {/* Turn Direction Icon Box */}
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(16,185,129,0.5)] shrink-0">
            {nextManeuver.icon === 'right' && <CornerUpRight className="w-6 h-6 stroke-[2.5]" />}
            {nextManeuver.icon === 'left' && <CornerUpLeft className="w-6 h-6 stroke-[2.5]" />}
            {nextManeuver.icon === 'destination' && <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />}
            {nextManeuver.icon === 'straight' && <ArrowUp className="w-6 h-6 stroke-[2.5]" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                IN {nextManeuver.distance}
              </span>
              <span className="text-xs text-zinc-400 font-medium">Fastest Corridor • Wardha By-pass</span>
            </div>
            <h2 className="text-sm md:text-base font-bold text-white tracking-tight mt-0.5 truncate max-w-[280px] sm:max-w-md">
              {nextManeuver.instruction}
            </h2>
          </div>
        </div>

        {/* Live Distance, ETA & Navigation Controls */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Fastest Route ETA</div>
            <div className="text-xl font-extrabold text-white font-mono tracking-tight flex items-center justify-end gap-1.5">
              <span>{etaMinutes} min</span>
              <span className="text-xs text-zinc-500 font-sans">({distanceKm} km)</span>
            </div>
          </div>

          {/* Emergency Priority Siren Mode */}
          <button
            onClick={() => setEmergencySiren(!emergencySiren)}
            title="Emergency Priority Transit Mode"
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              emergencySiren
                ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden md:inline">{emergencySiren ? 'PRIORITY DISPATCH' : 'Siren Mode'}</span>
          </button>

          {/* Start/Stop Real Turn Navigation Simulation */}
          <Button
            onClick={toggleNavigationSimulation}
            className={`h-10 px-4 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${
              isNavigating
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isNavigating ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Drive</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Navigation</span>
              </>
            )}
          </Button>

          {isNavigating && (
            <button
              onClick={resetNavigation}
              title="Reset Route"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 border border-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Interactive Map + Mission Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left Side: Leaflet OpenStreetMap View */}
        <div className="flex-1 relative h-full w-full bg-[#0d0d12]">
          {/* Leaflet DOM container */}
          <div id="volunteer-leaflet-map" className="w-full h-full min-h-[400px] z-0" />

          {/* Map Overlay Controls (Locate Me + Layer Switcher) */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              onClick={detectLiveLocation}
              disabled={locating}
              title="Locate Volunteer Responder GPS"
              className="p-3 rounded-xl bg-[#121217]/90 backdrop-blur-md border border-white/15 text-white hover:bg-white/20 transition-all shadow-xl flex items-center gap-2 text-xs font-semibold"
            >
              <Compass className={`w-4 h-4 text-blue-400 ${locating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{locating ? 'Locating GPS...' : 'My Location'}</span>
            </button>
          </div>

          {/* Bottom Floating Route Selector (Google Maps fastest round way selector) */}
          <div className="absolute bottom-6 left-4 right-4 md:left-6 md:right-auto z-10 max-w-lg bg-[#121217]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Fastest Route Calculation</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                LIVE TRAFFIC: CLEAR
              </span>
            </div>

            {/* Fast route pills */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setRouteType('fastest')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  routeType === 'fastest'
                    ? 'bg-blue-600/20 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                    : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold text-blue-300 flex items-center justify-between">
                  <span>Fastest Route</span>
                  <span className="text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded text-white font-mono">
                    {etaMinutes} min
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300 font-medium mt-0.5">Via Central Expressway</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{distanceKm} km • Minimal Signals</div>
              </button>

              <button
                onClick={() => setRouteType('alternate')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  routeType === 'alternate'
                    ? 'bg-blue-600/20 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                    : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Alternate Detour</span>
                  <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                    {etaMinutes + 4} min
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Via North Ring Road</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  {(distanceKm + 1.6).toFixed(1)} km • Moderate Traffic
                </div>
              </button>
            </div>

            {/* Direct Google Maps Dispatch Link */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
              <span className="text-zinc-400 truncate">
                Target: <b className="text-white">{selectedRequester.name}</b>
              </span>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${volunteerCoords[0]},${volunteerCoords[1]}&destination=${selectedRequester.lat},${selectedRequester.lng}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold shrink-0"
              >
                <span>Google Maps App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Requesters Queue & Mission Target Selector */}
        <div className="w-full lg:w-96 bg-[#0c0c10] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col shrink-0 h-auto lg:h-full overflow-y-auto">
          <div className="p-4 border-b border-white/10 bg-[#121217]/50 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white font-[family-name:var(--font-plus-jakarta)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  Nearby Requester Missions
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Real-time distance & fastest road route calculated automatically
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/15 font-mono">
                {requesters.length} Active
              </span>
            </div>
          </div>

          {/* Active Target Banner */}
          <div className="p-4 bg-gradient-to-b from-white/[0.05] to-transparent border-b border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
              CURRENT DISPATCH MISSION
            </div>
            <div className="bg-[#14141c] border border-white/15 rounded-xl p-3.5 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {selectedRequester.name}
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        selectedRequester.urgency === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {selectedRequester.urgency}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{selectedRequester.category}</div>
                </div>
                <a
                  href={`tel:${selectedRequester.phone}`}
                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  title="Call Requester"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="text-[11px] text-zinc-400 mt-2 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{selectedRequester.address}</span>
              </div>

              {/* Items needed pill tags */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {selectedRequester.itemsNeeded.map((it, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/10"
                  >
                    {it}
                  </span>
                ))}
              </div>

              {/* ETA Bar */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>ETA: <b>{etaMinutes} min</b></span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Distance: <b>{distanceKm} km</b></span>
                </div>
              </div>
            </div>
          </div>

          {/* Requesters Selection List */}
          <div className="p-4 space-y-2.5 flex-1">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              SELECT TARGET TO ROUTE
            </div>
            {requesters.map((req) => {
              const isSelected = selectedRequester.id === req.id;
              const directDist = calculateDistanceKm(
                volunteerCoords[0],
                volunteerCoords[1],
                req.lat,
                req.lng
              );
              const estKm = Number((directDist * 1.35).toFixed(1));
              const estMins = Math.max(3, Math.round((estKm / 35) * 60));

              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequester(req);
                    resetNavigation();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.08] border-white text-white shadow-lg'
                      : 'bg-[#121217] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <span>{req.name}</span>
                        <span
                          className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${
                            req.urgency === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">{req.category}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-white">{estMins} min</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{estKm} km</div>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-zinc-400 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{req.address}</span>
                    <span className="text-blue-400 flex items-center gap-0.5 font-semibold shrink-0">
                      Route <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Turn-by-turn preview list in sidebar */}
          <div className="p-4 border-t border-white/10 bg-[#08080B]">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 flex items-center justify-between">
              <span>TURN-BY-TURN GUIDANCE</span>
              <span className="font-mono text-zinc-400">{turnInstructions.length} maneuvers</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {turnInstructions.map((st, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 p-2 rounded-lg text-xs ${
                    i === 0 ? 'bg-white/[0.06] text-white font-semibold' : 'text-zinc-400'
                  }`}
                >
                  <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-zinc-300">
                    {st.icon === 'right' && <CornerUpRight className="w-3.5 h-3.5" />}
                    {st.icon === 'left' && <CornerUpLeft className="w-3.5 h-3.5" />}
                    {st.icon === 'destination' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {st.icon === 'straight' && <ArrowUp className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{st.instruction}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{st.distance}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
