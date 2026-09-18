# 13 — NexoraLink Integration Checklist

## Hour 3 Integration Merge Checklist

Run before merging to `main` at Hour 3.

### Person 2 (BE-R) pre-merge checklist
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — no build errors
- [ ] `git diff --name-only HEAD` — only own files listed
- [ ] POST /api/auth/register returns 201 with user_id
- [ ] POST /api/requests creates row in Supabase
- [ ] GET /api/requests/:id returns request with status history
- [ ] PATCH /api/requests/:id/status validates transitions
- [ ] No src/app/(auth)/*.tsx files modified
- [ ] No src/features/* files modified

### Person 3 (BE-M) pre-merge checklist
- [ ] `npx tsc --noEmit` — zero errors
- [ ] GET /api/volunteers/requests returns nearby requests
- [ ] POST /api/volunteers/requests/:id/accept changes status to ACCEPTED
- [ ] POST /api/ngos/profile creates NGO row
- [ ] POST /api/resources creates resource row
- [ ] GET /api/admin/dashboard returns counts object (may be partial)
- [ ] No src/app/api/requests/* files modified
- [ ] No src/types/auth.ts or request.ts modified

### Person 1 (FE) pre-merge checklist
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Landing page loads at /
- [ ] /login and /register render without error
- [ ] NewRequestForm textarea submits to API
- [ ] AIAnalysisPanel shows result from API (or loading state)
- [ ] VolunteerDashboard renders (even with empty data)
- [ ] No src/app/api/* files modified
- [ ] No src/lib/gemini.ts or matching.ts modified

---

## Hour 5 Integration Merge Checklist

### Person 4 (AI) pre-merge checklist
- [ ] `npx tsc --noEmit` — zero errors
- [ ] POST /api/ai/analyze-request returns valid AIAnalysisResult
- [ ] POST /api/ai/analyze-request FALLBACK works (test with bad API key)
- [ ] GET /api/matches/:requestId returns scored volunteer list
- [ ] Match scores are between 0–100
- [ ] NexoraMap.tsx renders without SSR error
- [ ] All 4 marker types appear on map
- [ ] matches table populated after GET /api/matches/:requestId
- [ ] No src/app/api/requests/* modified
- [ ] No src/app/api/volunteers/* modified
- [ ] No src/features/requester/* or volunteer/* modified

---

## Cross-Module Integration Tests

Run these AFTER all branches are merged into `main`.

### Test 1: Full Request Lifecycle
```
1. POST /api/auth/register (requester) → get JWT
2. POST /api/requests → get request_id
3. POST /api/ai/analyze-request with request_id → verify category + urgency set
4. GET /api/matches/:requestId → verify volunteers returned with scores
5. POST /api/auth/register (volunteer) → get volunteer JWT
6. POST /api/volunteers/profile → set location + skills
7. POST /api/volunteers/requests/:id/accept → verify status=ACCEPTED
8. POST /api/volunteers/requests/:id/start → verify status=IN_PROGRESS
9. POST /api/volunteers/requests/:id/complete → verify status=COMPLETED
10. POST /api/feedback → verify trust_score updated
11. GET /api/admin/dashboard → verify completed_requests++
```
All 11 steps must return 2xx. If any fails, identify owner and fix.

### Test 2: Admin Map Data
```
1. GET /api/admin/map-data → verify all 4 arrays present
2. Open /admin/dashboard in browser → verify map renders
3. Verify request markers appear with correct colors
4. Verify volunteer markers appear
```

### Test 3: Resource Gap Detection
```
1. Ensure there are active medical requests in DB (>3)
2. Ensure medical volunteers < active medical requests
3. GET /api/admin/dashboard
4. Verify resource_gaps contains category='medical' with gap_severity='HIGH'|'MEDIUM'
5. Open admin dashboard → verify GapAlertBanner appears
```

### Test 4: AI Fallback
```
1. Temporarily set GEMINI_API_KEY=invalid
2. POST /api/ai/analyze-request
3. Verify response: { data: { category: 'general', urgency: 'MEDIUM', confidence: 0 } }
4. Verify help_requests row updated (not broken)
5. Verify frontend shows "Manual selection" option
6. Restore real API key
```

---

## Environment Variables Verification

Before deploying to Vercel, verify all variables are set:

```bash
# Local .env.local — verify all 4 are present
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GEMINI_API_KEY=AIza...
```

Vercel dashboard must have the same 3 variables set.

---

## Deployment Verification

After Vercel deployment:
```
1. Visit https://nexoralink.vercel.app
2. Check / loads without error
3. Try register flow
4. Check Network tab — no 500 errors on API calls
5. Verify Leaflet map renders (not a blank box)
6. Run condensed demo flow
```

---

## Known Integration Points to Watch

| Integration | Risk | Who to check with |
|-------------|------|------------------|
| Frontend calls POST /api/ai/analyze-request | Person 1 must send `request_id` + `description` | Person 4 |
| Frontend calls GET /api/matches/:requestId | Route must exist before frontend merge | Person 4 |
| Admin dashboard fetches from /api/admin/dashboard | Gap data shape must match AdminDashboard.tsx type | Person 3 + Person 1 |
| NexoraMap receives `MapMarker[]` | Type must be in src/types/matching.ts | Person 4 |
| `parsePoint` utility converts DB geometry to lat/lng | Used by Person 3's map-data route | Person 4 |
| Volunteer profile must exist before matching works | Person 3's route must be callable before Person 4's matches route | Person 3 |
