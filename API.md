# API.md — REST API Documentation

## Base URL
- Development: `http://localhost:8080/api`
- Production: `https://civicbridge-api.onrender.com/api`

## Auth Header
All protected routes require:
```
Authorization: Bearer <supabase_jwt_token>
```

## Response Format
```json
// Success
{ "data": { ... }, "message": "OK" }

// Error
{ "error": "Human readable message", "code": "ERROR_CODE", "status": 400 }
```

---

## AUTH ROUTES

---

### POST /api/auth/profile
**Purpose:** Create user profile after Supabase Auth signup
**Auth Required:** Yes (any authenticated user)
**Role:** Any

**Request:**
```json
{
  "name": "Ritu Sharma",
  "role": "requester",
  "location_text": "Dharampeth, Nagpur",
  "lat": 21.1458,
  "lng": 79.0882
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Ritu Sharma",
    "role": "requester",
    "location_text": "Dharampeth, Nagpur",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

**Errors:**
- `400 VALIDATION_ERROR` — missing required fields
- `409 CONFLICT` — profile already exists

**Owner:** Member 3

---

### GET /api/auth/me
**Purpose:** Get current user profile
**Auth Required:** Yes
**Role:** Any

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Ritu Sharma",
    "email": "ritu@example.com",
    "role": "requester",
    "location_text": "Dharampeth, Nagpur",
    "lat": 21.1458,
    "lng": 79.0882
  }
}
```

**Owner:** Member 3

---

## REQUEST ROUTES

---

### POST /api/requests
**Purpose:** Create a new help request
**Auth Required:** Yes
**Role:** requester, ngo_admin

**Request:**
```json
{
  "title": "Need food packets for 3 days",
  "description": "Family of 4, lost income, need basic groceries",
  "category": "food",
  "urgency": "HIGH",
  "quantity": 5,
  "unit": "packets",
  "location_text": "Dharampeth, Nagpur",
  "lat": 21.1458,
  "lng": 79.0882
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Need food packets for 3 days",
    "category": "food",
    "urgency": "HIGH",
    "status": "open",
    "requester_id": "uuid",
    "location_text": "Dharampeth, Nagpur",
    "lat": 21.1458,
    "lng": 79.0882,
    "quantity": 5,
    "unit": "packets",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "message": "Request created successfully"
}
```

**Errors:**
- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN` — volunteer cannot create requests

**Owner:** Member 3

---

### GET /api/requests
**Purpose:** Get all open requests (volunteer/NGO view)
**Auth Required:** Yes
**Role:** volunteer, ngo_admin

**Query Params:**
```
?category=food
?urgency=HIGH,CRITICAL
?status=open
?lat=21.1458&lng=79.0882&radius=10
?page=1&limit=20
?sort=urgency_desc (default)
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Need food packets",
      "category": "food",
      "urgency": "HIGH",
      "status": "open",
      "location_text": "Dharampeth, Nagpur",
      "distance_km": 1.2,
      "quantity": 5,
      "unit": "packets",
      "requester_name": "Ritu S.",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "total": 42 }
}
```

**Owner:** Member 3

---

### GET /api/requests/my
**Purpose:** Get requester's own submitted requests
**Auth Required:** Yes
**Role:** requester

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Need food packets",
      "status": "accepted",
      "urgency": "HIGH",
      "category": "food",
      "volunteer_name": "Aryan K.",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:09:00Z"
    }
  ]
}
```

**Owner:** Member 3

---

### GET /api/requests/:id
**Purpose:** Get single request detail
**Auth Required:** Yes
**Role:** Any (with access check)

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Need food packets for 3 days",
    "description": "Family of 4...",
    "category": "food",
    "urgency": "HIGH",
    "status": "in_progress",
    "quantity": 5,
    "unit": "packets",
    "location_text": "Dharampeth, Nagpur",
    "lat": 21.1458,
    "lng": 79.0882,
    "requester": { "id": "uuid", "name": "Ritu S." },
    "volunteer": { "id": "uuid", "name": "Aryan K." },
    "timeline": [
      { "status": "open", "at": "2024-01-01T10:00:00Z" },
      { "status": "accepted", "at": "2024-01-01T10:09:00Z" },
      { "status": "in_progress", "at": "2024-01-01T10:15:00Z" }
    ],
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

**Owner:** Member 3

---

### PATCH /api/requests/:id/status
**Purpose:** Update request status
**Auth Required:** Yes
**Role:** volunteer (own accepted), ngo_admin (any)

**Request:**
```json
{
  "status": "completed",
  "note": "Delivered 5 food packets to requester"
}
```

Valid transitions:
- `open` → `accepted` (via POST /api/matches/:id/accept)
- `accepted` → `in_progress`
- `in_progress` → `completed`
- `open` → `cancelled` (requester only)

**Response 200:**
```json
{
  "data": { "id": "uuid", "status": "completed", "updated_at": "..." },
  "message": "Status updated to completed"
}
```

**Errors:**
- `400 INVALID_TRANSITION` — invalid status transition
- `403 FORBIDDEN` — not the assigned volunteer

**Owner:** Member 3

---

### DELETE /api/requests/:id
**Purpose:** Cancel / delete own request
**Auth Required:** Yes
**Role:** requester (own only)

**Response 200:** `{ "message": "Request cancelled" }`

**Owner:** Member 3

---

## MATCH ROUTES

---

### POST /api/matches/:requestId/accept
**Purpose:** Volunteer accepts a request
**Auth Required:** Yes
**Role:** volunteer, ngo_admin

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "request_id": "uuid",
    "volunteer_id": "uuid",
    "status": "accepted",
    "created_at": "2024-01-01T10:09:00Z"
  },
  "message": "Request accepted. Requester has been notified."
}
```

**Errors:**
- `409 CONFLICT` — request already accepted by someone else
- `400 ALREADY_ACCEPTED` — this volunteer already accepted

**Owner:** Member 3

---

### GET /api/matches/my
**Purpose:** Get volunteer's active/completed matches
**Auth Required:** Yes
**Role:** volunteer

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "request": {
        "id": "uuid",
        "title": "Need food packets",
        "urgency": "HIGH",
        "status": "in_progress",
        "location_text": "Dharampeth, Nagpur"
      },
      "accepted_at": "2024-01-01T10:09:00Z"
    }
  ]
}
```

**Owner:** Member 3

---

## RESOURCE ROUTES

---

### POST /api/resources
**Purpose:** List an available resource
**Auth Required:** Yes
**Role:** Any

**Request:**
```json
{
  "title": "20kg Rice Available",
  "category": "food",
  "quantity": 20,
  "unit": "kg",
  "description": "Donated by local restaurant. Available for pickup.",
  "location_text": "Sitabuldi, Nagpur",
  "lat": 21.1505,
  "lng": 79.0806,
  "available_until": "2024-01-05"
}
```

**Response 201:**
```json
{ "data": { "id": "uuid", ... }, "message": "Resource listed" }
```

**Owner:** Member 3

---

### GET /api/resources
**Purpose:** Browse available resources
**Auth Required:** Yes
**Role:** Any

**Query Params:** `?category=food&lat=21.14&lng=79.08&radius=5`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "20kg Rice Available",
      "category": "food",
      "quantity": 20,
      "unit": "kg",
      "location_text": "Sitabuldi, Nagpur",
      "distance_km": 0.8,
      "provider_name": "Asha Foundation",
      "available_until": "2024-01-05"
    }
  ]
}
```

**Owner:** Member 3

---

## USER / NGO ROUTES

---

### GET /api/users/stats
**Purpose:** Get volunteer impact stats
**Auth Required:** Yes
**Role:** volunteer

**Response 200:**
```json
{
  "data": {
    "total_accepted": 12,
    "total_completed": 9,
    "active_requests": 3,
    "streak_days": 3
  }
}
```

**Owner:** Member 3

---

### GET /api/ngo/dashboard
**Purpose:** NGO admin overview stats
**Auth Required:** Yes
**Role:** ngo_admin

**Response 200:**
```json
{
  "data": {
    "open_requests": 14,
    "in_progress": 6,
    "completed_today": 8,
    "active_volunteers": 11,
    "category_breakdown": [
      { "category": "food", "count": 22 },
      { "category": "medicine", "count": 11 }
    ]
  }
}
```

**Owner:** Member 3

---

### POST /api/ngo/assign
**Purpose:** NGO assigns a volunteer to a request
**Auth Required:** Yes
**Role:** ngo_admin

**Request:**
```json
{
  "request_id": "uuid",
  "volunteer_id": "uuid"
}
```

**Response 200:** `{ "message": "Volunteer assigned" }`

**Owner:** Member 3

---

## AI ROUTES (P1)

---

### POST /api/ai/categorize
**Purpose:** Auto-categorize request description using Gemini
**Auth Required:** Yes

**Request:**
```json
{ "description": "I need insulin for my father, running out tomorrow" }
```

**Response 200:**
```json
{
  "data": {
    "category": "medicine",
    "urgency_suggestion": "CRITICAL",
    "confidence": 0.94
  }
}
```

**Fallback:** Returns `{ "category": null, "urgency_suggestion": null }` if Gemini unavailable

**Owner:** Member 3
