---
name: api-development
description: NexoraLink API conventions for Next.js API routes — every endpoint documents method, auth, schema, errors, and owner before it's considered done.
---

# Purpose
Keep NexoraLink's API surface (Next.js route handlers) consistent, validated, and non-duplicated across the two backend owners (Person 2, Person 3) and the AI-integration owner (Person 4).

# When to Use
Creating or modifying any `app/api/**/route.ts` endpoint.

# When NOT to Use
- Frontend-only fetch wrapper changes with no new endpoint → covered under `feature-development`.
- Schema/table design itself → use `supabase-development`, then come back here for the endpoint that exposes it.

# Workflow
1. Check whether an endpoint already covers this — do not create a duplicate route for the same resource.
2. Define, before writing code: method, route path, auth requirement, role requirement, request schema, response schema, error cases, which table(s) it touches, and who owns it.
3. Validate all input server-side (never trust client-side validation alone).
4. Implement with consistent success/error response shape (below).
5. Test the happy path and at least one failure path (missing auth, invalid body, forbidden role) before calling it done.

# NexoraLink-Specific Rules
**Response shape — consistent across every endpoint:**
```json
// Success
{ "data": { ... }, "message": "OK" }
// Error
{ "error": "Human readable message", "code": "ERROR_CODE", "status": 400 }
```
Standard codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`.

- Every protected route verifies the Supabase JWT server-side — never assume the frontend already gated access.
- Role checks happen in the API route, not only in the UI.
- Endpoints touching `help_requests`/lifecycle belong to Person 2. Endpoints touching volunteers/NGOs/resources belong to Person 3. Endpoints touching AI classification/matching belong to Person 4. Do not build an endpoint that spans two owners' data without checking with both first.
- Do not expose internal fields (e.g. raw Gemini response, service-role-only data) in API responses — return only what the frontend contract needs.

# File Ownership Rules
An endpoint's owner is whoever owns the primary table it touches (see `supabase-development`'s ownership table). If your feature needs a new endpoint on another owner's table, describe the exact contract you need (method, request/response shape) and hand it to that owner rather than writing the route file yourself.

# Validation
Before marking an endpoint done: input validation confirmed (try an invalid body, confirm `VALIDATION_ERROR`), auth confirmed (try without a token, confirm `UNAUTHORIZED`), role confirmed if applicable (try with the wrong role, confirm `FORBIDDEN`), and the happy path confirmed against real (not assumed) Supabase data.

# Failure Handling
If Gemini or another external call is part of the endpoint, the endpoint must degrade to a documented fallback rather than 500ing the whole request — see `ai-matching` for the AI-specific fallback contract.

# Output Format
```
ENDPOINT: <METHOD> <path>
OWNER: <person, per table ownership>
AUTH: <required role(s) or "any authenticated">
REQUEST SCHEMA: <fields>
RESPONSE SCHEMA: <fields>
ERRORS TESTED: <which ones actually triggered and confirmed>
```

# Examples
**Good:** "ENDPOINT: POST /api/requests/[id]/accept. OWNER: Person 2 (help_requests/lifecycle). AUTH: volunteer or ngo_admin role required. Tested: valid accept succeeds (201); accepting an already-accepted request returns 409 CONFLICT via the unique constraint, confirmed by triggering it twice; missing auth returns 401."

**Bad:** an endpoint that silently returns `{ success: true }` with no `data`/`message`/`error` shape — inconsistent with every other endpoint, breaks the frontend's shared `api.ts` wrapper assumptions.
