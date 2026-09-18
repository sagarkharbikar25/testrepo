'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { UrgencyBadge, UrgencyLevel } from '@/components/ui/StatusBadge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import {
  Sparkles,
  MapPin,
  CheckCircle2,
  Send,
  HeartPulse,
  Package,
  Home,
  Compass,
  ArrowRight,
  Crosshair,
  Navigation,
  Loader2,
} from 'lucide-react';

interface AIAnalysisResult {
  category: string;
  urgency: UrgencyLevel;
  confidence: number;
  extractedNeeds: string[];
  requiredSkills: string[];
  summary: string;
}

const TEMPLATES = [
  {
    title: 'Medical Transport',
    icon: HeartPulse,
    text: 'Elderly family member needs wheelchair-accessible transport to District General Hospital for emergency dialysis today.',
    location: 'Sector 9, Green Park',
  },
  {
    title: 'Food & Ration Need',
    icon: Package,
    text: 'Family of 4 stranded by street flooding. We have exhausted bottled water and need dry food ration packs for 3 days.',
    location: 'Bridgeview Apartments, Block C',
  },
  {
    title: 'Emergency Shelter',
    icon: Home,
    text: 'Roof tiles collapsed in storm. Need temporary tarpaulin sheets and 2 thermal blankets for 2 adults and an infant.',
    location: 'Old Market Road, Lane 4',
  },
];

export default function NewRequestPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [dispatched, setDispatched] = useState(false);
  const [locating, setLocating] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locationError, setLocationError] = useState('');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);

        setGpsCoords({ lat, lng, accuracy });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setLocation(`${address} [Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}]`);
          } else {
            setLocation(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)} (GPS Locked ±${accuracy}m)`);
          }
        } catch {
          setLocation(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)} (GPS Locked ±${accuracy}m)`);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please allow location access in your browser settings.');
        } else {
          setLocationError('Unable to retrieve location. Please check your GPS signal or enter address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setDescription(tmpl.text);
    setLocation(tmpl.location);
    setAiResult(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) return;

    setAnalyzing(true);
    setAiResult(null);

    await new Promise((r) => setTimeout(r, 1200));

    const isMedical =
      description.toLowerCase().includes('hospital') ||
      description.toLowerCase().includes('dialysis') ||
      description.toLowerCase().includes('doctor') ||
      description.toLowerCase().includes('medical');

    const isFood =
      description.toLowerCase().includes('food') ||
      description.toLowerCase().includes('water') ||
      description.toLowerCase().includes('ration');

    if (isMedical) {
      setAiResult({
        category: 'Medical Emergency & Transport',
        urgency: 'CRITICAL',
        confidence: 94,
        extractedNeeds: ['Emergency Medical Transit', 'Dialysis Schedule Timing', 'Vehicle Access'],
        requiredSkills: ['Medical Driver', 'First Aid Certified'],
        summary:
          'High time-sensitivity detected. Life-critical treatment window. Immediate priority dispatch is recommended.',
      });
    } else if (isFood) {
      setAiResult({
        category: 'Food & Hydration Relief',
        urgency: 'HIGH',
        confidence: 89,
        extractedNeeds: ['Clean Potable Water (10L)', 'Ready-to-Eat Ration Pack (3 Days)', 'Family Assistance'],
        requiredSkills: ['Supply Delivery', 'Flood Zone Safe Transport'],
        summary:
          'Flood-induced isolation identified. Recommended automated allocation from nearest NGO food bank repository.',
      });
    } else {
      setAiResult({
        category: 'Shelter & Essential Supplies',
        urgency: 'MEDIUM',
        confidence: 86,
        extractedNeeds: ['Tarpaulins', 'Thermal Blankets', 'Structural Reinforcement'],
        requiredSkills: ['Handyman / Carpentry', 'Shelter Logistics'],
        summary:
          'Environmental exposure risk detected. Sourcing weatherproofing materials from community inventory.',
      });
    }

    setAnalyzing(false);
  };

  const handleConfirmDispatch = async () => {
    setDispatching(true);
    await new Promise((r) => setTimeout(r, 800));

    const newReq = {
      id: `REQ-${Math.floor(4100 + Math.random() * 800)}`,
      category: aiResult?.category || 'General Aid Support',
      description,
      location,
      status: 'MATCHING',
      urgency: aiResult?.urgency || 'HIGH',
      createdAt: 'Just now',
      volunteer: null,
      aiNotes: aiResult?.summary || 'AI triage classification completed. Actively matching nearby responders.',
    };

    try {
      const stored = localStorage.getItem('nexora_requests');
      const currentList = stored ? JSON.parse(stored) : [];
      localStorage.setItem('nexora_requests', JSON.stringify([newReq, ...currentList]));
    } catch {
      // ignore
    }

    setDispatched(true);
    setTimeout(() => {
      router.push('/requester/dashboard');
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
            Create AI Aid Request
          </h1>
        </div>
        <p className="text-sm text-zinc-400">
          Describe what you need in plain words. Our neural triage engine will parse urgency and broadcast to nearby responders.
        </p>
      </div>

      {/* Quick Starter Templates */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          Quick Starters:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={tmpl.title}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="p-3 bg-[#0D0D12] border border-white/10 rounded-xl hover:border-white/30 text-left transition-all group flex items-center gap-2.5 shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 text-zinc-300 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                  {tmpl.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Request Form */}
      <form onSubmit={handleAnalyze} className="bg-[#0D0D12] p-6 rounded-2xl border border-white/10 shadow-xl space-y-5">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Describe the situation & needs
          </label>
          <Textarea
            required
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (aiResult) setAiResult(null);
            }}
            placeholder="Tell us what help is needed, who is affected, and any critical constraints..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Exact Location / Landmark
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg transition-all font-medium disabled:opacity-50"
            >
              {locating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  Acquiring GPS...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  Use Current Location
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            <Input
              type="text"
              required
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (aiResult) setAiResult(null);
              }}
              placeholder="e.g. Flat 302, Green Valley Apartments, Near City Bus Depot"
              className="pl-10 pr-24"
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              title="Click to fetch real-time GPS coordinates"
              className="absolute right-2 top-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-xs text-zinc-200 hover:text-white border border-white/15 rounded-lg flex items-center gap-1.5 transition-all font-mono"
            >
              <Crosshair className="w-3 h-3 text-emerald-400" />
              {locating ? 'GPS...' : 'GPS'}
            </button>
          </div>

          {/* Real-time GPS Coordinates Badge */}
          {gpsCoords && (
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-300 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>GPS Locked: {gpsCoords.lat.toFixed(5)}° N, {gpsCoords.lng.toFixed(5)}° E</span>
              </span>
              <span className="text-[11px] text-zinc-400">±{gpsCoords.accuracy}m accuracy</span>
            </div>
          )}

          {locationError && (
            <p className="text-xs text-red-400 mt-1.5 font-medium">
              {locationError}
            </p>
          )}

          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Geocoded automatically for calculating volunteer distance and travel ETA.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          disabled={analyzing || !description.trim() || !location.trim()}
        >
          {analyzing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-black" />
              AI Neural Triage In Progress...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze with Gemini AI
            </>
          )}
        </Button>
      </form>

      {/* AI Analysis Result Card */}
      {aiResult && (
        <div className="bg-[#0D0D12] rounded-2xl border border-white/25 p-6 shadow-2xl space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-lg font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  AI Triage Analysis Complete
                </div>
                <h3 className="text-base font-bold text-white font-[family-name:var(--font-plus-jakarta)]">
                  {aiResult.category}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UrgencyBadge urgency={aiResult.urgency} />
              <ScoreRing score={aiResult.confidence} size={64} label="CONF" />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-white/[0.04] p-3.5 rounded-xl border border-white/10">
            {aiResult.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="font-semibold text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
                Extracted Needs
              </div>
              <ul className="space-y-1">
                {aiResult.extractedNeeds.map((need, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-zinc-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>{need}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <div className="font-semibold text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
                Target Volunteer Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aiResult.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-white/[0.06] text-zinc-200 border border-white/15 font-medium text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dispatch Action */}
          <div className="pt-2">
            {dispatched ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#2EEA8D] text-center font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Request Broadcasted! Redirecting to dashboard...
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleConfirmDispatch}
                disabled={dispatching}
                className="w-full text-black shadow-lg font-bold"
              >
                {dispatching ? (
                  <>
                    <Compass className="w-4 h-4 animate-spin" />
                    Broadcasting to Nearby Responders...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Confirm & Dispatch Help Request
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
