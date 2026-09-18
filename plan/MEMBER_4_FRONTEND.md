# Member 4: Frontend Developer (FE)
**Branch:** `feature/frontend`
**Owned files:**
```
src/app/**            (everything EXCEPT src/app/api/**)
src/components/**
src/features/**
src/hooks/**
tailwind.config.ts
src/app/globals.css
```
**Do not touch — hard boundary (this was missing from the original draft, add it now):**
```
src/app/api/**              — every API route, all three backend members
src/lib/gemini.ts           — Member 2
src/lib/matching.ts         — Member 2
src/lib/supabase/**         — Member 2 (read/import only, never edit)
src/types/ai.ts             — Member 2
src/types/matching.ts       — Member 2
src/types/request.ts        — Member 2
src/types/volunteer.ts, ngo.ts, resource.ts, admin.ts  — Member 3
supabase/migrations/**      — Member 1
```
If you need a field a type file doesn't have, ask the owning member to add it — don't add it yourself, even temporarily.

**Design system:** build against `14_UI_UX_ENHANCEMENT.md` from the start (Hour 0–1), not as a later polish pass — it only costs extra time if retrofitted after components are already built with default Tailwind styling.

---

## Hour 0 setup (you run this first, before anyone else can build on `main`)

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install leaflet react-leaflet lucide-react swr zod
```
Push to `main` immediately so the three backend members have a project to branch from.

---

## Design Tokens (base palette — see `14_UI_UX_ENHANCEMENT.md` for the full system)

```
Primary:    #2563EB   Secondary: #7C3AED   Success: #059669
Warning:    #D97706   Danger:    #DC2626
Surface:    #0F172A   Card:      #1E293B   Border: #334155
Text:       #F8FAFC   Muted:     #94A3B8
```
Fonts: `Space Grotesk` (headings, from the enhancement doc) · `Inter` (body) · `JetBrains Mono` (every number: scores, distances, IDs, timestamps).

---

## Components to build first (Hour 0–1)

```
src/components/layout/   AppShell, Sidebar, TopBar, RoleGuard
src/components/ui/       Badge, Button, Card, Input, Textarea, Select, Modal,
                          StatusTimeline, ScoreRing, LoadingSkeleton,
                          EmptyState, ErrorState, MapContainer
```

## Pages

```
app/page.tsx                        Landing — hero + 3 role CTAs
app/(auth)/login, register           Register includes role selector
app/(requester)/dashboard, request/new, request/[id]
app/(volunteer)/dashboard, profile
app/(ngo)/dashboard, resources
app/(admin)/dashboard
```

## Feature modules

```
src/features/requester/  RequesterDashboard, RequestCard, NewRequestForm,
                          AIAnalysisPanel, MatchResultsPanel, RequestDetailPage, FeedbackModal
src/features/volunteer/  VolunteerDashboard, NearbyRequestCard, RequestDetailModal,
                          ActiveAssignmentBanner, VolunteerProfileForm
src/features/ngo/        NGODashboard, ResourceCard, AddResourceModal,
                          ResourceRequestsList, NGOProfileForm
src/features/admin/      AdminDashboard, StatCard, GapAlertBanner,
                          RequestsTable, VerificationQueue, AdminMapView
src/features/map/        NexoraMap.tsx — Leaflet, dynamically imported, SSR disabled:
                          const NexoraMap = dynamic(() => import('@/features/map/NexoraMap'), { ssr: false })
```

## API hooks (`src/hooks/`)

```
useRequests, useRequest, useMatches, useVolunteerRequests,
useResources, useAdminDashboard, useAuth
```
Each returns `{ data, error, isLoading }`, handles 401 → redirect to `/login`.

## Status/urgency color maps (`src/lib/status-colors.ts`)

```typescript
export const STATUS_COLORS = {
  REQUESTED: 'bg-slate-500/20 text-slate-300',
  AI_ANALYZED: 'bg-violet-500/20 text-violet-300',
  MATCHING: 'bg-blue-500/20 text-blue-300',
  ASSIGNED: 'bg-cyan-500/20 text-cyan-300',
  ACCEPTED: 'bg-indigo-500/20 text-indigo-300',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-300',
  COMPLETED: 'bg-emerald-500/20 text-emerald-300',
  CANCELLED: 'bg-red-500/20 text-red-300',
}
export const URGENCY_COLORS = {
  LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
}
```

---

## Hour-by-Hour

| Hour | Tasks |
|------|-------|
| 0–1 | Scaffold + push to main, Tailwind config + fonts, AppShell/Sidebar/TopBar, all UI primitives (apply Ops/Calm mode split now) |
| 1–2 | Login/Register pages, landing page, RequesterDashboard skeleton, NewRequestForm (static location OK for now) |
| 2–3 | Wire NewRequestForm → `POST /api/requests` → `/api/ai/analyze-request`, AIAnalysisPanel, MatchResultsPanel, ScoreRing |
| 3–4 | VolunteerDashboard + NearbyRequestCard + accept/start/complete wiring, NGODashboard + AddResourceModal |
| 4–5 | AdminDashboard + GapAlertBanner, NexoraMap integrated into Admin + Volunteer dashboards |
| 5–6 | Loading/empty/error states, responsive pass (375px + 1280px), demo walkthrough fixes |

## Pre-merge checklist
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Landing, login, register render without console errors
- [ ] NewRequestForm actually calls the real API, not mocked data
- [ ] VolunteerDashboard renders correctly even with an empty response
- [ ] `git diff --name-only HEAD` touches nothing under `src/app/api/**`
