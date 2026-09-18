# Member 3: Backend Developer 2 (Management APIs)
**Branch:** `feature/backend-management`
**Owned files:**
```
src/app/api/volunteers/**
src/app/api/ngos/**
src/app/api/resources/**
src/app/api/admin/**
src/types/volunteer.ts, ngo.ts, resource.ts, admin.ts
src/lib/validation/volunteer.schema.ts, ngo.schema.ts, resource.schema.ts
```
**Do not touch:** `src/app/api/auth/**`, `requests/**`, `ai/**`, `matches/**`, `src/lib/supabase/**` (Member 2) · `src/app/**/*.tsx`, `components/**`, `features/**` (Member 4) · `supabase/migrations/**` (Member 1)

**Depends on:** `profiles`, `help_requests` (Member 2's tables) + `volunteers`, `ngos`, `resources`, and the `get_nearby_requests`/`get_resource_gaps` RPC functions (Member 1's migrations 003–004) — confirm with Member 1 these RPCs exist before you start `GET /api/volunteers/requests` or `GET /api/admin/dashboard`, they will 500 without them.

---

## Volunteer Routes

**`POST /api/volunteers/profile`**
```
Body: { bio?, is_available, radius_km?, location?, skills: [{category, skill_name}] }
Flow: upsert volunteers row → delete + re-insert volunteer_skills
Response 200: { data: VolunteerProfile }
```

**`GET /api/volunteers/requests`** — nearby open requests
```
Flow: get volunteer's location+radius → call get_nearby_requests RPC (Member 1)
Response 200: { data: Array<HelpRequest & { match_score? }> }
```

**`POST /api/volunteers/requests/:id/accept`**
```
Flow: check status is MATCHING/ASSIGNED/AI_ANALYZED and not already assigned to someone else
      → UPDATE status='ACCEPTED', assigned_volunteer_id=user.id → insert status_history
Response 200: { data: { request_id, status: 'ACCEPTED' } }
Errors: 404 not found, 400 wrong state, 409 already taken by another volunteer
```

**`POST /api/volunteers/requests/:id/start`** → status='IN_PROGRESS'
**`POST /api/volunteers/requests/:id/complete`** → status='COMPLETED', completed_at=now(), volunteers.total_completed += 1
**`PATCH /api/volunteers/availability`** → `{ is_available: boolean }`

---

## NGO & Resource Routes

**`POST /api/ngos/profile`** → upsert `{ organization_name, description?, services, registration_number?, website? }`
**`GET /api/ngos`** → list all NGOs
**`POST /api/resources`** → verify caller's `profiles.role === 'ngo'` first, then insert
```
Body: { name, category, description?, quantity_available, quantity_total, unit?, location, address? }
```
**`PATCH /api/resources/:id`** → update `{ quantity_available?, is_active? }`, only if caller owns the resource's NGO
**`GET /api/resources`** → filterable by `category`, `ngo_id`, `available_only`

---

## Admin Routes

**`GET /api/admin/map-data`**
```
Response 200: {
  data: {
    requests:   Array<{ id, lat, lng, status, urgency, category }>
    volunteers: Array<{ id, lat, lng, is_available, name }>
    ngos:       Array<{ id, lat, lng, name, is_verified }>
    resources:  Array<{ id, lat, lng, name, category, quantity_available }>
  }
}
```

**`GET /api/admin/dashboard`**
```
Response 200: {
  data: {
    total_users, total_volunteers, total_ngos,
    active_requests, completed_requests, available_resources,
    requests_by_status: Record<string, number>,
    requests_by_category: Record<string, number>,
    resource_gaps: ResourceGap[]   // from get_resource_gaps() RPC
  }
}
```
Run the counts via `Promise.all(...)` — sequential awaits here will visibly slow the admin page during the demo.

**`PATCH /api/admin/verify/:type/:id`** — **this was ambiguous in the original draft; here's the actual fix.**

`type` is `'volunteer'` or `'ngo'`. The two types touch different tables because `volunteers` has **no** `is_verified` column — only `profiles` and `ngos` do:

```typescript
export async function PATCH(req: NextRequest, { params }: { params: { type: string; id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauth()

  const { data: caller } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (caller?.role !== 'admin') return NextResponse.json({ error: { message: 'Admin only' } }, { status: 403 })

  const { is_verified } = await req.json()
  const { type, id } = params

  // Always update profiles.is_verified — this is the field the UI badge reads for both types
  const { error: profileErr } = await supabase.from('profiles').update({ is_verified }).eq('id', id)
  if (profileErr) return serverError(profileErr.message)

  // NGOs additionally carry their own is_verified column — keep both in sync
  if (type === 'ngo') {
    const { error: ngoErr } = await supabase.from('ngos').update({ is_verified }).eq('id', id)
    if (ngoErr) return serverError(ngoErr.message)
  }
  // type === 'volunteer' needs no second table — volunteers has no is_verified column

  return NextResponse.json({ data: { id, type, is_verified } })
}
```

---

## Validation

```typescript
// src/lib/validation/volunteer.schema.ts
export const volunteerProfileSchema = z.object({
  bio: z.string().optional(),
  is_available: z.boolean(),
  radius_km: z.number().min(1).max(50).optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  skills: z.array(z.object({
    category: z.enum(['medical','food','transportation','education','shelter','general']),
    skill_name: z.string().min(2),
  })).optional(),
})
```

---

## Hour-by-Hour

| Hour | Tasks |
|------|-------|
| 0–1 | Confirm migrations 003–004 + both RPCs exist (ping Member 1) |
| 1–2 | `POST /api/volunteers/profile`, `GET /api/volunteers/requests` |
| 2–3 | accept/start/complete routes, `PATCH availability` |
| 3–4 | NGO profile, `GET /api/ngos`, `POST/GET /api/resources` |
| 4–5 | Admin dashboard (parallel queries) + `get_resource_gaps` wiring + map-data route |
| 5–6 | `PATCH /api/admin/verify/:type/:id`, test all endpoints, fix edge cases |

## Pre-merge checklist
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `GET /api/volunteers/requests` returns real nearby rows against seed data
- [ ] Accept sets `assigned_volunteer_id` and rejects a second volunteer's accept with 409
- [ ] `GET /api/admin/dashboard` returns `resource_gaps` with a real `gap_severity`, not empty
- [ ] Verify endpoint updates the right table(s) for both `volunteer` and `ngo`
- [ ] `git diff --name-only HEAD` shows only your owned files
