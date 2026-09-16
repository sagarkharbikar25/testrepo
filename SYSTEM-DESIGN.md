# SYSTEM-DESIGN.md — Architecture & Data Flow

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        BROWSER                          │
│                   Next.js (Vercel)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  App Router  │  Components  │  React Hook Form   │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────┬───────────────────────┬──────────────────┘
               │  REST API calls        │ Supabase Auth
               │  (JWT in header)       │ (direct from browser)
               ▼                        ▼
┌──────────────────────┐    ┌────────────────────────────┐
│  Express.js (Render) │    │      Supabase Auth          │
│  Node.js + TypeScript│    │  (JWT issuance / session)   │
│  ┌─────────────────┐ │    └────────────────────────────┘
│  │ auth middleware │ │
│  │ role middleware │ │    ┌────────────────────────────┐
│  │ zod validation  │ │    │        Supabase             │
│  │ controllers     │ ├───►│   PostgreSQL (6 tables)     │
│  │ services        │ │    │   RLS enforced              │
│  │ matching logic  │ │    └────────────────────────────┘
│  └─────────────────┘ │
│  ┌─────────────────┐ │    ┌────────────────────────────┐
│  │  Gemini API     │ │    │      Supabase Storage       │
│  │  (P1, optional) │ │    │  (profile images, P1)       │
│  └─────────────────┘ │    └────────────────────────────┘
└──────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (requester)/
│   ├── dashboard/page.tsx
│   ├── requests/new/page.tsx
│   ├── requests/my/page.tsx
│   └── requests/[id]/page.tsx
├── (volunteer)/
│   ├── dashboard/page.tsx
│   └── requests/page.tsx
├── (ngo)/
│   └── dashboard/page.tsx
└── page.tsx (landing)

components/
├── shared/
│   ├── RequestCard.tsx
│   ├── StatusBadge.tsx
│   ├── UrgencyBadge.tsx
│   ├── StatusStepper.tsx
│   ├── CategoryIcon.tsx
│   └── ImpactTicker.tsx
├── requester/
│   ├── RequestForm.tsx
│   └── RequestTracker.tsx
└── volunteer/
    ├── RequestFeed.tsx
    ├── AcceptButton.tsx
    └── VolunteerStats.tsx
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant S as Supabase Auth
    participant A as Express API
    participant D as PostgreSQL

    B->>S: POST /auth/v1/signup (email, password)
    S-->>B: JWT access token + user ID
    B->>A: POST /api/auth/profile (JWT, name, role, location)
    A->>A: Verify JWT with Supabase secret
    A->>D: INSERT INTO profiles (id = user.id, role, ...)
    D-->>A: Profile created
    A-->>B: 201 Profile response

    Note over B: All future requests include Bearer JWT

    B->>A: GET /api/requests (Bearer JWT)
    A->>A: auth.middleware: verify + decode JWT
    A->>A: role.middleware: check role = volunteer
    A->>D: SELECT * FROM requests WHERE status = 'open'
    D-->>A: Request rows
    A-->>B: 200 Requests array
```

---

## Request Creation Flow

```mermaid
sequenceDiagram
    participant U as Requester (Browser)
    participant A as Express API
    participant D as PostgreSQL
    participant G as Gemini API (P1)

    U->>A: POST /api/requests (title, category, urgency, location)
    A->>A: Validate JWT (auth middleware)
    A->>A: Validate body with Zod schema
    opt AI Categorization (P1)
        A->>G: Categorize description
        G-->>A: { category, urgency_suggestion }
    end
    A->>D: INSERT INTO requests
    A->>D: INSERT INTO request_timeline (status='open')
    D-->>A: Request row
    A-->>U: 201 { data: request }
```

---

## Matching Flow

```mermaid
sequenceDiagram
    participant V as Volunteer (Browser)
    participant A as Express API
    participant D as PostgreSQL

    V->>A: GET /api/requests?lat=21.14&lng=79.08&urgency=HIGH
    A->>D: SELECT requests WHERE status='open' ORDER BY urgency, distance
    D-->>A: Sorted request list
    A-->>V: 200 Request list with distance_km

    V->>A: POST /api/matches/:requestId/accept
    A->>A: Check request still open (race condition guard)
    A->>D: INSERT INTO matches (request_id, volunteer_id)
    A->>D: UPDATE requests SET status='accepted'
    A->>D: INSERT INTO request_timeline (status='accepted')
    D-->>A: Success
    A-->>V: 201 Match created
```

---

## Status Update Flow

```mermaid
sequenceDiagram
    participant V as Volunteer
    participant A as Express API
    participant D as PostgreSQL

    V->>A: PATCH /api/requests/:id/status { status: 'in_progress' }
    A->>D: Verify volunteer is assigned to this request
    A->>A: Validate transition (accepted → in_progress)
    A->>D: UPDATE requests SET status = 'in_progress'
    A->>D: INSERT INTO request_timeline
    D-->>A: Updated row

    opt Status = completed
        A->>D: INSERT INTO impact_feed (anonymous display text)
    end

    A-->>V: 200 { status: 'in_progress' }
```

---

## Error Flow

```mermaid
flowchart TD
    REQ[Incoming API Request]
    REQ --> AUTH{JWT Valid?}
    AUTH -- No --> E401[401 UNAUTHORIZED]
    AUTH -- Yes --> ROLE{Role Permitted?}
    ROLE -- No --> E403[403 FORBIDDEN]
    ROLE -- Yes --> VAL{Zod Valid?}
    VAL -- No --> E400[400 VALIDATION_ERROR]
    VAL -- Yes --> BIZ{Business Logic OK?}
    BIZ -- Conflict --> E409[409 CONFLICT]
    BIZ -- Not Found --> E404[404 NOT_FOUND]
    BIZ -- OK --> DB[(Database)]
    DB -- Error --> E500[500 INTERNAL_ERROR]
    DB -- OK --> RES[200/201 Success Response]
```

---

## Matching Algorithm (Backend Logic)

```typescript
// services/matching.service.ts

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Haversine formula — returns distance in km
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const URGENCY_SCORE = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

function sortRequests(requests: Request[], volunteerLat: number, volunteerLng: number) {
  return requests
    .map(r => ({
      ...r,
      distance_km: calculateDistance(volunteerLat, volunteerLng, r.lat, r.lng),
      sort_score: URGENCY_SCORE[r.urgency] * 10 - (distance_km * 0.5)
    }))
    .sort((a, b) => b.sort_score - a.sort_score);
}
```

---

## Deployment Architecture

```
                    ┌──────────────────────┐
                    │        Vercel         │
                    │   civicbridge.vercel  │
                    │   Next.js Frontend    │
                    │   ─ SSR / Static      │
                    │   ─ Edge CDN          │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │        Render         │
                    │ civicbridge-api       │
                    │ .onrender.com         │
                    │   Express.js API      │
                    │   ─ Auto-deploy main  │
                    └──────────┬───────────┘
                               │ HTTPS (service role key)
                               ▼
                    ┌──────────────────────┐
                    │       Supabase        │
                    │  ─ PostgreSQL DB      │
                    │  ─ Auth service       │
                    │  ─ Storage (P1)       │
                    └──────────────────────┘
```

---

## Data Flow Summary

```
WRITE PATH:
Browser Form → Zod Validation (frontend)
→ Express API → Zod Validation (backend)
→ auth.middleware → role.middleware
→ Controller → Service
→ Supabase JS Client (service role)
→ PostgreSQL (RLS does NOT apply to service role)

READ PATH:
Browser → Express API → Controller
→ Supabase JS Client
→ PostgreSQL → Response
→ Optional: distance sort in-memory

AUTH PATH (direct):
Browser → Supabase Auth (bypass Express)
→ JWT returned to browser
→ JWT sent to Express on every API call
→ Express verifies JWT with Supabase JWT secret
```

---

## Race Condition Handling

The accept request flow has a race condition risk:
Two volunteers click Accept simultaneously.

**Solution:** `UNIQUE(request_id)` constraint on `matches` table.
- First INSERT succeeds
- Second INSERT fails with `23505 unique_violation`
- Backend catches → returns `409 CONFLICT`
- Frontend shows: "Sorry, this request was just accepted by someone else."
