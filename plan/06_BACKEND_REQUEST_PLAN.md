# 06 — NexoraLink Backend: Auth + Requester Plan
**Owner: Person 2**  
**Branch: `feature/backend-request`**

---

## Mission
Build the foundation layer: authentication, user profiles, help request lifecycle, request status transitions, feedback system, and all related Supabase Row Level Security.

This is the **most critical backend module** — all other modules depend on `profiles` and `help_requests` tables existing and working.

---

## Owned Files

```
src/app/api/auth/
├── register/route.ts
└── me/route.ts

src/app/api/requests/
├── route.ts                      — GET (list) + POST (create)
├── [id]/route.ts                 — GET (single)
├── [id]/analyze/route.ts         — POST (trigger AI — calls AI service)
├── [id]/status/route.ts          — PATCH (status transition)
└── [id]/cancel/route.ts          — POST (cancel)

src/app/api/feedback/
└── route.ts                      — POST (submit feedback)

src/lib/supabase/
├── client.ts                     — browser Supabase client
├── server.ts                     — server-side Supabase client (API routes)
└── middleware.ts                  — auth middleware helper

src/middleware.ts                  — Next.js middleware (route protection)

src/lib/validation/
├── request.schema.ts             — Zod schemas for request routes
└── auth.schema.ts                — Zod schemas for auth routes

src/types/
├── auth.ts                       — Profile, Role types
└── request.ts                    — HelpRequest, StatusHistory, Feedback types

supabase/migrations/
├── 001_extensions_profiles.sql
└── 002_help_requests.sql
```

---

## Files Person 2 Must NOT Modify

```
src/app/api/volunteers/**          — Person 3
src/app/api/ngos/**                — Person 3
src/app/api/resources/**           — Person 3
src/app/api/admin/**               — Person 3
src/app/api/ai/**                  — Person 4
src/app/api/matches/**             — Person 4
src/lib/gemini.ts                  — Person 4
src/lib/matching.ts                — Person 4
src/types/volunteer.ts             — Person 3
src/types/ngo.ts                   — Person 3
src/types/matching.ts              — Person 4
src/types/ai.ts                    — Person 4
supabase/migrations/003_*.sql      — Person 3
supabase/migrations/004_*.sql      — Person 3
supabase/migrations/005_*.sql      — Person 4
src/app/**/*.tsx                   — Person 1 (all UI pages)
src/components/**                  — Person 1
src/features/**                    — Person 1
```

---

## Implementation

### Step 1: Supabase Client Setup

**`src/lib/supabase/client.ts`** — browser client
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`src/lib/supabase/server.ts`** — server/API route client
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}
```

### Step 2: Middleware (route protection)

**`src/middleware.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* ... */ } }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Redirect unauthenticated users
  const protectedPaths = ['/dashboard', '/requester', '/volunteer', '/ngo', '/admin']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
```

### Step 3: Auth Routes

**`src/app/api/auth/register/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validation/auth.schema'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: { message: 'Validation failed', details: parsed.error.issues } }, { status: 400 })
    }

    const { email, password, full_name, role, phone } = parsed.data
    const supabase = createServerSupabaseClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) return NextResponse.json({ error: { message: authError.message } }, { status: 400 })

    // Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user!.id,
      full_name,
      email,
      role,
      phone: phone || null,
    })

    if (profileError) return NextResponse.json({ error: { message: profileError.message } }, { status: 500 })

    return NextResponse.json({ data: { user_id: authData.user!.id, role } }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: { message: 'Server error' } }, { status: 500 })
  }
}
```

### Step 4: Request Routes

**`src/app/api/requests/route.ts`**
```typescript
// POST — create request
// GET — list requests (role-filtered)

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

  const body = await req.json()
  const parsed = createRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { description, location, address } = parsed.data

  const point = `POINT(${location.lng} ${location.lat})`

  const { data: request, error } = await supabase
    .from('help_requests')
    .insert({
      requester_id: user.id,
      description,
      location: point,
      address,
      status: 'REQUESTED',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: { message: error.message } }, { status: 500 })

  // Insert initial status history
  await supabase.from('request_status_history').insert({
    request_id: request.id,
    from_status: null,
    to_status: 'REQUESTED',
    changed_by: user.id,
  })

  return NextResponse.json({ data: request }, { status: 201 })
}
```

### Step 5: Status Transition Guard

**`src/app/api/requests/[id]/status/route.ts`**
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

// Validate transition before UPDATE
```

### Step 6: Feedback + Trust Score Update

**`src/app/api/feedback/route.ts`**
```typescript
// After inserting feedback row, recalculate volunteer trust_score:
const { data: allFeedback } = await supabase
  .from('feedback')
  .select('rating')
  .eq('to_user_id', to_user_id)

const avg = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length

await supabase.from('volunteers').update({ trust_score: avg }).eq('id', to_user_id)
```

---

## Validation Schemas

**`src/lib/validation/auth.schema.ts`**
```typescript
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role: z.enum(['requester', 'volunteer', 'ngo']),
  phone: z.string().optional(),
})
```

**`src/lib/validation/request.schema.ts`**
```typescript
import { z } from 'zod'

export const createRequestSchema = z.object({
  description: z.string().min(20, 'Describe your need in at least 20 characters'),
  location: z.object({ lat: z.number(), lng: z.number() }),
  address: z.string().optional(),
})

export const statusUpdateSchema = z.object({
  status: z.enum(['ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED']),
  note: z.string().optional(),
})
```

---

## Hour-by-Hour Plan

| Hour | Tasks |
|------|-------|
| 0–1 | Run migrations 001 + 002, set up Supabase clients, middleware |
| 1–2 | POST /api/auth/register, GET /api/auth/me |
| 2–3 | POST /api/requests, GET /api/requests, GET /api/requests/:id |
| 3–4 | PATCH /api/requests/:id/status (with transition guard), POST /api/requests/:id/cancel |
| 4–5 | POST /api/feedback, request history endpoint |
| 5–6 | Test all endpoints with curl/Postman, fix edge cases |

---

## Handoff to Other Team Members

**To Person 1 (Frontend):**
- Supabase client exported from `src/lib/supabase/client.ts`
- Auth: use `supabase.auth.signInWithPassword()` directly
- All request types in `src/types/request.ts`

**To Person 4 (AI):**
- `POST /api/requests/:id/analyze` route exists but calls `src/lib/gemini.ts` which Person 4 owns
- Person 2 creates the route shell; Person 4 fills in the Gemini call

**To Person 3 (BE-M):**
- `profiles` table ready with `id`, `role`, `location` columns
- `help_requests` table ready with `category`, `urgency`, `status` columns
