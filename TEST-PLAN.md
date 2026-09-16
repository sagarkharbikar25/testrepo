# TEST-PLAN.md — Test Cases & QA Checklist

## Testing Philosophy for Hackathon

No automated test suite. All testing is manual, fast, and focused on the demo path. Every P0 feature must have a passing smoke test before deployment.

---

## Smoke Tests (Run Every Hour)

| ID | Feature | Test | Expected Result | Priority | Owner |
|---|---|---|---|---|---|
| SM-01 | API Health | GET /api/health | 200 `{ status: "ok" }` | P0 | M3 |
| SM-02 | DB Connection | SELECT 1 from Supabase | Returns row | P0 | M4 |
| SM-03 | Frontend Load | Open civicbridge.vercel.app | Landing page renders < 3s | P0 | M1 |
| SM-04 | Auth Login | Login with seed user | JWT returned, redirect to dashboard | P0 | M1 |

---

## Authentication Tests

| ID | Feature | Test | Expected Result | Priority | Owner |
|---|---|---|---|---|---|
| AT-01 | Register — Requester | Submit valid register form | Profile created, redirect to /dashboard/requester | P0 | M1 |
| AT-02 | Register — Volunteer | Submit with role=volunteer | Profile created, redirect to /dashboard/volunteer | P0 | M1 |
| AT-03 | Register — NGO | Submit with role=ngo_admin | Profile created, redirect to /dashboard/ngo | P0 | M2 |
| AT-04 | Login — Valid | Email + password correct | JWT issued, dashboard loads | P0 | M1 |
| AT-05 | Login — Wrong Password | Incorrect password | "Invalid credentials" error shown | P0 | M1 |
| AT-06 | Login — Nonexistent User | Unknown email | Error message shown | P0 | M1 |
| AT-07 | Protected Route — No JWT | Access /dashboard directly without auth | Redirect to /auth/login | P0 | M1 |
| AT-08 | JWT Expiry | Wait for token to expire (or manually clear) | Auto-logout or refresh | P1 | M3 |

---

## Authorization Tests

| ID | Feature | Test | Expected Result | Priority | Owner |
|---|---|---|---|---|---|
| AZ-01 | Role Guard — Requester → Volunteer Route | Requester visits /dashboard/volunteer | Redirect to correct dashboard | P0 | M1/M2 |
| AZ-02 | Role Guard — API | Volunteer calls POST /api/requests | 403 FORBIDDEN | P0 | M3 |
| AZ-03 | Role Guard — Accept | Requester calls POST /api/matches/:id/accept | 403 FORBIDDEN | P0 | M3 |
| AZ-04 | Own Data Only | Requester A views Requester B's private data | 403 or filtered out | P0 | M3 |

---

## Functional Tests — Request Lifecycle

| ID | Feature | Test | Expected Result | Priority | Owner |
|---|---|---|---|---|---|
| FL-01 | Create Request | Submit request form with all fields | Request appears in DB, status=open | P0 | M1/M3 |
| FL-02 | Create Request — Validation | Submit empty form | Inline validation errors shown | P0 | M1 |
| FL-03 | Create Request — Category | Select each category icon | Icon highlights, value stored correctly | P0 | M1 |
| FL-04 | Create Request — Urgency | Select CRITICAL | Red button highlighted, value stored | P0 | M1 |
| FL-05 | View Requests (Volunteer) | Login as volunteer, visit /requests | Open requests listed by urgency | P0 | M2 |
| FL-06 | Accept Request | Volunteer clicks Accept | Status → accepted, match created | P0 | M2/M3 |
| FL-07 | Accept — Already Taken | Two volunteers accept same request | Second gets "already accepted" message | P0 | M3 |
| FL-08 | Update Status — In Progress | Volunteer marks In Progress | Status updates, timeline entry created | P0 | M2/M3 |
| FL-09 | Update Status — Completed | Volunteer marks Completed | Status=completed, impact_feed entry created | P0 | M2/M3 |
| FL-10 | Cancel Request | Requester cancels open request | Status=cancelled | P0 | M1 |
| FL-11 | View My Requests | Requester views /requests/my | Only their own requests shown | P0 | M1 |
| FL-12 | Request Detail | Open any request detail page | Full timeline, assigned volunteer, status shown | P0 | M1 |

---

## API Tests (Postman / curl)

| ID | Endpoint | Test | Expected | Priority | Owner |
|---|---|---|---|---|---|
| API-01 | POST /api/auth/profile | Valid body + JWT | 201 profile returned | P0 | M3 |
| API-02 | POST /api/auth/profile | Duplicate profile | 409 CONFLICT | P0 | M3 |
| API-03 | POST /api/requests | Valid body | 201 request returned | P0 | M3 |
| API-04 | POST /api/requests | Missing title | 400 VALIDATION_ERROR | P0 | M3 |
| API-05 | POST /api/requests | No JWT | 401 UNAUTHORIZED | P0 | M3 |
| API-06 | GET /api/requests | Volunteer JWT | 200 array of open requests | P0 | M3 |
| API-07 | GET /api/requests | Filter by urgency=CRITICAL | Only CRITICAL requests | P0 | M3 |
| API-08 | POST /api/matches/:id/accept | Valid volunteer + open request | 201 match created | P0 | M3 |
| API-09 | POST /api/matches/:id/accept | Already accepted request | 409 CONFLICT | P0 | M3 |
| API-10 | PATCH /api/requests/:id/status | Valid transition | 200 updated | P0 | M3 |
| API-11 | PATCH /api/requests/:id/status | Invalid transition (open→completed) | 400 INVALID_TRANSITION | P0 | M3 |
| API-12 | GET /api/resources | Authenticated request | 200 resources list | P0 | M3 |

---

## Database Tests

| ID | Feature | Test | Expected Result | Priority | Owner |
|---|---|---|---|---|---|
| DB-01 | RLS — Profiles | Query profiles as anonymous user | 0 rows or denied | P0 | M4 |
| DB-02 | RLS — Requests | Query as requester A, see requester B's closed request | Not visible | P0 | M4 |
| DB-03 | Unique Constraint | Insert two matches for same request_id | Second insert fails | P0 | M4 |
| DB-04 | Cascade Delete | Delete auth user → profile deleted | Profile row gone | P0 | M4 |
| DB-05 | Updated_at Trigger | Update any request row | updated_at changes | P0 | M4 |
| DB-06 | Seed Data | Run seed SQL | 7 profiles, 5 requests, 3 matches visible | P0 | M4 |
| DB-07 | CHECK Constraints | Insert request with urgency='EXTREME' | Insert fails | P0 | M4 |

---

## Validation Tests (Frontend)

| ID | Feature | Test | Expected Result | Priority | Owner |
|---|---|---|---|---|---|
| VL-01 | Request Form — Empty Title | Submit with blank title | "Title is required" shown | P0 | M1 |
| VL-02 | Request Form — Long Title | 300+ char title | "Max 200 characters" shown | P0 | M1 |
| VL-03 | Register — Password | < 6 chars password | "Password too short" shown | P0 | M1 |
| VL-04 | Register — Email | Invalid email format | "Invalid email" shown | P0 | M1 |

---

## Error State Tests

| ID | Feature | Test | Expected Result | Priority | Owner |
|---|---|---|---|---|---|
| ER-01 | API Offline | Kill backend, use frontend | Error state shown ("Something went wrong. Retry.") | P0 | M1 |
| ER-02 | Empty Request List | No requests in DB | Empty state with CTA shown | P0 | M2 |
| ER-03 | Gemini Fails | Call /api/ai/categorize with key missing | Falls back to null, no crash | P1 | M3 |

---

## Responsive Tests

| ID | Device | Test | Expected Result | Priority | Owner |
|---|---|---|---|---|---|
| RS-01 | Mobile 375px | Open landing, register, create request | All usable, no overflow | P0 | M1 |
| RS-02 | Mobile | Volunteer request feed | Cards stack properly, accept button reachable | P0 | M2 |
| RS-03 | Tablet 768px | NGO dashboard | Two column layout works | P0 | M2 |
| RS-04 | Desktop 1280px | All pages | Sidebar visible, content readable | P0 | M1/M2 |

---

## Deployment Tests

| ID | Feature | Test | Expected Result | Priority | Owner |
|---|---|---|---|---|---|
| DP-01 | Frontend Build | `npm run build` on web app | No TypeScript errors | P0 | M1 |
| DP-02 | Backend Build | `npm run build` on API | Compiles cleanly | P0 | M3 |
| DP-03 | CORS | Call Render API from Vercel domain | No CORS errors | P0 | M3 |
| DP-04 | Env Vars | Check all required env vars set | No "undefined" in logs | P0 | M3/M4 |
| DP-05 | Render Cold Start | First API call after idle | Responds within 20s | P0 | M3 |
| DP-06 | Supabase Connection | Backend connects to Supabase | No auth errors in logs | P0 | M4 |

---

## End-to-End Demo Test (Critical — Run Before Presentation)

This test simulates the complete judging demo in order.

| Step | Action | Expected | Status |
|---|---|---|---|
| 1 | Open landing page | Impact ticker running, stats visible | ☐ |
| 2 | Register as Requester (ritu@demo.com) | Dashboard loads | ☐ |
| 3 | Create request: "Need 5 food packets", CRITICAL, Nagpur | Request created, status OPEN | ☐ |
| 4 | Log out, login as Volunteer (aryan@demo.com) | Volunteer dashboard loads | ☐ |
| 5 | Open volunteer request feed | New request visible, CRITICAL badge shown | ☐ |
| 6 | Accept the request | Status → ACCEPTED | ☐ |
| 7 | Mark In Progress | Status → IN PROGRESS | ☐ |
| 8 | Mark Completed | Status → COMPLETED | ☐ |
| 9 | Log in as NGO Admin (anita@demo.com) | NGO dashboard loads | ☐ |
| 10 | View completed count | Count incremented by 1 | ☐ |
| 11 | Log back in as Requester | Request shows COMPLETED with timeline | ☐ |
| 12 | Check impact feed on landing | Completion visible in ticker | ☐ |

**All 12 steps must pass before the final presentation.**

---

## Definition of Done — Per Feature

### Auth
- [ ] Register works for all 3 roles
- [ ] Login redirects correctly by role
- [ ] JWT used on all protected routes
- [ ] Logout clears session

### Request Creation
- [ ] Form validation works
- [ ] All categories selectable
- [ ] All urgency levels selectable
- [ ] Location stored
- [ ] Request appears in DB with correct status

### Request Matching & Accept
- [ ] Volunteer sees open requests sorted by urgency
- [ ] Accept creates match, updates status
- [ ] Race condition handled (409 on duplicate accept)
- [ ] Requester sees volunteer name on their request

### Status Updates
- [ ] Volunteer can move: accepted → in_progress → completed
- [ ] Timeline entry created at each step
- [ ] Completed triggers impact_feed entry

### Dashboards
- [ ] Requester: sees own requests with status
- [ ] Volunteer: sees stats + active assignments
- [ ] NGO: sees all requests + can assign
