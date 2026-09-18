# 12 — NexoraLink 6-Hour Execution Plan

## Priority Legend
- **P0** — Non-negotiable. Demo breaks without this.
- **P1** — Important but demo survives without it.
- **P2** — Only if time permits after P0+P1.

---

## HOUR 0–1: Foundation (All 4 people in parallel)

### Person 2 (BE-R) — Project Owner
```
[P0] Create Next.js project + push to GitHub
[P0] Create feature branches for all 4 people
[P0] Install: @supabase/supabase-js @supabase/ssr zod
[P0] Create Supabase project + enable PostGIS extension
[P0] Write + run migration 001 (profiles table)
[P0] Write + run migration 002 (help_requests table)
[P0] Create src/lib/supabase/client.ts + server.ts
[P0] Add to .env.example, share .env.local with team
[P0] Add leaflet + @google/generative-ai to package.json (requested by P1, P4)
[P0] Push initial setup to main
```

### Person 1 (FE) — After clone
```
[P0] Pull main, create feature/frontend branch
[P0] Configure tailwind.config.ts (custom colors, fonts)
[P0] Import Inter + JetBrains Mono from Google Fonts in layout.tsx
[P0] Create src/components/ui/ — Badge, Button, Card, Input, Textarea
[P0] Create AppShell + Sidebar + TopBar
[P1] Create RoleGuard component
[P0] Create landing page skeleton
```

### Person 3 (BE-M) — After clone
```
[P0] Pull main, create feature/backend-management branch
[P0] Wait for migration 001+002 to be run (coordinate with P2)
[P0] Write migration 003 (volunteers + volunteer_skills + RPC)
[P0] Write migration 004 (ngos + resources + resource_requests)
[P0] Run migrations 003 + 004
[P0] Define src/types/volunteer.ts, ngo.ts, resource.ts, admin.ts
```

### Person 4 (AI) — After clone
```
[P0] Pull main, create feature/ai-integration branch
[P0] Write migration 005 (matches table)
[P0] Run migration 005
[P0] Create src/lib/gemini.ts (Gemini wrapper with fallback)
[P0] Create src/lib/geo.ts (haversine + parsePoint)
[P0] Create src/lib/validation/ai.schema.ts
[P0] Define src/types/ai.ts, matching.ts
[P0] Install: @google/generative-ai (coordinate with P2 for package.json)
```

**Hour 1 milestone check:**
- [ ] Supabase DB has all 5 migrations run
- [ ] All 4 type files exist
- [ ] Supabase clients working (test with simple SELECT)
- [ ] Tailwind design system visible in browser

---

## HOUR 1–2: Core Features

### Person 2 (BE-R)
```
[P0] POST /api/auth/register route
[P0] GET /api/auth/me route
[P0] src/middleware.ts (route protection by role)
[P0] POST /api/requests (create request + status history)
[P0] GET /api/requests/:id (single request)
```

### Person 1 (FE)
```
[P0] Auth pages: /login, /register (with role selector)
[P0] RequesterDashboard layout (skeleton + empty state)
[P0] NewRequestForm — textarea + location placeholder
[P1] StatusTimeline component
[P1] ScoreRing SVG component
```

### Person 3 (BE-M)
```
[P0] POST /api/volunteers/profile (upsert + skills)
[P0] GET /api/volunteers/requests (nearby via RPC)
[P0] POST /api/ngos/profile (upsert)
[P1] GET /api/ngos (list)
```

### Person 4 (AI)
```
[P0] POST /api/ai/analyze-request route (calls gemini.ts)
[P0] Test Gemini call with sample text — verify output
[P0] Zod validation of AI response + fallback
[P0] Start src/lib/matching.ts (calculateMatchScore function)
```

**Hour 2 milestone check:**
- [ ] Can register new user + see profile in Supabase
- [ ] Can create a help request via API
- [ ] Gemini API returns valid JSON for sample input
- [ ] Login page renders in browser

---

## HOUR 2–3: Integration Layer

### Person 2 (BE-R)
```
[P0] GET /api/requests (list, role-filtered)
[P0] PATCH /api/requests/:id/status (with transition guard)
[P0] POST /api/requests/:id/cancel
[P1] POST /api/feedback
```

### Person 1 (FE)
```
[P0] Connect NewRequestForm → POST /api/requests (real API call)
[P0] AIAnalysisPanel — shows AI category/urgency/summary
[P0] Connect form → POST /api/ai/analyze-request after create
[P0] MatchResultsPanel — shows scored candidates
[P1] RequestDetailPage with StatusTimeline
```

### Person 3 (BE-M)
```
[P0] POST /api/volunteers/requests/:id/accept
[P0] POST /api/volunteers/requests/:id/start
[P0] POST /api/volunteers/requests/:id/complete
[P0] PATCH /api/volunteers/availability
[P1] POST /api/resources (add resource)
[P1] GET /api/resources (list)
```

### Person 4 (AI)
```
[P0] GET /api/matches/:requestId (full matching route)
[P0] Score + rank volunteers, store in matches table
[P0] Update request status to MATCHING after match run
[P1] Start NexoraMap.tsx (Leaflet component)
```

**Hour 3 milestone check (FIRST INTEGRATION MERGE):**
- [ ] Full request creation → AI analysis → matching works via API
- [ ] Volunteer can accept request via API
- [ ] Merge feature/backend-request → main
- [ ] Merge feature/backend-management → main
- [ ] Merge feature/frontend → main
- [ ] Others rebase on main

---

## HOUR 3–4: Dashboard Features

### Person 2 (BE-R)
```
[P1] Polish existing routes (error handling, edge cases)
[P1] Test all owned routes end-to-end
[P2] Request history endpoint improvements
[P2] Add pagination to GET /api/requests
```

### Person 1 (FE)
```
[P0] VolunteerDashboard — nearby requests list with match scores
[P0] Accept/Start/Complete buttons wired to API
[P0] ActiveAssignmentBanner (shows current active request)
[P1] NGODashboard — resource overview
[P1] AddResourceModal
[P1] VolunteerProfileForm (skills, availability)
```

### Person 3 (BE-M)
```
[P0] GET /api/admin/dashboard (stats + gap detection)
[P0] GET /api/admin/map-data (all locations)
[P1] PATCH /api/resources/:id (update quantity)
[P1] POST /api/ngos/profile polish
[P2] PATCH /api/admin/verify/:type/:id
```

### Person 4 (AI)
```
[P0] NexoraMap.tsx complete — all 4 marker types working
[P0] Test Leaflet rendering in Next.js (fix SSR issues)
[P0] Dynamic import wrapper working
[P1] Map location picker for NewRequestForm
```

**Hour 4 milestone check:**
- [ ] Volunteer can see requests + accept them in UI
- [ ] Admin dashboard shows stats from DB
- [ ] NexoraMap renders with markers in browser
- [ ] NGO can add a resource via form

---

## HOUR 4–5: Admin + Map + Polish

### Person 2 (BE-R)
```
[P0] Support Person 1 with any API integration issues
[P1] Add input to seed demo data (curl commands ready)
[P0] CRITICAL: Run demo flow manually, fix any bugs
```

### Person 1 (FE)
```
[P0] AdminDashboard — stat grid + GapAlertBanner
[P0] Integrate NexoraMap into Admin page (all markers)
[P0] Integrate NexoraMap into Volunteer dashboard (nearby requests)
[P1] FeedbackModal (rating + comment)
[P1] Loading skeletons for all data-fetching states
[P1] Empty states for all list views
```

### Person 3 (BE-M)
```
[P0] Resource gap detection working (verify gap_severity output)
[P0] Support admin route — verify all queries fast
[P1] NGO resource request handling (if time)
[P0] Manual demo flow test for admin module
```

### Person 4 (AI)
```
[P0] Map integration with admin/map-data endpoint
[P0] Location picker map in NewRequestForm
[P0] Verify full AI → matching → map flow end-to-end
[P0] SECOND INTEGRATION MERGE: feature/ai-integration → main
```

**Hour 5 milestone check (SECOND INTEGRATION MERGE):**
- [ ] Admin map shows all marker types
- [ ] AI flow fully connected to UI (no mocked data in demo)
- [ ] Resource gap alert visible in admin
- [ ] Demo Scenario A runs end-to-end without error
- [ ] Merge ALL feature branches → main

---

## HOUR 5–6: Testing + Demo Prep + Deploy

### All 4 persons together:

```
[P0] Run full Demo Scenario A (citizen → volunteer → completed)
[P0] Fix any critical bugs found in demo
[P0] Verify Vercel deployment works (check environment variables)
[P0] Seed demo data in production Supabase
[P0] Test demo flow on Vercel URL (not localhost)
[P1] Responsive check on mobile viewport
[P1] Run Demo Scenario B if time permits (NGO resource gap)
[P2] Polish UI details
[P0] Prepare presentation talking points
[P0] Confirm all 4 team members can access the live URL
```

**STOP CODING AT HOUR 5:30.**  
Use the last 30 minutes ONLY for rehearsing the demo.

---

## Time Budget Summary

| Hour | P2 Focus | P1 Focus | P3 Focus | P4 Focus |
|------|---------|---------|---------|---------|
| 0–1 | DB + Project Setup | Design System + Layout | Migrations 003+004 | Gemini + Types |
| 1–2 | Auth + Request Create | Auth Pages + Forms | Volunteer + NGO APIs | AI Route + Matching Alg |
| 2–3 | Request Lifecycle | Connect AI UI | Volunteer Accept/Complete | Matches Route |
| 3–4 | Polish + Test | Volunteer Dashboard | Admin Dashboard Data | Leaflet Map |
| 4–5 | Support + Demo Prep | Admin + Map Integration | Gap Detection | Integration Testing |
| 5–6 | Demo Rehearsal | Demo Rehearsal | Demo Rehearsal | Demo Rehearsal |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Gemini API key invalid/quota | Medium | High | Test in Hour 0, fallback works |
| PostGIS distance query slow | Low | Medium | Index on location (already planned) |
| Leaflet SSR crash | Medium | High | `dynamic(..., { ssr: false })` — test in Hour 3 |
| Merge conflict in package.json | High | Medium | Person 2 owns it, others REQUEST |
| Integration fails at Hour 5 | Medium | Critical | Progressive merges at Hour 3 reduce risk |
| Vercel deploy fails | Low | High | Test deploy at Hour 4, not Hour 5:45 |
| AI returns invalid JSON | High | Low | Zod validation + fallback handles it |
