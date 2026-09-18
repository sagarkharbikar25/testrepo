# 08 — NexoraLink AI + Matching Plan
**Owner: Person 4**  
**Branch: `feature/ai-integration`**

---

## Mission
Build the Gemini AI integration, deterministic matching algorithm, Leaflet map component, resource gap visualization, and perform final cross-module integration testing.

---

## Owned Files

```
src/app/api/ai/
└── analyze-request/route.ts       — POST (Gemini analysis)

src/app/api/matches/
└── [requestId]/route.ts           — GET (run matching, return scored list)

src/lib/
├── gemini.ts                      — Gemini API wrapper
├── matching.ts                    — Weighted matching algorithm
└── geo.ts                         — Distance calculations

src/features/map/
└── NexoraMap.tsx                  — Leaflet map component

src/types/
├── ai.ts                          — AIAnalysisResult, GeminiResponse
└── matching.ts                    — MatchCandidate, MatchScoreBreakdown

supabase/migrations/
└── 005_matches.sql

src/lib/validation/
└── ai.schema.ts                   — Zod schema for AI response
```

---

## Files Person 4 Must NOT Modify

```
src/app/api/auth/**                — Person 2
src/app/api/requests/**            — Person 2 (except analyze sub-route)
src/app/api/feedback/**            — Person 2
src/app/api/volunteers/**          — Person 3
src/app/api/ngos/**                — Person 3
src/app/api/resources/**           — Person 3
src/app/api/admin/**               — Person 3
src/lib/supabase/**                — Person 2
src/lib/validation/request.schema.ts  — Person 2
src/lib/validation/volunteer.schema.ts — Person 3
src/lib/validation/ngo.schema.ts   — Person 3
src/types/auth.ts                  — Person 2
src/types/request.ts               — Person 2
src/types/volunteer.ts             — Person 3
src/types/ngo.ts                   — Person 3
src/types/resource.ts              — Person 3
src/types/admin.ts                 — Person 3
supabase/migrations/001_*.sql      — Person 2
supabase/migrations/002_*.sql      — Person 2
supabase/migrations/003_*.sql      — Person 3
supabase/migrations/004_*.sql      — Person 3
src/app/**/*.tsx                   — Person 1 (UI pages)
src/components/**                  — Person 1
src/features/requester/**          — Person 1
src/features/volunteer/**          — Person 1
src/features/ngo/**                — Person 1
src/features/admin/**              — Person 1
```

**Exception**: Person 4 OWNS `src/features/map/NexoraMap.tsx`.  
Person 1 imports and uses it but does NOT edit it.

---

## Implementation

### 1. Gemini API Wrapper

**`src/lib/gemini.ts`**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
import { aiAnalysisSchema } from '@/lib/validation/ai.schema'
import type { AIAnalysisResult } from '@/types/ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const ANALYSIS_PROMPT = (description: string) => `
You are an AI assistant for a community help coordination platform.
Analyze this help request and extract structured information.

Help request: "${description}"

Respond ONLY with a JSON object. No markdown, no explanation. Just the JSON.

{
  "category": "<one of: medical, food, transportation, education, shelter, general>",
  "task": "<brief task description, 3-6 words>",
  "urgency": "<one of: LOW, MEDIUM, HIGH, CRITICAL>",
  "skills_needed": ["<skill1>", "<skill2>"],
  "summary": "<one sentence summary for the volunteer>",
  "confidence": <number between 0 and 1>
}

Rules:
- CRITICAL: life-threatening or immediate danger
- HIGH: same-day need, elderly/child/medical
- MEDIUM: 1-2 day window
- LOW: flexible timing
- skills_needed: be specific (e.g. "medicine_pickup", "grocery_shopping", "driving")
- confidence: how certain you are (0.9 = very certain, 0.5 = ambiguous request)
`

export const FALLBACK_ANALYSIS: AIAnalysisResult = {
  category: 'general',
  task: 'general_assistance',
  urgency: 'MEDIUM',
  skills_needed: ['general'],
  summary: 'Community assistance needed.',
  confidence: 0,
}

export async function analyzeHelpRequest(description: string): Promise<AIAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(ANALYSIS_PROMPT(description))
    const text = result.response.text().trim()

    // Strip any accidental markdown fences
    const cleaned = text.replace(/```json?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Validate with Zod
    const validated = aiAnalysisSchema.safeParse(parsed)
    if (!validated.success) {
      console.warn('[Gemini] Validation failed:', validated.error)
      return { ...FALLBACK_ANALYSIS, confidence: 0 }
    }

    return validated.data
  } catch (err) {
    console.error('[Gemini] API error:', err)
    return FALLBACK_ANALYSIS
  }
}
```

### 2. AI Analysis Validation Schema

**`src/lib/validation/ai.schema.ts`**
```typescript
import { z } from 'zod'

export const aiAnalysisSchema = z.object({
  category: z.enum(['medical','food','transportation','education','shelter','general']),
  task: z.string().min(1).max(100),
  urgency: z.enum(['LOW','MEDIUM','HIGH','CRITICAL']),
  skills_needed: z.array(z.string()).max(5),
  summary: z.string().min(1).max(300),
  confidence: z.number().min(0).max(1),
})
```

### 3. AI Route

**`src/app/api/ai/analyze-request/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { analyzeHelpRequest, FALLBACK_ANALYSIS } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

  const { request_id, description } = await req.json()
  if (!request_id || !description) {
    return NextResponse.json({ error: { message: 'request_id and description required' } }, { status: 400 })
  }

  const analysis = await analyzeHelpRequest(description)
  const isAISuccess = analysis.confidence > 0

  // Update the help_request with AI results
  const { error } = await supabase
    .from('help_requests')
    .update({
      ai_category: analysis.category,
      ai_task: analysis.task,
      ai_urgency: analysis.urgency,
      ai_skills_needed: analysis.skills_needed,
      ai_summary: analysis.summary,
      ai_confidence: analysis.confidence,
      status: 'AI_ANALYZED',
    })
    .eq('id', request_id)
    .eq('requester_id', user.id)

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }

  // Insert status history
  await supabase.from('request_status_history').insert({
    request_id,
    from_status: 'REQUESTED',
    to_status: 'AI_ANALYZED',
    changed_by: user.id,
    note: isAISuccess ? `AI analyzed with ${Math.round(analysis.confidence * 100)}% confidence` : 'AI fallback used',
  })

  return NextResponse.json({
    data: analysis,
    meta: { ai_success: isAISuccess, used_fallback: !isAISuccess }
  })
}
```

### 4. Matching Algorithm

**`src/lib/matching.ts`**
```typescript
import type { MatchCandidate } from '@/types/matching'

// Weights must sum to 1.0
const WEIGHTS = {
  distance: 0.30,
  skill:    0.30,
  avail:    0.20,
  urgency:  0.10,
  trust:    0.10,
}

// Distance score: 0km=1.0, 5km=0.5, 10km=0.0
function calcDistanceScore(distanceKm: number, maxKm = 10): number {
  return Math.max(0, 1 - distanceKm / maxKm)
}

// Skill score: exact match = 1.0, partial = 0.5, none = 0.0
function calcSkillScore(
  requestCategory: string,
  requestSkills: string[],
  volunteerCategories: string[],
  volunteerSkills: string[]
): number {
  const categoryMatch = volunteerCategories.includes(requestCategory) ? 0.5 : 0
  const skillMatch = requestSkills.some(s => volunteerSkills.includes(s)) ? 0.5 : 0
  return Math.min(1, categoryMatch + skillMatch)
}

// Urgency multiplier
function calcUrgencyScore(urgency: string): number {
  return { CRITICAL: 1.0, HIGH: 0.8, MEDIUM: 0.5, LOW: 0.3 }[urgency] ?? 0.5
}

export function calculateMatchScore(params: {
  distanceKm: number
  requestCategory: string
  requestSkills: string[]
  requestUrgency: string
  volunteerCategories: string[]
  volunteerSkills: string[]
  isAvailable: boolean
  trustScore: number
}): { total: number; breakdown: Record<string, number> } {
  const distScore  = calcDistanceScore(params.distanceKm)
  const skillScore = calcSkillScore(params.requestCategory, params.requestSkills, params.volunteerCategories, params.volunteerSkills)
  const availScore = params.isAvailable ? 1.0 : 0.0
  const urgScore   = calcUrgencyScore(params.requestUrgency)
  const trustScore = (params.trustScore ?? 3) / 5  // normalize 0–5 to 0–1

  const total = (
    distScore  * WEIGHTS.distance +
    skillScore * WEIGHTS.skill    +
    availScore * WEIGHTS.avail    +
    urgScore   * WEIGHTS.urgency  +
    trustScore * WEIGHTS.trust
  ) * 100

  return {
    total: Math.round(total),
    breakdown: {
      distance:     Math.round(distScore * 100),
      skill:        Math.round(skillScore * 100),
      availability: Math.round(availScore * 100),
      urgency:      Math.round(urgScore * 100),
      trust:        Math.round(trustScore * 100),
    }
  }
}
```

### 5. Geo Utilities

**`src/lib/geo.ts`**
```typescript
// Haversine formula for distance between two lat/lng points
export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Parse PostGIS point string "POINT(lon lat)" to { lat, lng }
export function parsePoint(point: string | null): { lat: number; lng: number } | null {
  if (!point) return null
  const match = point.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/)
  if (!match) return null
  return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) }
}
```

### 6. Matches Route

**`src/app/api/matches/[requestId]/route.ts`**
```typescript
export async function GET(req: NextRequest, { params }: { params: { requestId: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauth()

  const requestId = params.requestId

  // Fetch the request
  const { data: request } = await supabase
    .from('help_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!request) return NextResponse.json({ error: { message: 'Request not found' } }, { status: 404 })

  const reqPoint = parsePoint(request.location)
  if (!reqPoint) return NextResponse.json({ data: { volunteers: [], ngos: [] } })

  // Fetch nearby available volunteers with skills
  const { data: volunteers } = await supabase
    .from('volunteers')
    .select('*, profiles(full_name, location), volunteer_skills(category, skill_name)')
    .eq('is_available', true)

  const scoredVolunteers = (volunteers || [])
    .map(vol => {
      const volPoint = parsePoint(vol.profiles?.location)
      if (!volPoint) return null

      const distKm = haversineKm(reqPoint.lat, reqPoint.lng, volPoint.lat, volPoint.lng)
      if (distKm > (vol.radius_km || 5)) return null

      const categories = vol.volunteer_skills?.map((s: any) => s.category) || []
      const skills = vol.volunteer_skills?.map((s: any) => s.skill_name) || []

      const { total, breakdown } = calculateMatchScore({
        distanceKm: distKm,
        requestCategory: request.category,
        requestSkills: request.ai_skills_needed || [],
        requestUrgency: request.urgency,
        volunteerCategories: categories,
        volunteerSkills: skills,
        isAvailable: vol.is_available,
        trustScore: vol.trust_score || 3,
      })

      return {
        id: vol.id,
        full_name: vol.profiles?.full_name,
        candidate_type: 'volunteer' as const,
        distance_km: Math.round(distKm * 10) / 10,
        total_score: total,
        score_breakdown: breakdown,
        is_available: vol.is_available,
        trust_score: vol.trust_score,
        category_match: categories.includes(request.category),
      }
    })
    .filter(Boolean)
    .sort((a, b) => b!.total_score - a!.total_score)
    .slice(0, 5)

  // Store top matches in DB
  if (scoredVolunteers.length > 0) {
    const matchRows = scoredVolunteers.map(v => ({
      request_id: requestId,
      candidate_id: v!.id,
      candidate_type: 'volunteer',
      distance_km: v!.distance_km,
      distance_score: v!.score_breakdown.distance / 100,
      skill_score: v!.score_breakdown.skill / 100,
      availability_score: v!.score_breakdown.availability / 100,
      urgency_score: v!.score_breakdown.urgency / 100,
      trust_score: v!.score_breakdown.trust / 100,
      total_score: v!.total_score,
      is_selected: false,
    }))
    await supabase.from('matches').upsert(matchRows, { onConflict: 'request_id,candidate_id' })
  }

  // Update request status to MATCHING
  await supabase.from('help_requests').update({ status: 'MATCHING' }).eq('id', requestId)

  return NextResponse.json({ data: { volunteers: scoredVolunteers, ngos: [] } })
}
```

### 7. Leaflet Map Component

**`src/features/map/NexoraMap.tsx`**
```typescript
'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'

export type MapMarker = {
  id: string
  lat: number
  lng: number
  type: 'request' | 'volunteer' | 'ngo' | 'resource'
  label: string
  urgency?: string
  status?: string
  color?: string
}

interface NexoraMapProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  height?: string
  onMarkerClick?: (marker: MapMarker) => void
}

const MARKER_COLORS: Record<string, string> = {
  request:   '#EF4444',   // red — needs help
  volunteer: '#3B82F6',   // blue — helper
  ngo:       '#8B5CF6',   // purple — organization
  resource:  '#10B981',   // green — available resource
}

const URGENCY_SIZE: Record<string, number> = {
  CRITICAL: 20,
  HIGH: 16,
  MEDIUM: 12,
  LOW: 10,
}

export default function NexoraMap({
  markers,
  center = [20.5937, 78.9629],  // India default
  zoom = 12,
  height = '400px',
  onMarkerClick,
}: NexoraMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current) return
    if (mapRef.current) return  // already initialized

    import('leaflet').then(L => {
      // Fix Leaflet icon paths in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!).setView(center, zoom)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      markers.forEach(marker => {
        const color = MARKER_COLORS[marker.type] || '#6B7280'
        const size = marker.urgency ? (URGENCY_SIZE[marker.urgency] || 12) : 12

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              background: ${color};
              width: ${size}px; height: ${size}px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 6px rgba(0,0,0,0.5);
              ${marker.urgency === 'CRITICAL' ? 'animation: pulse 1s infinite;' : ''}
            "></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        const m = L.marker([marker.lat, marker.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:160px">
              <strong>${marker.label}</strong><br/>
              <span style="color:${color};text-transform:uppercase;font-size:11px">${marker.type}</span>
              ${marker.urgency ? `<br/><span>Urgency: ${marker.urgency}</span>` : ''}
              ${marker.status ? `<br/><span>Status: ${marker.status}</span>` : ''}
            </div>
          `)

        if (onMarkerClick) {
          m.on('click', () => onMarkerClick(marker))
        }
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when they change
  useEffect(() => {
    if (!mapRef.current) return
    // Clear and re-add markers on update
    // (simplified for 6-hour MVP — full reactive updates would use a layer group)
  }, [markers])

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}
      className="bg-slate-800"
    />
  )
}
```

---

## Hour-by-Hour Plan

| Hour | Tasks |
|------|-------|
| 0–1 | Run migration 005, install `@google/generative-ai`, set up `src/lib/gemini.ts` |
| 1–2 | AI analysis route + Zod validation + fallback testing |
| 2–3 | Matching algorithm + geo utils + matches route |
| 3–4 | Leaflet map component (NexoraMap.tsx) — test with static markers |
| 4–5 | Integration: connect AI → request flow, connect matching → volunteer dashboard |
| 5–6 | Cross-module testing, fix integration bugs, QA demo flow |

---

## QA Checklist (Hour 5–6)

- [ ] POST /api/ai/analyze-request returns valid category + urgency
- [ ] POST /api/ai/analyze-request falls back gracefully if GEMINI_API_KEY is missing
- [ ] GET /api/matches/:requestId returns scored volunteer list
- [ ] Score calculation is deterministic (same inputs = same score)
- [ ] NexoraMap renders without SSR error
- [ ] All 4 marker types appear on map
- [ ] Request creation → AI analysis → matching full flow works end-to-end
- [ ] Volunteer accept changes status to ACCEPTED
- [ ] Admin dashboard loads resource gaps
- [ ] No 500 errors in demo flow

---

## Environment Variables Owned by Person 4

```
GEMINI_API_KEY=your_gemini_api_key_here
```
(Add to `.env.local` and `.env.example`)
