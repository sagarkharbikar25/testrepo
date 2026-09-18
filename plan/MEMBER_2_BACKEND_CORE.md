# Member 2: Backend Developer 1 (Core APIs & AI)
**Branch:** `feature/backend-core`
**Owned files:**
```
src/app/api/auth/**
src/app/api/requests/**
src/app/api/ai/**
src/app/api/matches/**
src/app/api/notifications/**
src/lib/supabase/client.ts, server.ts
src/lib/gemini.ts
src/lib/matching.ts
src/middleware.ts
src/types/request.ts, ai.ts, matching.ts
src/lib/validation/auth.schema.ts, request.schema.ts, ai.schema.ts
```

**Do not touch:** `src/app/api/volunteers/**`, `ngos/**`, `resources/**`, `admin/**` (Member 3) · `src/app/**` (all UI pages & components, Member 4) · `supabase/migrations/**` (Member 1)

> **Updated Frontend Alignment:** 
> - The intake form (`/requester/request/new`) now collects GPS coordinates, `household_flags` (Elderly, Wheelchair, Infants, Diabetic), and `items_needed`.
> - Every new request must trigger Gemini AI categorization, urgency scoring, and automatically emit notifications to the new unified `notifications` table so volunteers and NGOs receive instant dispatch alerts!

---

## Supabase Client Setup (Hour 0)

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

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle server component cookie set limitation
          }
        },
      },
    }
  )
}
```

---

## Auth Endpoints

### `POST /api/auth/register`
- **Body**:
  ```json
  {
    "email": "volunteer@nexoralink.org",
    "password": "StrongPassword123!",
    "full_name": "Dr. Rahul Sharma",
    "role": "volunteer", // 'requester' | 'volunteer' | 'ngo'
    "phone": "+91 98230 44120",
    "address": "Nagpur Metropolitan",
    "vehicle_access": "SUV / 4x4",
    "special_needs": []
  }
  ```
- **Flow**:
  1. `supabase.auth.signUp()`
  2. Insert into `profiles` table with matching role and initial profile flags.
  3. If `role === 'volunteer'`, insert into `volunteers` table.
  4. If `role === 'ngo'`, insert into `ngos` table.
- **Response 201**: `{ data: { user_id, role, full_name } }`

### `POST /api/auth/login`
- Standard Supabase credentials sign-in. Sets auth session cookies.
- **Response 200**: `{ data: { user, profile: { role, full_name, phone } } }`

---

## Request Intake & AI Triage (`/api/requests`)

### `POST /api/requests` (Connected to `/requester/request/new`)
- **Body**:
  ```json
  {
    "description": "Urgent cold-chain insulin transport required for senior citizen suffering high glucose spikes.",
    "latitude": 21.1585,
    "longitude": 79.0980,
    "address": "Flat 302, Green Valley Apartments, Sector 4",
    "itemsNeeded": ["Cold-chain Insulin transport", "Mobility Van"],
    "householdFlags": ["Elderly Household Member (65+)", "Diabetic / Cold-Chain Medicine Required"],
    "contactName": "Sagar Kharbikar",
    "contactPhone": "+91 98230 11492"
  }
  ```
- **Flow**:
  1. Validate with Zod.
  2. Call Gemini AI (`src/lib/gemini.ts`) to analyze urgency and category:
     ```typescript
     const aiAnalysis = await analyzeRequestWithGemini(description, householdFlags);
     // Returns: { category, urgency: 'CRITICAL', skillsNeeded, taskSummary, confidence: 0.94 }
     ```
  3. Insert into `help_requests` with status `AI_ANALYZED`.
  4. Insert into `request_status_history`.
  5. **Auto-generate Notifications**:
     - Insert a `TRIAGE` notification for the requester:
       `"Your request was scored as CRITICAL by AI. Verified responders notified."`
     - Insert `NEW_REQUEST` notifications for active volunteers within radius:
       `"New urgent medical request raised near Sector 4."`
     - Insert `REQUISITION` notification for NGO coordinators.
- **Response 201**:
  ```json
  {
    "data": {
      "id": "d0000000-0000-0000-0000-000000000004",
      "status": "AI_ANALYZED",
      "category": "medical",
      "urgency": "CRITICAL",
      "ai_confidence": 0.94,
      "items_needed": ["Cold-chain Insulin transport", "Mobility Van"],
      "created_at": "2026-09-18T11:45:00Z"
    }
  }
  ```

### `GET /api/requests`
- **Query Params**: `?status=&category=&limit=20&offset=0`
- **Role Scoping**:
  - `requester`: returns only requests where `requester_id === user.id`.
  - `volunteer`: returns open requests or assigned tasks.
  - `ngo` / `admin`: returns all inbound requisitions.
- **Response 200**: `{ data: HelpRequest[] }`

### `GET /api/requests/:id` (Connected to `/requester/request/[id]`)
- Returns request details, assigned volunteer responder profile with direct contact phone, GPS coordinates, and historical timeline from `request_status_history`.

---

## Gemini AI Integration (`src/lib/gemini.ts`)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeRequestWithGemini(description: string, householdFlags: string[]) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are a humanitarian emergency triage AI. Analyze this civilian crisis requisition:
Description: "${description}"
Household Vulnerability Flags: ${JSON.stringify(householdFlags)}

Output strict JSON only:
{
  "category": "medical" | "food" | "transportation" | "education" | "shelter" | "general",
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "skillsNeeded": string[],
  "summary": string,
  "confidence": number
}
Rules:
- If infant, cold-chain insulin, or dialysis mentioned, urgency MUST be 'CRITICAL'.
- If elderly mobility or flood evacuation, urgency is 'HIGH' or 'CRITICAL'.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json|```/g, '');
  return JSON.parse(cleaned);
}
```

---

## Unified Notifications API (`/api/notifications`)

### `GET /api/notifications`
- Fetches all notifications for the authenticated user and their active role.
- **Response 200**:
  ```json
  {
    "data": [
      {
        "id": "VNOTIF-1",
        "title": "New Urgent Aid Request",
        "message": "Diabetic patient requires cold-chain transport in Sector 4",
        "category": "DISPATCH",
        "urgency": "CRITICAL",
        "action_label": "Live Route Map",
        "action_href": "/volunteer/map",
        "read": false,
        "created_at": "2026-09-18T11:45:00Z"
      }
    ]
  }
  ```

### `PATCH /api/notifications/:id/read`
- Marks a single notification as read.

### `POST /api/notifications/mark-all-read`
- Marks all unread notifications as read for caller's `user_id`.
