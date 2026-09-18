# Member 2: Backend Developer 1 (Core APIs & AI)
**Branch:** `feature/backend-core`
**Owned files:**
```
src/app/api/auth/**
src/app/api/requests/**
src/app/api/ai/**
src/app/api/matches/**
src/lib/supabase/client.ts, server.ts
src/lib/gemini.ts
src/lib/matching.ts
src/middleware.ts
src/types/request.ts, ai.ts, matching.ts
src/lib/validation/auth.schema.ts, request.schema.ts, ai.schema.ts
```
**Do not touch:** `src/app/api/volunteers/**`, `ngos/**`, `resources/**`, `admin/**` (Member 3) · `src/app/**/*.tsx`, `src/components/**`, `src/features/**` (Member 4) · `supabase/migrations/**` (Member 1)

> **Heads up on scope:** you own more surface area than anyone else on the team — auth, the whole request lifecycle, AI, and matching. If you get ahead of schedule elsewhere, this is the module that needs it. If you're behind at Hour 3, cut P1/P2 items (feedback endpoint, pagination) before cutting anything in the P0 list below.

**Depends on:** Migrations 001–002 (your tables) from Member 1, running before Hour 1.
**Provides to:** Member 3 needs `profiles` + `help_requests` to exist. Member 4 needs your route responses to match the shapes below exactly — don't change a field name without telling them.

---

## Supabase Clients (Hour 0)

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      get(name) { return cookieStore.get(name)?.value },
      set(name, value, options) { cookieStore.set({ name, value, ...options }) },
      remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
    }}
  )
}
```

## Middleware — route protection (Hour 1)

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(/* ... */)
  const { data: { session } } = await supabase.auth.getSession()
  const protectedPaths = ['/dashboard', '/requester', '/volunteer', '/ngo', '/admin']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
  if (!session && isProtected) return NextResponse.redirect(new URL('/login', request.url))
  return response
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'] }
```

---

## Auth Routes

**`POST /api/auth/register`**
```
Body: { email, password (min 8), full_name, role: 'requester'|'volunteer'|'ngo', phone? }
Response 201: { data: { user_id, role } }
Errors: 400 validation, 409 email exists
Flow: supabase.auth.signUp() → insert profiles row
```

**`GET /api/auth/me`** → `{ data: Profile }` (login itself uses Supabase client SDK directly, no route needed)

---

## Request Lifecycle Routes

**`POST /api/requests`**
```
Body: { description (min 20 chars), location: {lat, lng}, address? }
Response 201: { data: HelpRequest }
Flow: insert help_requests (status='REQUESTED') → insert request_status_history
```

**`GET /api/requests`** — role-filtered list (`?status=&category=&limit=&offset=`)
- requester → own requests only
- volunteer → nearby unassigned (or just unfiltered list for MVP if you're short on time — Member 3 owns the *nearby* version at `/api/volunteers/requests`)
- admin → all

**`GET /api/requests/:id`** → `{ data: { request, status_history, matches? } }`

**`POST /api/requests/:id/analyze`**
```
Response 200: { data: AIAnalysisResult }
Flow: fetch description → call gemini.ts → Zod validate → UPDATE ai_* fields, status='AI_ANALYZED' → insert status_history
```

**`PATCH /api/requests/:id/status`** — status transition guard. **This is the one place the original draft was wrong — CANCELLED is reachable from every non-terminal state, not just chained linearly:**

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  REQUESTED:    ['AI_ANALYZED', 'CANCELLED'],
  AI_ANALYZED:  ['MATCHING', 'CANCELLED'],
  MATCHING:     ['ASSIGNED', 'CANCELLED'],
  ASSIGNED:     ['ACCEPTED', 'CANCELLED'],
  ACCEPTED:     ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS:  ['COMPLETED', 'CANCELLED'],
  COMPLETED:    [],
  CANCELLED:    [],
}
```
Reject any transition not in the current status's array with `400`.

**`POST /api/requests/:id/cancel`** → sets `status='CANCELLED'` regardless of current state (except COMPLETED/CANCELLED) — role: requester (own) or admin.

**`POST /api/feedback`** *(P1 — build after everything above works)*
```
Body: { request_id, to_user_id, rating (1-5), comment? }
Flow: insert feedback → recompute avg rating for to_user_id → UPDATE volunteers.trust_score
```

---

## AI Route

**`POST /api/ai/analyze-request`**
```
Body: { request_id, description, location: {lat,lng} }
Response 200: { data: AIAnalysisResult }

AIAnalysisResult: {
  category: 'medical'|'food'|'transportation'|'education'|'shelter'|'general'
  task: string
  urgency: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'
  skills_needed: string[]
  summary: string
  confidence: number  // 0–1
}

Fallback (Gemini fails or times out — MUST NOT crash the request flow):
  { category: 'general', urgency: 'MEDIUM', task: 'general_assistance',
    skills_needed: [], summary: description.slice(0, 100), confidence: 0 }
```
Test the fallback deliberately in Hour 2 by temporarily breaking `GEMINI_API_KEY` — don't discover it's broken during the demo.

---

## Matching Route + Algorithm

**`GET /api/matches/:requestId`**
```
Flow:
  1. Fetch request (category, urgency, location)
  2. ST_DWithin candidates within 10km (volunteers + ngos)
  3. Score each candidate
  4. Sort by total_score DESC, store top 5 in matches table
  5. UPDATE help_requests SET status='MATCHING'

Response 200: { data: { volunteers: MatchCandidate[], ngos: MatchCandidate[] } }
```

```typescript
// src/lib/matching.ts
score = (
  distanceScore * 0.30 +   // inverse distance, closer = higher
  skillScore    * 0.30 +   // exact category/skill match = 1.0
  availScore    * 0.20 +   // is_available = 1.0
  urgencyScore  * 0.10 +   // CRITICAL request bumps this
  trustScore    * 0.10     // trust_score / 5.0
) * 100
```

---

## Validation Schemas

```typescript
// src/lib/validation/auth.schema.ts
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role: z.enum(['requester', 'volunteer', 'ngo']),
  phone: z.string().optional(),
})

// src/lib/validation/request.schema.ts
export const createRequestSchema = z.object({
  description: z.string().min(20),
  location: z.object({ lat: z.number(), lng: z.number() }),
  address: z.string().optional(),
})
export const statusUpdateSchema = z.object({
  status: z.enum(['ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED']),
  note: z.string().optional(),
})
```

---

## Hour-by-Hour

| Hour | Tasks |
|------|-------|
| 0–1 | Supabase clients, middleware, wait for migrations 001–002 |
| 1–2 | `/api/auth/register`, `/api/auth/me`, `POST /api/requests` |
| 2–3 | `GET /api/requests`, `GET /api/requests/:id`, `/api/ai/analyze-request` (test with real Gemini call) |
| 3–4 | `PATCH /api/requests/:id/status` (transition guard), `/api/requests/:id/cancel`, start matching.ts |
| 4–5 | `GET /api/matches/:requestId` fully working, test the CRITICAL fallback path |
| 5–6 | `/api/feedback` if time remains, otherwise: test all endpoints, fix edge cases |

## Pre-merge checklist (Hour 3 and Hour 5)
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Register → profile row appears in Supabase
- [ ] Create request → analyze → status becomes `AI_ANALYZED` with real category/urgency
- [ ] Invalid status transition returns 400, not a silent success
- [ ] `git diff --name-only HEAD` shows only your owned files
