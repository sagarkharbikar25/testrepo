# 05 — NexoraLink Frontend Plan
**Owner: Person 1**  
**Branch: `feature/frontend`**

---

## Design System

### Color Palette
```
Primary:    #2563EB (blue-600) — actions, CTAs
Secondary:  #7C3AED (violet-600) — AI/smart features
Success:    #059669 (emerald-600) — completed, available
Warning:    #D97706 (amber-600) — medium urgency
Danger:     #DC2626 (red-600) — HIGH/CRITICAL urgency
Surface:    #0F172A (slate-900) — dark base
Card:       #1E293B (slate-800) — card backgrounds
Border:     #334155 (slate-700) — borders
Text:       #F8FAFC (slate-50) — primary text
Muted:      #94A3B8 (slate-400) — secondary text
```
**Theme: Dark-first, high-contrast, professional coordination tool.**  
Not a warm community app — it's a tactical coordination dashboard that happens to help people.

### Typography
- **Display/Headings**: `Inter` (system sans, not default weights — use 700/800)
- **Body**: `Inter` 400/500
- **Mono/Data**: `JetBrains Mono` for scores, distances, IDs
- Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48

### Component Tokens (Tailwind classes to standardize)
```
Card:           bg-slate-800 border border-slate-700 rounded-xl p-4
Badge urgent:   bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 text-xs
Badge medium:   bg-amber-500/20 text-amber-400 ...
Badge low:      bg-emerald-500/20 text-emerald-400 ...
Button primary: bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold
Button ghost:   bg-transparent border border-slate-700 hover:bg-slate-700 ...
Input:          bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 focus:border-blue-500
Score ring:     Use SVG circle for score visualization
```

---

## Pages & Components

### Layout Components (shared — build first)
```
src/components/layout/
├── AppShell.tsx          — sidebar + topbar shell
├── Sidebar.tsx           — role-aware nav
├── TopBar.tsx            — user info, logout
└── RoleGuard.tsx         — redirect if wrong role
```

### Design System Components (build second)
```
src/components/ui/
├── Badge.tsx             — urgency badges, status badges
├── Button.tsx            — primary, ghost, danger variants
├── Card.tsx              — base card wrapper
├── Input.tsx             — text input
├── Textarea.tsx
├── Select.tsx
├── Modal.tsx             — dialog wrapper
├── StatusTimeline.tsx    — request lifecycle steps
├── ScoreRing.tsx         — circular match score (SVG)
├── LoadingSkeleton.tsx   — placeholder cards
├── EmptyState.tsx        — no requests, no volunteers
├── ErrorState.tsx        — API error display
└── MapContainer.tsx      — Leaflet mount wrapper (dynamic import)
```

### Auth Pages
```
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
```
- Login: email + password, link to register
- Register: name + email + password + **role selector** (requester / volunteer / ngo)
- After register: redirect to role-appropriate dashboard

### Landing Page
```
app/page.tsx
```
- Hero: "Community help, coordinated by AI"
- 3 stat blocks (animated on load): requests helped, volunteers active, resources shared
- 3 role cards: Get Help / Volunteer / NGO Partner
- CTA buttons → login/register

### Requester Module
```
src/features/requester/
├── RequesterDashboard.tsx   — overview, recent requests
├── RequestCard.tsx          — summary card in list
├── NewRequestForm.tsx       — text input + location picker
├── AIAnalysisPanel.tsx      — shows AI result (category, urgency, summary)
├── MatchResultsPanel.tsx    — list of volunteer/NGO matches with scores
├── RequestDetailPage.tsx    — full request + timeline + assigned volunteer
└── FeedbackModal.tsx        — rating + comment after completion
```

**Request Form UX (key interaction):**
1. Large textarea: "Describe what help you need..."
2. User picks location on mini-Leaflet map or types address
3. Submit → loading state "AI is analyzing your request..."
4. AIAnalysisPanel slides in below with: category chip, urgency badge, AI summary, confidence bar
5. Manual override options (if confidence < 0.6): category dropdown, urgency dropdown
6. "Find Help" button → triggers matching
7. MatchResultsPanel shows top 3 candidates with score rings

### Volunteer Module
```
src/features/volunteer/
├── VolunteerDashboard.tsx   — nearby requests + active assignment
├── NearbyRequestCard.tsx    — request card with match score badge
├── RequestDetailModal.tsx   — full details before accept/reject
├── ActiveAssignmentBanner.tsx — persistent banner when assigned
└── VolunteerProfileForm.tsx  — skills, availability, radius
```

### NGO Module
```
src/features/ngo/
├── NGODashboard.tsx         — resource overview + resource gap alerts
├── ResourceCard.tsx         — single resource with quantity
├── AddResourceModal.tsx     — form to add/edit resource
├── ResourceRequestsList.tsx — incoming resource requests
└── NGOProfileForm.tsx       — org details, services
```

### Admin Module
```
src/features/admin/
├── AdminDashboard.tsx       — stat grid + gap alerts + map
├── StatCard.tsx             — metric card (number + label + trend)
├── GapAlertBanner.tsx       — resource gap warning
├── RequestsTable.tsx        — filterable request list
├── VerificationQueue.tsx    — volunteers/NGOs pending verification
└── AdminMapView.tsx         — full-screen coordination map
```

### Map Integration
```
src/features/map/
└── NexoraMap.tsx            — Leaflet map with configurable markers
```

**Important**: Leaflet must be dynamically imported (no SSR).
```typescript
const NexoraMap = dynamic(() => import('@/features/map/NexoraMap'), { ssr: false })
```

---

## API Consumption Hooks (Frontend owns these)

```
src/hooks/
├── useRequests.ts        — GET /api/requests
├── useRequest.ts         — GET /api/requests/:id
├── useMatches.ts         — GET /api/matches/:requestId
├── useVolunteerRequests.ts — GET /api/volunteers/requests
├── useResources.ts       — GET /api/resources
├── useAdminDashboard.ts  — GET /api/admin/dashboard
└── useAuth.ts            — Supabase auth state
```

Each hook should:
- Use `useSWR` or simple `useEffect + fetch`
- Return `{ data, error, isLoading }`
- Handle 401 → redirect to login

---

## Status Color Mapping

```typescript
// src/lib/status-colors.ts [FE owns]
export const STATUS_COLORS = {
  REQUESTED:    'bg-slate-500/20 text-slate-300',
  AI_ANALYZED:  'bg-violet-500/20 text-violet-300',
  MATCHING:     'bg-blue-500/20 text-blue-300',
  ASSIGNED:     'bg-cyan-500/20 text-cyan-300',
  ACCEPTED:     'bg-indigo-500/20 text-indigo-300',
  IN_PROGRESS:  'bg-amber-500/20 text-amber-300',
  COMPLETED:    'bg-emerald-500/20 text-emerald-300',
  CANCELLED:    'bg-red-500/20 text-red-300',
}

export const URGENCY_COLORS = {
  LOW:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MEDIUM:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  HIGH:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640–1024px | Sidebar collapsed, main content |
| Desktop | > 1024px | Sidebar expanded + main content |

---

## Frontend Build Order (Hour by Hour)

**Hour 0–1:**
- Project scaffold (Next.js already set up)
- Install dependencies: `leaflet`, `react-leaflet`, `swr`, `lucide-react`, `zod`
- Set up Tailwind config with custom colors
- Create AppShell, Sidebar, TopBar
- Create all UI primitives (Badge, Button, Card, Input)

**Hour 1–2:**
- Auth pages (Login + Register)
- Landing page
- RequesterDashboard skeleton
- NewRequestForm (textarea + static location for now)

**Hour 2–3:**
- AIAnalysisPanel (consumes POST /api/ai/analyze-request)
- MatchResultsPanel (consumes GET /api/matches/:id)
- StatusTimeline component
- ScoreRing SVG component

**Hour 3–4:**
- VolunteerDashboard + NearbyRequestCard
- ActiveAssignmentBanner
- NGODashboard + ResourceCard + AddResourceModal

**Hour 4–5:**
- AdminDashboard + StatCard + GapAlertBanner
- Leaflet map integration (NexoraMap component)
- RequestDetailPage with full timeline

**Hour 5–6:**
- Polish: loading states, empty states, error handling
- Responsive fixes
- Demo flow walkthrough and fixes

---

## Files Person 1 MUST NOT Modify

```
src/app/api/**              — All API routes (BE-R, BE-M, AI)
src/lib/gemini.ts           — AI library (AI)
src/lib/matching.ts         — Matching algorithm (AI)
src/lib/supabase/           — Supabase client setup (BE-R)
supabase/migrations/**      — DB migrations (BE-R, BE-M, AI)
src/types/ai.ts             — AI types (AI)
src/types/matching.ts       — Matching types (AI)
```

---

## Acceptance Criteria

- [ ] Landing page loads, shows 3 role CTAs
- [ ] Register works for all 3 roles
- [ ] Requester can type a request and see AI results
- [ ] Match scores visible with score ring
- [ ] Volunteer dashboard shows nearby requests
- [ ] Volunteer can accept and complete a request
- [ ] Status timeline updates visually
- [ ] NGO can add a resource
- [ ] Admin sees stat grid with all counts
- [ ] Leaflet map renders with at least request markers
- [ ] Resource gap alert shows when applicable
- [ ] No console errors in demo flow
- [ ] Responsive on 375px mobile and 1280px desktop
