# 04 — NexoraLink API Contracts

## Conventions

- Base path: `/api/`
- All requests require `Authorization: Bearer <supabase_jwt>` unless marked `[PUBLIC]`
- All responses: `{ data, error }` envelope
- Errors: `{ error: { message, code } }`
- Validation: Zod schemas in `src/lib/validation/`
- HTTP methods follow REST conventions

---

## AUTH ROUTES
**Owner: Person 2**

### POST /api/auth/register
Creates a Supabase auth user + profiles row.
```
Body: {
  email: string
  password: string (min 8 chars)
  full_name: string
  role: 'requester' | 'volunteer' | 'ngo'
  phone?: string
}

Response 201: {
  data: { user_id: string, role: string }
}

Errors:
  400 — validation failed
  409 — email already registered

Tables touched: profiles (INSERT)
```

### POST /api/auth/login
Handled by Supabase client SDK directly — no custom route needed.
Frontend calls `supabase.auth.signInWithPassword()`.

### GET /api/auth/me
Returns current user's profile + role.
```
Response 200: {
  data: Profile
}

Tables touched: profiles (SELECT)
```

---

## REQUEST ROUTES
**Owner: Person 2**

### POST /api/requests
Create a new help request (status starts as REQUESTED).
```
Body: {
  description: string (min 20 chars)
  location: { lat: number, lng: number }
  address?: string
}

Response 201: {
  data: HelpRequest
}

Flow:
  1. Insert help_requests with status='REQUESTED'
  2. Insert request_status_history row
  3. Return created request (AI analysis triggered separately)

Tables touched: help_requests (INSERT), request_status_history (INSERT)
Auth: required — role: requester
```

### POST /api/requests/:id/analyze
Trigger AI analysis on a request. Called immediately after creation.
```
Body: {} (empty — uses request description from DB)

Response 200: {
  data: {
    category: string
    urgency: string
    task: string
    skills_needed: string[]
    summary: string
    confidence: number
  }
}

Flow:
  1. Fetch request.description from DB
  2. Call Gemini API (src/lib/gemini.ts)
  3. Validate response with Zod
  4. UPDATE help_requests SET ai_* fields, status='AI_ANALYZED'
  5. Insert status_history row

Tables touched: help_requests (UPDATE), request_status_history (INSERT)
Owner: Person 4 (AI) implements this endpoint
Auth: required — role: requester (own request)
```

### GET /api/requests
List requests (filtered by role context).
```
Query params:
  status?: string
  category?: string
  limit?: number (default 20)
  offset?: number (default 0)

Response 200: {
  data: HelpRequest[]
  count: number
}

Behavior:
  - requester: returns own requests
  - volunteer: returns nearby unassigned requests
  - admin: returns all requests

Tables touched: help_requests (SELECT)
Auth: required
```

### GET /api/requests/:id
Get single request with status history.
```
Response 200: {
  data: {
    request: HelpRequest
    status_history: StatusHistory[]
    matches?: Match[]
  }
}

Tables touched: help_requests, request_status_history, matches (SELECT)
Auth: required
```

### PATCH /api/requests/:id/status
Update request status (with guard on valid transitions).
```
Body: {
  status: 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  note?: string
}

Valid transitions:
  REQUESTED → AI_ANALYZED (system/AI)
  AI_ANALYZED → MATCHING (system)
  MATCHING → ASSIGNED (system after match)
  ASSIGNED → ACCEPTED (volunteer)
  ACCEPTED → IN_PROGRESS (volunteer)
  IN_PROGRESS → COMPLETED (volunteer)
  Any → CANCELLED (requester or admin)

Tables touched: help_requests (UPDATE), request_status_history (INSERT)
Owner: Person 2
Auth: required — role varies by transition
```

### POST /api/requests/:id/cancel
Cancel a request.
```
Body: {} (empty)

Response 200: { data: { status: 'CANCELLED' } }

Tables touched: help_requests (UPDATE), request_status_history (INSERT)
Auth: required — role: requester (own) or admin
```

### POST /api/feedback
Submit feedback after completion.
```
Body: {
  request_id: string
  to_user_id: string
  rating: number (1–5)
  comment?: string
}

Response 201: { data: Feedback }

Side effect: updates volunteers.trust_score (recalculate average)

Tables touched: feedback (INSERT), volunteers (UPDATE)
Owner: Person 2
Auth: required — role: requester
```

---

## AI ROUTES
**Owner: Person 4**

### POST /api/ai/analyze-request
```
Body: {
  request_id: string
  description: string
  location: { lat: number, lng: number }
}

Response 200: {
  data: AIAnalysisResult
}

AIAnalysisResult: {
  category: 'medical'|'food'|'transportation'|'education'|'shelter'|'general'
  task: string
  urgency: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'
  skills_needed: string[]
  summary: string
  confidence: number  // 0–1
}

Fallback (if Gemini fails):
  { category: 'general', urgency: 'MEDIUM', task: 'general_assistance',
    skills_needed: [], summary: description.slice(0, 100), confidence: 0 }

Tables touched: help_requests (UPDATE)
Auth: required
```

---

## MATCHING ROUTES
**Owner: Person 4**

### GET /api/matches/:requestId
Run matching algorithm and return ranked candidates.
```
Response 200: {
  data: {
    volunteers: MatchCandidate[]
    ngos: MatchCandidate[]
  }
}

MatchCandidate: {
  id: string
  full_name: string
  distance_km: number
  total_score: number  // 0–100
  score_breakdown: {
    distance: number
    skill: number
    availability: number
    urgency: number
    trust: number
  }
  category_match: boolean
  is_available: boolean
  trust_score: number
}

Algorithm:
  1. Fetch request (category, urgency, location)
  2. ST_DWithin to find candidates within 10km
  3. Score each candidate
  4. Sort by total_score DESC
  5. Store top 5 in matches table
  6. Update request status to MATCHING

Tables touched: volunteers, volunteer_skills, ngos, resources, matches (SELECT/INSERT)
Auth: required
```

---

## VOLUNTEER ROUTES
**Owner: Person 3**

### POST /api/volunteers/profile
Create or update volunteer profile.
```
Body: {
  bio?: string
  is_available: boolean
  radius_km?: number
  location?: { lat: number, lng: number }
  skills: Array<{ category: string, skill_name: string }>
}

Response 200: { data: VolunteerProfile }

Tables touched: volunteers (UPSERT), volunteer_skills (DELETE + INSERT)
Auth: required — role: volunteer
```

### GET /api/volunteers/requests
Get nearby open requests for volunteer dashboard.
```
Query params:
  radius_km?: number (default: volunteer's radius or 5)
  category?: string
  urgency?: string
  limit?: number (default 10)

Response 200: {
  data: Array<HelpRequest & { match_score?: number }>
}

Tables touched: help_requests, matches (SELECT)
Auth: required — role: volunteer
```

### POST /api/volunteers/requests/:id/accept
Volunteer accepts a request.
```
Body: {} (empty)

Response 200: { data: { request_id: string, status: 'ACCEPTED' } }

Flow:
  1. Check request is in ASSIGNED or MATCHING status
  2. Check no other volunteer already accepted
  3. UPDATE help_requests SET status='ACCEPTED', assigned_volunteer_id=auth.uid()
  4. Insert status_history row

Tables touched: help_requests (UPDATE), request_status_history (INSERT)
Auth: required — role: volunteer
```

### POST /api/volunteers/requests/:id/start
Mark assistance as started.
```
Response 200: { data: { status: 'IN_PROGRESS' } }

Tables touched: help_requests (UPDATE), request_status_history (INSERT)
Auth: required — role: volunteer (assigned to this request)
```

### POST /api/volunteers/requests/:id/complete
Mark assistance as completed.
```
Response 200: { data: { status: 'COMPLETED', completed_at: string } }

Flow:
  1. UPDATE help_requests SET status='COMPLETED', completed_at=now()
  2. UPDATE volunteers SET total_completed = total_completed + 1
  3. Insert status_history

Tables touched: help_requests (UPDATE), volunteers (UPDATE), request_status_history (INSERT)
Auth: required — role: volunteer
```

### PATCH /api/volunteers/availability
Toggle availability.
```
Body: { is_available: boolean }
Response 200: { data: { is_available: boolean } }
Tables touched: volunteers (UPDATE)
Auth: required — role: volunteer
```

---

## NGO ROUTES
**Owner: Person 3**

### POST /api/ngos/profile
Create or update NGO profile.
```
Body: {
  organization_name: string
  description?: string
  services: string[]
  registration_number?: string
  website?: string
}

Response 200: { data: NGOProfile }
Tables touched: ngos (UPSERT)
Auth: required — role: ngo
```

### GET /api/ngos
List all verified NGOs.
```
Response 200: { data: NGOProfile[] }
Tables touched: ngos (SELECT)
Auth: required
```

### POST /api/resources
Add a resource.
```
Body: {
  name: string
  category: string
  description?: string
  quantity_available: number
  quantity_total: number
  unit?: string
  location: { lat: number, lng: number }
  address?: string
}

Response 201: { data: Resource }
Tables touched: resources (INSERT)
Auth: required — role: ngo
```

### PATCH /api/resources/:id
Update resource quantity/availability.
```
Body: {
  quantity_available?: number
  is_active?: boolean
}

Response 200: { data: Resource }
Tables touched: resources (UPDATE)
Auth: required — role: ngo (own resource)
```

### GET /api/resources
List resources (filterable).
```
Query params:
  category?: string
  ngo_id?: string
  available_only?: boolean (default true)

Response 200: { data: Resource[] }
Tables touched: resources (SELECT)
Auth: required
```

---

## ADMIN ROUTES
**Owner: Person 3**

### GET /api/admin/dashboard
Summary stats for admin dashboard.
```
Response 200: {
  data: {
    total_users: number
    total_volunteers: number
    total_ngos: number
    active_requests: number
    completed_requests: number
    available_resources: number
    avg_response_time_minutes: number
    requests_by_status: Record<string, number>
    requests_by_category: Record<string, number>
    resource_gaps: ResourceGap[]
  }
}

ResourceGap: {
  category: string
  active_requests: number
  available_resources: number
  available_volunteers: number
  gap_severity: 'LOW' | 'MEDIUM' | 'HIGH'
}

Tables touched: profiles, help_requests, volunteers, ngos, resources (SELECT)
Auth: required — role: admin
```

### GET /api/admin/map-data
All location data for admin map.
```
Response 200: {
  data: {
    requests: Array<{ id, lat, lng, status, urgency, category }>
    volunteers: Array<{ id, lat, lng, is_available, name }>
    ngos: Array<{ id, lat, lng, name, is_verified }>
    resources: Array<{ id, lat, lng, name, category, quantity_available }>
  }
}

Tables touched: help_requests, volunteers, ngos, resources (SELECT)
Auth: required — role: admin
Owner: Person 3 (data) — Person 4 (Leaflet rendering)
```

### PATCH /api/admin/verify/:type/:id
Verify a volunteer or NGO.
```
Params: type = 'volunteer' | 'ngo'

Body: { is_verified: boolean }

Tables touched: profiles (UPDATE), volunteers or ngos (UPDATE)
Auth: required — role: admin
```

---

## TYPE DEFINITIONS (Shared — src/types/)

```typescript
// src/types/request.ts [BE-R owns]
export type RequestStatus =
  'REQUESTED'|'AI_ANALYZED'|'MATCHING'|'ASSIGNED'|'ACCEPTED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED'

export type UrgencyLevel = 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'

export type RequestCategory = 'medical'|'food'|'transportation'|'education'|'shelter'|'general'

export interface HelpRequest {
  id: string
  requester_id: string
  description: string
  ai_category?: RequestCategory
  ai_urgency?: UrgencyLevel
  ai_task?: string
  ai_skills_needed?: string[]
  ai_summary?: string
  ai_confidence?: number
  category: RequestCategory
  urgency: UrgencyLevel
  location: { lat: number; lng: number }
  address?: string
  status: RequestStatus
  assigned_volunteer_id?: string
  assigned_ngo_id?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

// src/types/ai.ts [AI owns]
export interface AIAnalysisResult {
  category: RequestCategory
  task: string
  urgency: UrgencyLevel
  skills_needed: string[]
  summary: string
  confidence: number
}

// src/types/matching.ts [AI owns]
export interface MatchCandidate {
  id: string
  full_name: string
  candidate_type: 'volunteer' | 'ngo'
  distance_km: number
  total_score: number
  score_breakdown: {
    distance: number
    skill: number
    availability: number
    urgency: number
    trust: number
  }
  is_available: boolean
  trust_score: number
}
```
