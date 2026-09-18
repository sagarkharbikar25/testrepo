# 07 — NexoraLink Backend: Volunteer + NGO + Admin Plan
**Owner: Person 3**  
**Branch: `feature/backend-management`**

---

## Mission
Build the volunteer management system, NGO and resource management, and the admin dashboard data layer. This module depends on `profiles` and `help_requests` existing (from Person 2's migrations), but is otherwise independent.

---

## Owned Files

```
src/app/api/volunteers/
├── profile/route.ts               — POST (create/update volunteer profile)
├── requests/route.ts              — GET (nearby requests for volunteer)
├── availability/route.ts          — PATCH (toggle availability)
└── requests/[id]/
    ├── accept/route.ts
    ├── start/route.ts
    └── complete/route.ts

src/app/api/ngos/
├── profile/route.ts               — POST (create/update NGO profile)
└── route.ts                       — GET (list all NGOs)

src/app/api/resources/
├── route.ts                       — GET (list) + POST (create)
└── [id]/route.ts                  — PATCH (update quantity)

src/app/api/admin/
├── dashboard/route.ts             — GET (stats + gap detection)
├── map-data/route.ts              — GET (all locations)
└── verify/[type]/[id]/route.ts    — PATCH (verify volunteer/NGO)

src/lib/validation/
├── volunteer.schema.ts
├── ngo.schema.ts
└── resource.schema.ts

src/types/
├── volunteer.ts
├── ngo.ts
├── resource.ts
└── admin.ts

supabase/migrations/
├── 003_volunteers.sql
└── 004_ngos_resources.sql
```

---

## Files Person 3 Must NOT Modify

```
src/app/api/auth/**                — Person 2
src/app/api/requests/**            — Person 2
src/app/api/feedback/**            — Person 2
src/app/api/ai/**                  — Person 4
src/app/api/matches/**             — Person 4
src/lib/supabase/**                — Person 2 (read only, don't change)
src/lib/gemini.ts                  — Person 4
src/lib/matching.ts                — Person 4
src/types/auth.ts                  — Person 2
src/types/request.ts               — Person 2
src/types/matching.ts              — Person 4
src/types/ai.ts                    — Person 4
supabase/migrations/001_*.sql      — Person 2
supabase/migrations/002_*.sql      — Person 2
supabase/migrations/005_*.sql      — Person 4
src/app/**/*.tsx                   — Person 1
src/components/**                  — Person 1
src/features/**                    — Person 1
```

---

## Implementation

### Volunteer Profile API

**`src/app/api/volunteers/profile/route.ts`**
```typescript
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauth()

  const body = await req.json()
  const parsed = volunteerProfileSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error)

  const { bio, is_available, radius_km, location, skills } = parsed.data

  // Upsert volunteer row
  const locationPoint = location ? `POINT(${location.lng} ${location.lat})` : null

  const { error: volError } = await supabase.from('volunteers').upsert({
    id: user.id,
    bio,
    is_available,
    radius_km: radius_km ?? 5,
    location: locationPoint,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })

  if (volError) return serverError(volError.message)

  // Replace skills: delete old, insert new
  await supabase.from('volunteer_skills').delete().eq('volunteer_id', user.id)

  if (skills && skills.length > 0) {
    const skillRows = skills.map(s => ({
      volunteer_id: user.id,
      category: s.category,
      skill_name: s.skill_name,
    }))
    await supabase.from('volunteer_skills').insert(skillRows)
  }

  // Return updated profile
  const { data: vol } = await supabase
    .from('volunteers')
    .select('*, volunteer_skills(*)')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ data: vol }, { status: 200 })
}
```

### Nearby Requests for Volunteer

**`src/app/api/volunteers/requests/route.ts`**
```typescript
export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauth()

  // Get volunteer's location and radius
  const { data: vol } = await supabase
    .from('volunteers')
    .select('location, radius_km')
    .eq('id', user.id)
    .single()

  if (!vol?.location) return NextResponse.json({ data: [], count: 0 })

  const radius = vol.radius_km ?? 5

  // PostGIS query: requests within radius that are open
  const { data: requests, error } = await supabase.rpc('get_nearby_requests', {
    volunteer_location: vol.location,
    radius_meters: radius * 1000,
  })

  if (error) return serverError(error.message)
  return NextResponse.json({ data: requests })
}
```

**Note**: Create a Supabase RPC function for the PostGIS query:
```sql
-- Add to migration 003 or a separate RPC file
CREATE OR REPLACE FUNCTION get_nearby_requests(
  volunteer_location GEOMETRY,
  radius_meters FLOAT
)
RETURNS SETOF help_requests
LANGUAGE SQL STABLE AS $$
  SELECT *
  FROM help_requests
  WHERE status NOT IN ('COMPLETED', 'CANCELLED', 'ACCEPTED', 'IN_PROGRESS')
    AND ST_DWithin(
      location::geography,
      volunteer_location::geography,
      radius_meters
    )
  ORDER BY
    CASE urgency WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
    created_at DESC
  LIMIT 20;
$$;
```

### Volunteer Accept/Start/Complete

**`src/app/api/volunteers/requests/[id]/accept/route.ts`**
```typescript
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauth()

  const requestId = params.id

  // Check request is still assignable
  const { data: request } = await supabase
    .from('help_requests')
    .select('status, assigned_volunteer_id')
    .eq('id', requestId)
    .single()

  if (!request) return NextResponse.json({ error: { message: 'Request not found' } }, { status: 404 })
  if (!['MATCHING', 'ASSIGNED', 'AI_ANALYZED'].includes(request.status)) {
    return NextResponse.json({ error: { message: 'Request cannot be accepted in its current state' } }, { status: 400 })
  }
  if (request.assigned_volunteer_id && request.assigned_volunteer_id !== user.id) {
    return NextResponse.json({ error: { message: 'Request already accepted by another volunteer' } }, { status: 409 })
  }

  const { error } = await supabase
    .from('help_requests')
    .update({ status: 'ACCEPTED', assigned_volunteer_id: user.id })
    .eq('id', requestId)

  if (error) return serverError(error.message)

  await supabase.from('request_status_history').insert({
    request_id: requestId,
    from_status: request.status,
    to_status: 'ACCEPTED',
    changed_by: user.id,
    note: 'Volunteer accepted',
  })

  return NextResponse.json({ data: { request_id: requestId, status: 'ACCEPTED' } })
}
```

### NGO Profile

**`src/app/api/ngos/profile/route.ts`**
```typescript
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauth()

  const body = await req.json()
  const { organization_name, description, services, registration_number, website } = body

  const { error } = await supabase.from('ngos').upsert({
    id: user.id,
    organization_name,
    description,
    services: services || [],
    registration_number,
    website,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })

  if (error) return serverError(error.message)

  const { data: ngo } = await supabase.from('ngos').select('*').eq('id', user.id).single()
  return NextResponse.json({ data: ngo })
}
```

### Resource Management

**`src/app/api/resources/route.ts`**
```typescript
// POST — add resource
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauth()

  // Verify user is NGO
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ngo') return NextResponse.json({ error: { message: 'Only NGOs can add resources' } }, { status: 403 })

  const body = await req.json()
  const parsed = createResourceSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error)

  const { name, category, description, quantity_available, quantity_total, unit, location, address } = parsed.data
  const point = `POINT(${location.lng} ${location.lat})`

  const { data: resource, error } = await supabase.from('resources').insert({
    ngo_id: user.id,
    name, category, description,
    quantity_available, quantity_total, unit,
    location: point, address,
  }).select().single()

  if (error) return serverError(error.message)
  return NextResponse.json({ data: resource }, { status: 201 })
}

// GET — list resources
export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const available_only = searchParams.get('available_only') !== 'false'

  let query = supabase.from('resources').select('*, ngos(organization_name, is_verified)').eq('is_active', true)
  if (category) query = query.eq('category', category)
  if (available_only) query = query.gt('quantity_available', 0)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return serverError(error.message)
  return NextResponse.json({ data })
}
```

### Admin Dashboard

**`src/app/api/admin/dashboard/route.ts`**
```typescript
export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauth()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: { message: 'Admin only' } }, { status: 403 })

  // Run counts in parallel
  const [
    { count: total_users },
    { count: total_volunteers },
    { count: total_ngos },
    { count: active_requests },
    { count: completed_requests },
    { data: resource_sum },
    { data: by_status },
    { data: by_category },
    { data: gap_data },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('volunteers').select('*', { count: 'exact', head: true }),
    supabase.from('ngos').select('*', { count: 'exact', head: true }),
    supabase.from('help_requests').select('*', { count: 'exact', head: true }).not('status', 'in', '(COMPLETED,CANCELLED)'),
    supabase.from('help_requests').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
    supabase.from('resources').select('quantity_available').eq('is_active', true),
    supabase.from('help_requests').select('status').not('status', 'in', '(COMPLETED,CANCELLED)'),
    supabase.from('help_requests').select('category').not('status', 'in', '(COMPLETED,CANCELLED)'),
    supabase.rpc('get_resource_gaps'),
  ])

  const available_resources = resource_sum?.reduce((sum, r) => sum + (r.quantity_available || 0), 0) || 0

  // Aggregate status counts
  const requests_by_status: Record<string, number> = {}
  by_status?.forEach(r => { requests_by_status[r.status] = (requests_by_status[r.status] || 0) + 1 })

  const requests_by_category: Record<string, number> = {}
  by_category?.forEach(r => { requests_by_category[r.category] = (requests_by_category[r.category] || 0) + 1 })

  return NextResponse.json({
    data: {
      total_users, total_volunteers, total_ngos,
      active_requests, completed_requests,
      available_resources,
      requests_by_status, requests_by_category,
      resource_gaps: gap_data || [],
    }
  })
}
```

**Resource Gap RPC** (add to migration 004):
```sql
CREATE OR REPLACE FUNCTION get_resource_gaps()
RETURNS TABLE(
  category TEXT,
  active_requests BIGINT,
  available_resources BIGINT,
  available_volunteers BIGINT,
  gap_severity TEXT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    cats.cat AS category,
    COUNT(DISTINCT hr.id) AS active_requests,
    COALESCE(SUM(r.quantity_available), 0) AS available_resources,
    COUNT(DISTINCT v.id) AS available_volunteers,
    CASE
      WHEN COUNT(DISTINCT hr.id) > COALESCE(SUM(r.quantity_available), 0) + COUNT(DISTINCT v.id) * 3
        THEN 'HIGH'
      WHEN COUNT(DISTINCT hr.id) > COALESCE(SUM(r.quantity_available), 0) + COUNT(DISTINCT v.id)
        THEN 'MEDIUM'
      ELSE 'LOW'
    END AS gap_severity
  FROM (
    VALUES ('medical'),('food'),('transportation'),('education'),('shelter'),('general')
  ) cats(cat)
  LEFT JOIN help_requests hr ON hr.category = cats.cat AND hr.status NOT IN ('COMPLETED','CANCELLED')
  LEFT JOIN resources r ON r.category = cats.cat AND r.is_active = true AND r.quantity_available > 0
  LEFT JOIN volunteer_skills vs ON vs.category = cats.cat
  LEFT JOIN volunteers vol ON vol.id = vs.volunteer_id AND vol.is_available = true
  GROUP BY cats.cat
  ORDER BY active_requests DESC;
$$;
```

---

## Validation Schemas

**`src/lib/validation/volunteer.schema.ts`**
```typescript
import { z } from 'zod'
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

## Hour-by-Hour Plan

| Hour | Tasks |
|------|-------|
| 0–1 | Run migrations 003 + 004, set up RPC functions |
| 1–2 | POST /api/volunteers/profile, GET /api/volunteers/requests |
| 2–3 | Accept/start/complete routes, PATCH availability |
| 3–4 | NGO profile, GET /api/ngos, POST /api/resources, GET /api/resources |
| 4–5 | Admin dashboard route + gap detection + map data route |
| 5–6 | Test all endpoints, fix edge cases, verify gap detection |

---

## Handoff Requirements

**To Person 4 (AI/Matching):**
- Volunteers table ready with `is_available`, `location`, `trust_score`, `radius_km`
- `volunteer_skills` table ready with `category`, `volunteer_id`
- `get_nearby_requests` RPC available
- Map data endpoint at `GET /api/admin/map-data`

**To Person 1 (Frontend):**
- All types exported from `src/types/volunteer.ts`, `ngo.ts`, `resource.ts`, `admin.ts`
- Resource gap data shape: `ResourceGap[]` with `category`, `active_requests`, `available_volunteers`, `gap_severity`
