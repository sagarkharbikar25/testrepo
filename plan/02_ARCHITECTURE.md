# 02 — NexoraLink Architecture

## Architecture Style
**Monorepo, Monolith-first** — Single Next.js app with API Routes as the backend layer.  
No microservices. No separate Express server unless Gemini streaming specifically requires it (it does not for this MVP).

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│   Next.js App Router (React + TypeScript + Tailwind)        │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│   │Requester │ │Volunteer │ │   NGO    │ │    Admin     │  │
│   │  Pages   │ │  Pages   │ │  Pages   │ │   Pages      │  │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │
│        │             │             │               │          │
│   ┌────▼─────────────▼─────────────▼───────────────▼──────┐  │
│   │          Shared: Leaflet Map + Auth Context            │  │
│   └─────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ fetch / server actions
┌─────────────────────────▼───────────────────────────────────┐
│                  NEXT.JS API ROUTES                         │
│                  /api/*  (server-side)                      │
│                                                             │
│  /api/auth/*          /api/requests/*                       │
│  /api/volunteers/*    /api/ngos/*                           │
│  /api/resources/*     /api/matches/*                        │
│  /api/ai/*            /api/admin/*                          │
│  /api/feedback/*                                            │
└──────────┬──────────────────┬──────────────────────────────┘
           │                  │
    ┌──────▼──────┐    ┌──────▼──────┐
    │  Supabase   │    │  Gemini     │
    │ PostgreSQL  │    │    API      │
    │  + Auth     │    │  (Google)   │
    └─────────────┘    └─────────────┘
```

---

## Next.js App Router Structure

```
src/
├── app/                          # Pages (Next.js App Router)
│   ├── layout.tsx                # Root layout (SHARED — frozen after setup)
│   ├── page.tsx                  # Landing page [FE]
│   ├── (auth)/
│   │   ├── login/page.tsx        [FE]
│   │   └── register/page.tsx     [FE]
│   ├── (requester)/
│   │   ├── dashboard/page.tsx    [FE]
│   │   ├── request/new/page.tsx  [FE]
│   │   └── request/[id]/page.tsx [FE]
│   ├── (volunteer)/
│   │   ├── dashboard/page.tsx    [FE]
│   │   └── profile/page.tsx      [FE]
│   ├── (ngo)/
│   │   ├── dashboard/page.tsx    [FE]
│   │   └── resources/page.tsx    [FE]
│   ├── (admin)/
│   │   └── dashboard/page.tsx    [FE]
│   └── api/                      # API Routes
│       ├── auth/                 [BE-R]
│       ├── requests/             [BE-R]
│       ├── volunteers/           [BE-M]
│       ├── ngos/                 [BE-M]
│       ├── resources/            [BE-M]
│       ├── admin/                [BE-M]
│       ├── ai/                   [AI]
│       ├── matches/              [AI]
│       └── feedback/             [BE-R]
├── components/                   # Shared UI components [FE owns]
├── features/                     # Feature-specific logic
│   ├── auth/                     [FE + BE-R boundary]
│   ├── requester/                [FE consumes BE-R]
│   ├── volunteer/                [FE consumes BE-M]
│   ├── ngo/                      [FE consumes BE-M]
│   ├── admin/                    [FE consumes BE-M + AI]
│   ├── matching/                 [AI owns logic]
│   └── map/                      [AI owns Leaflet integration]
├── lib/
│   ├── supabase/                 [BE-R sets up, others read]
│   ├── gemini.ts                 [AI owns]
│   └── utils.ts                  [SHARED — minimal, frozen]
└── types/                        [SHARED — each person owns their file]
    ├── auth.ts                   [BE-R]
    ├── request.ts                [BE-R]
    ├── volunteer.ts              [BE-M]
    ├── ngo.ts                    [BE-M]
    ├── resource.ts               [BE-M]
    ├── matching.ts               [AI]
    ├── ai.ts                     [AI]
    └── admin.ts                  [BE-M]
```

---

## Data Flow: Request Creation

```
User types free text
        │
        ▼
POST /api/ai/analyze-request
        │
        ▼
Gemini API → structured JSON
(category, urgency, task, skills_needed)
        │
        ▼
Validate with Zod schema
        │
        ▼
POST /api/requests (with AI analysis attached)
        │
        ▼
Insert help_requests row (status: AI_ANALYZED)
        │
        ▼
GET /api/matches/:requestId
        │
        ▼
Matching algorithm runs:
  - Fetch nearby volunteers (PostGIS distance)
  - Score each: distance(30%) + skill(30%) + availability(20%) + urgency(10%) + trust(10%)
  - Return ranked list
        │
        ▼
Frontend shows match results
Volunteer notified (polling or page refresh)
```

---

## Data Flow: Volunteer Acceptance

```
Volunteer views dashboard
        │
        ▼
GET /api/volunteers/requests (nearby, unassigned)
        │
        ▼
Volunteer clicks Accept
        │
        ▼
POST /api/volunteer/requests/:id/accept
        │
        ▼
Update help_requests.status → ACCEPTED
Update help_requests.assigned_volunteer_id
        │
        ▼
Requester dashboard polls/refreshes → sees ACCEPTED
```

---

## AI Integration Architecture

```
Gemini API wrapper (src/lib/gemini.ts)
        │
        ├── analyzeRequest(text, location) → AIAnalysisResult
        │       Prompt → structured JSON → Zod validation
        │       Fallback: { category: 'general', urgency: 'MEDIUM', ... }
        │
        └── (No other Gemini calls for MVP)

AIAnalysisResult schema:
{
  category: 'medical' | 'food' | 'transportation' | 'education' | 'shelter' | 'general',
  task: string,
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  skills_needed: string[],
  summary: string,
  confidence: number
}
```

---

## Matching Algorithm (Deterministic — No ML)

```typescript
// src/lib/matching.ts [AI owns]
score = (
  distanceScore * 0.30 +   // closer = higher (inverse distance)
  skillScore    * 0.30 +   // exact skill match = 1.0
  availScore    * 0.20 +   // is_available = 1.0
  urgencyScore  * 0.10 +   // CRITICAL bumps urgency multiplier
  trustScore    * 0.10     // trust_score / 5.0
) * 100
```

---

## Database Architecture

Single Supabase PostgreSQL instance.  
PostGIS extension enabled for geospatial queries (distance-based matching).

See `03_DATABASE_SCHEMA.md` for full schema.

---

## Authentication Flow

- Supabase Auth (email/password for MVP)
- On register: user picks role (requester / volunteer / ngo)
- On login: `profiles` row read to determine role
- Middleware: `src/middleware.ts` checks session and redirects by role
- Row Level Security enforced at DB level

---

## Deployment Architecture

```
GitHub repo
    │
    ├── Vercel (auto-deploy from main)
    │       Next.js app + API Routes
    │       Environment: NEXT_PUBLIC_SUPABASE_URL, GEMINI_API_KEY, etc.
    │
    └── Supabase (managed)
            PostgreSQL + Auth + Storage (if needed)
            Migrations run from local CLI before demo
```

No Render deployment needed — all backend logic in Next.js API Routes.

---

## Key Architectural Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Separate backend? | No — Next.js API Routes | Saves setup time, single deploy |
| ORM? | Supabase JS client directly | No Prisma overhead in 6 hours |
| Real-time? | Polling (5s interval) | WebSockets add complexity; polling sufficient for demo |
| ML matching? | No — weighted algorithm | Deterministic, debuggable, fast to build |
| Maps? | Leaflet + OSM | Free, no API key, good React support |
| AI model? | gemini-1.5-flash | Fast, cheap, sufficient for classification |
| Auth? | Supabase Auth | Already in stack, handles JWT |
| Validation? | Zod | Runtime schema validation, TypeScript-first |
