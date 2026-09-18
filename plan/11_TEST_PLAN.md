# 11 — NexoraLink Test Plan

## Testing Philosophy for 6-Hour Hackathon

No automated test suite. No Jest. No Cypress.

Instead:
- **Manual smoke testing** with specific test scripts
- **curl commands** for API endpoint verification
- **Demo scenario rehearsal** as the acceptance test
- **TypeScript compiler** as the static test suite (`npx tsc --noEmit`)

---

## Test Accounts (Set Up Before Demo)

Create these 4 accounts in Supabase during setup:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Requester | citizen@nexora.test | Test1234! | requester |
| Volunteer | rahul@nexora.test | Test1234! | volunteer |
| NGO | helpfoundation@nexora.test | Test1234! | ngo |
| Admin | admin@nexora.test | Test1234! | admin |

Also seed:
- Volunteer profile for rahul: skills=[medical/medicine_pickup], location=demo city center, radius=10km, available=true, trust_score=4.8
- NGO profile: organization_name="Help Foundation", services=[medical,food]
- 1 resource: "Medicine Packets", category=medical, quantity=50, location=demo city

---

## API Smoke Tests (curl)

Run these after each backend route is implemented.

### Auth
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!","full_name":"Test User","role":"requester"}'

# Expected: { "data": { "user_id": "...", "role": "requester" } }
```

### Requests
```bash
# Create request (replace JWT with actual token)
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"description":"My elderly neighbor needs medicine pickup urgently","location":{"lat":20.5937,"lng":78.9629}}'

# Expected: { "data": { "id": "...", "status": "REQUESTED", ... } }
```

### AI Analysis
```bash
curl -X POST http://localhost:3000/api/ai/analyze-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"request_id":"<request-id>","description":"My elderly neighbor needs medicine pickup urgently"}'

# Expected: { "data": { "category": "medical", "urgency": "HIGH", ... } }
```

### Matching
```bash
curl http://localhost:3000/api/matches/<request-id> \
  -H "Authorization: Bearer <JWT>"

# Expected: { "data": { "volunteers": [{ "total_score": ..., "distance_km": ... }] } }
```

### Volunteer Accept
```bash
curl -X POST http://localhost:3000/api/volunteers/requests/<request-id>/accept \
  -H "Authorization: Bearer <JWT>"

# Expected: { "data": { "status": "ACCEPTED" } }
```

### Admin Dashboard
```bash
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer <admin-JWT>"

# Expected: { "data": { "active_requests": ..., "resource_gaps": [...] } }
```

---

## Critical Path Test: Full Demo Flow

Run this exact flow to verify the demo works before presentation:

**Step 1: Citizen creates request**
- Log in as citizen@nexora.test
- Navigate to /requester/request/new
- Enter: "My elderly neighbor needs medicine but nobody can pick it up"
- Select location on map (click near demo city center)
- Submit
- ✅ See: AI analysis panel with category=medical, urgency=HIGH
- ✅ See: "Find Help" button appears

**Step 2: AI matching runs**
- Click "Find Help"
- ✅ See: Volunteer Rahul appears with score ~90%+
- ✅ See: Score breakdown rings (distance, skill, availability, trust)
- ✅ Request status badge shows "MATCHING"

**Step 3: Volunteer accepts**
- Open new tab, log in as rahul@nexora.test
- Navigate to /volunteer/dashboard
- ✅ See: The medical request appears in "Nearby Requests"
- ✅ See: Match score badge
- Click "View Details" → Click "Accept Request"
- ✅ See: Status changes to "ACCEPTED"

**Step 4: Requester sees update**
- Switch back to citizen tab, refresh
- ✅ See: Status timeline shows ACCEPTED with volunteer name
- ✅ See: Volunteer info card

**Step 5: Volunteer starts + completes**
- In Rahul's tab: Click "Start Assistance" → Status = IN_PROGRESS
- Click "Mark Completed" → Status = COMPLETED

**Step 6: Feedback**
- In citizen tab: Rating modal appears
- Rate 5 stars → Submit
- ✅ See: Trust score updated for Rahul

**Step 7: Admin dashboard**
- Log in as admin@nexora.test
- Navigate to /admin/dashboard
- ✅ See: completed_requests count increased
- ✅ See: Map shows resolved markers
- ✅ See: Resource gap widget (if seeded properly)

---

## Edge Case Tests

### AI Fallback (Critical)
Test that system works without Gemini:
```bash
# Temporarily set invalid key
GEMINI_API_KEY=invalid_key
# Create a request
# Expected: AI returns fallback { category: 'general', urgency: 'MEDIUM', confidence: 0 }
# Expected: User sees "Manual category selection" option
# System MUST NOT crash
```

### Invalid Status Transition
```bash
# Try to mark COMPLETED when status is REQUESTED
curl -X PATCH http://localhost:3000/api/requests/<id>/status \
  -d '{"status":"COMPLETED"}'
# Expected: 400 — invalid transition
```

### No Nearby Volunteers
- Create request in area with no volunteers
- Expected: Matching returns empty list gracefully
- Expected: UI shows "No nearby volunteers found — request posted publicly"

### Unauthorized Role Access
- Log in as requester, try to access /admin/dashboard
- Expected: Redirect to /requester/dashboard

---

## TypeScript Checks (Run before PR)

```bash
npx tsc --noEmit
```
Zero errors required before any PR merge.

```bash
npm run build
```
Zero build errors required before final demo merge.

---

## Performance Minimums for Demo

| Metric | Target |
|--------|--------|
| Page load (dashboard) | < 2s |
| AI analysis response | < 5s |
| Matching calculation | < 1s |
| Map render | < 3s |
| API routes | < 500ms |

These are not automated — just observe during demo walkthrough.
