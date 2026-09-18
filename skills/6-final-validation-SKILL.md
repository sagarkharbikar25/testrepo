---
name: final-validation
description: Pre-merge and pre-demo validation checklist for NexoraLink — every item is marked PASS, FAIL, or UNVERIFIED, never assumed.
---

# Purpose
Confirm NexoraLink actually works end-to-end before a merge to `main` or before walking into the demo — catching the gap between "I built it" and "I verified it."

# When to Use
Before any merge that's meant to be demo-stable, and as the final pass before presenting.

# When NOT to Use
Not for reviewing code style or architecture mid-development — use `code-review` for that. This skill is functional/runtime verification only.

# Workflow
Go through every item below against the actual running app (local or deployed, as appropriate) — not against memory of what should work.

# NexoraLink-Specific Rules — checklist
**Build & types**
- [ ] TypeScript compiles with no errors
- [ ] Lint passes
- [ ] Production build succeeds

**Auth**
- [ ] Register/login works for Requester, Volunteer, NGO roles
- [ ] Role-based redirect after login is correct

**Core flows**
- [ ] Requester flow: create request → appears with correct status `REQUESTED`
- [ ] Volunteer flow: sees nearby/recommended requests, can accept
- [ ] NGO flow: resource listing, resource allocation visible
- [ ] Lifecycle transitions follow exactly `REQUESTED → ANALYZED → MATCHING → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED` — no skipped or invalid states allowed through

**AI / matching**
- [ ] Gemini classification actually returns a usable result on a real request
- [ ] Fallback path works when Gemini is unavailable/fails (test this deliberately, don't assume)
- [ ] Match score is explainable (see `ai-matching`) — not just a number with no stated reasons

**Map**
- [ ] Leaflet map renders, shows relevant markers, no Google Maps API accidentally in use

**Security**
- [ ] RLS actually blocks unauthorized access (test with a real non-owner JWT, not just "policy exists")
- [ ] No service-role key present in any frontend bundle/network request

**UX states**
- [ ] Loading states present on all async views
- [ ] Empty states present on all list views
- [ ] Error states present and recover via retry, not a blank screen
- [ ] Responsive at mobile width

**Environment / deployment**
- [ ] All required env vars set in Vercel
- [ ] Production deployment reachable and matches what was just tested locally

# File Ownership Rules
This skill reads across all branches/owners — it's the one place cross-ownership inspection is expected. Still report findings back to the relevant owner rather than fixing issues yourself across ownership lines.

# Validation
Every checklist item gets exactly one of: `PASS` (actually exercised and confirmed), `FAIL` (exercised, didn't work — state what happened), or `UNVERIFIED` (not actually checked). Never mark something `PASS` without having run it.

# Failure Handling
Any `FAIL` on a P0 item blocks demo readiness — route it back through `debugging` immediately rather than proceeding to check remaining items as if it weren't a problem. `UNVERIFIED` items on P0 features are treated the same as `FAIL` for demo-readiness purposes — an unverified critical path is not a safe thing to demo live.

# Output Format
```
CATEGORY: <name>
ITEM: <checklist line>
RESULT: PASS | FAIL | UNVERIFIED
NOTES: <what was actually done to check it, or why it's unverified>
```
Summarize at the end: total PASS / FAIL / UNVERIFIED, and whether the app is demo-ready.

# Examples
**Good:** "ITEM: RLS blocks unauthorized access. RESULT: PASS. NOTES: queried `help_requests` as Requester B's JWT attempting to read Requester A's non-open request — returned empty, confirmed policy working, not just present."

**Bad:** "RLS: PASS" with no note on what was actually tested — indistinguishable from having only checked that a policy exists in the migration file.
