# TRD.md — Technical Requirements Document

## Technical Objectives

1. Working MVP in 6 hours with 4 parallel developers
2. Zero single points of failure on optional services
3. Clean REST API with type-safe contracts shared between frontend and backend
4. Supabase RLS enforced — no unauthorized data access
5. Deployed on Vercel + Render before presentation

---

## Final Tech Stack

### Frontend
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + fast routing + Vercel native |
| Language | TypeScript | Type safety across stack |
| Styling | Tailwind CSS | Rapid, utility-first |
| Components | shadcn/ui | Pre-built accessible components |
| Icons | Lucide React | Lightweight, consistent |
| Forms | React Hook Form + Zod | Validation without overhead |
| State | React useState/useContext | No Redux needed for MVP |
| HTTP | fetch (native) | No extra library needed |
| Map (P1) | react-leaflet | Free, no API key needed (fallback) |

### Backend
| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js 20 | Stable LTS |
| Framework | Express.js | Minimal, fast setup |
| Language | TypeScript | Shared types with frontend |
| Validation | Zod | Runtime + compile-time safety |
| Auth | Supabase JWT verification | No custom auth logic |
| ORM | **Supabase JS Client (no Prisma)** | See Prisma Decision below |

### Database / Services
| Service | Purpose |
|---|---|
| Supabase PostgreSQL | Primary database |
| Supabase Auth | User authentication |
| Supabase Storage (P1) | Profile images / resource photos |
| Gemini API (P1) | Request categorization |
| Google Maps / Leaflet (P1) | Map view |

---

## Prisma Decision

**Decision: NO Prisma. Use Supabase JS Client directly.**

Reasons:
- Prisma requires schema generation, migration step, and client generation — costs 20–30 mins of setup time
- Supabase JS client works immediately with auto-generated TypeScript types
- RLS is enforced at DB level regardless of ORM
- For 6 hours with 4 members, Supabase client is faster and safer
- Prisma provides value at larger scale — not needed for hackathon MVP

Backend uses `@supabase/supabase-js` with the **service role key** (server-side only).

---

## Architecture Overview

```
Browser (Next.js)
      │
      ├── /api/* → Express.js (Render)
      │               │
      │               ├── Supabase JS Client (service role)
      │               │       │
      │               │       └── PostgreSQL (Supabase)
      │               │
      │               ├── Gemini API (P1, optional)
      │               └── Google Maps Geocoding (P1, optional)
      │
      └── Supabase Auth (direct from browser for login/signup)
```

---

## Frontend Architecture

```
apps/web/
├── app/
│   ├── (auth)/          # login, register — Member 1
│   ├── (requester)/     # request creation, tracking — Member 1
│   ├── (volunteer)/     # request feed, accept, status — Member 1
│   ├── (ngo)/           # NGO dashboard, assign — Member 1
│   └── layout.tsx       # root layout — Member 1
├── components/
│   ├── ui/              # shadcn/ui (auto-generated, no owner edits)
│   ├── shared/          # RequestCard, StatusBadge, UrgencyTag — Member 1
│   ├── requester/       # RequestForm, RequestTracker — Member 1
│   └── volunteer/       # RequestFeed, AcceptButton, Dashboard — Member 1
├── lib/
│   ├── api.ts           # API fetch wrapper — Member 1
│   ├── types.ts         # Shared TypeScript types — Member 1
│   └── supabase.ts      # Supabase browser client — Member 1
└── hooks/
    ├── useRequests.ts   # Member 1
    └── useVolunteer.ts  # Member 1
```

---

## Backend Architecture

```
apps/api/
├── src/
│   ├── index.ts              # Express app entry
│   ├── routes/
│   │   ├── auth.routes.ts    # /api/auth/*
│   │   ├── request.routes.ts # /api/requests/*
│   │   ├── resource.routes.ts# /api/resources/*
│   │   ├── match.routes.ts   # /api/matches/*
│   │   └── user.routes.ts    # /api/users/*
│   ├── controllers/
│   │   ├── request.controller.ts
│   │   ├── resource.controller.ts
│   │   ├── match.controller.ts
│   │   └── user.controller.ts
│   ├── services/
│   │   ├── matching.service.ts   # Core matching logic
│   │   ├── gemini.service.ts     # AI categorization (P1)
│   │   └── location.service.ts   # Geo distance calculation
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── role.middleware.ts    # Role-based access
│   │   └── validate.middleware.ts# Zod validation
│   ├── schemas/
│   │   └── request.schema.ts    # Zod schemas
│   └── lib/
│       └── supabase.ts          # Supabase admin client
```

---

## Authentication Flow

1. User signs up/logs in via **Supabase Auth** directly from browser
2. Supabase returns a **JWT access token**
3. Frontend stores token in memory / Supabase session
4. Every API request sends `Authorization: Bearer <token>` header
5. Backend `auth.middleware.ts` verifies JWT using Supabase JWT secret
6. Decoded user ID extracted, role looked up from `profiles` table
7. `role.middleware.ts` checks role matches route requirement

---

## Authorization Matrix

| Route | Requester | Volunteer | NGO Admin |
|---|---|---|---|
| POST /api/requests | ✅ | ❌ | ✅ |
| GET /api/requests | ✅ (own) | ✅ (all open) | ✅ (all) |
| POST /api/matches/:id/accept | ❌ | ✅ | ✅ |
| PATCH /api/requests/:id/status | ❌ | ✅ (assigned) | ✅ |
| POST /api/resources | ✅ | ✅ | ✅ |
| GET /api/users/profile | ✅ | ✅ | ✅ |

---

## Validation Strategy

- All request bodies validated with **Zod** schemas in `validate.middleware.ts`
- Zod schemas live in `apps/api/src/schemas/`
- Same schemas (types only) shared via `packages/shared/types.ts`
- Frontend uses same Zod schemas for React Hook Form validation

---

## Error Handling

All API errors return:
```json
{
  "error": "HUMAN_READABLE_MESSAGE",
  "code": "ERROR_CODE",
  "status": 400
}
```

Standard error codes:
- `VALIDATION_ERROR` — Zod validation failed
- `UNAUTHORIZED` — missing/invalid JWT
- `FORBIDDEN` — role not allowed
- `NOT_FOUND` — resource doesn't exist
- `CONFLICT` — request already accepted
- `INTERNAL_ERROR` — unexpected server error

---

## Security

- Service role key NEVER exposed to frontend
- All frontend uses anon key only
- RLS policies on every table in Supabase
- CORS whitelist: only Vercel frontend URL + localhost:3000
- Input sanitization via Zod (no raw SQL injection possible via supabase-js)
- Environment variables never committed

---

## External APIs

### Gemini API (P1)
- Used for: auto-categorize request description
- Fallback: user manually selects category from dropdown
- Integration: backend `gemini.service.ts` calls Gemini only if `GEMINI_API_KEY` is present

### Google Maps / Leaflet (P1)
- Used for: map display of nearby requests
- Fallback: text-based location display
- react-leaflet used (no API key required) as default fallback to Google Maps

---

## Environment Variables

### Frontend (`apps/web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=https://civicbridge-api.onrender.com
NEXT_PUBLIC_GOOGLE_MAPS_KEY=   # optional P1
```

### Backend (`apps/api/.env`)
```
PORT=8080
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
GEMINI_API_KEY=                # optional P1
CORS_ORIGIN=https://civicbridge.vercel.app
NODE_ENV=production
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | civicbridge.vercel.app |
| Backend | Render | civicbridge-api.onrender.com |
| Database/Auth | Supabase | supabase.com project |

---

## Git Workflow

### Branches
```
main
├── member1-frontend          # Only touches apps/web
├── member2-database          # Only touches supabase/
├── member3-backend-core      # Specific files in apps/api/src
└── member4-backend-features  # Specific files in apps/api/src
```

### Commit Convention
```
feat: add request creation form
fix: correct urgency enum validation
chore: add seed data for demo
style: update RequestCard urgency colors
```

### Merge Rules
- No direct push to `main` until Hour 5.
- Each member merges their own permanent branch at the end of the sprint.
- Since file paths are mutually exclusive (M1: web, M2: DB, M3/M4: distinct API files), Git will auto-merge with zero conflicts.

---

## Technical Risks

| Risk | Mitigation |
|---|---|
| Supabase cold start | Use persistent connections, test early |
| Render cold start (15s) | Ping service at start of demo |
| CORS blocking API | Set CORS_ORIGIN exactly, test before presentation |
| JWT secret mismatch | Verify Supabase JWT secret in backend env |
| Gemini rate limit | Rate limit guard + fallback to manual category |
| Type mismatch frontend/backend | Share types via packages/shared/types.ts |
| Merge conflict on shared files | Strict file ownership (see FILE-OWNERSHIP section) |

---

## Fallback Strategy

| Feature | Primary | Fallback |
|---|---|---|
| Maps | Google Maps | react-leaflet (free, no key) |
| AI categorization | Gemini | Manual category dropdown |
| Location | GPS/Geocoding | Manual text input |
| Real-time updates | Polling every 30s | Manual refresh button |
| Image upload | Supabase Storage | Text-only requests |
