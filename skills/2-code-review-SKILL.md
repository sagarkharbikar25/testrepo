---
name: code-review
description: Skeptical NexoraLink code reviewer — finds real problems across correctness, security, Supabase RLS, TypeScript, API design, and Git ownership instead of praising the diff.
---

# Purpose
Review NexoraLink code (any branch) for actual defects, not surface-level approval. This skill exists because an agent that agrees by default is worse than no review at all.

# When to Use
When a developer asks for a review of a diff, PR, or specific file(s) before merging.

# When NOT to Use
- Don't use this to write or fix code — flag it, don't silently patch it, unless explicitly asked to fix what you found.
- Not for the final pre-demo pass — use `final-validation` for that broader checklist.

# Workflow
1. Read the diff in full before commenting on anything.
2. Check each category below against what's actually in the diff — not against a generic checklist recited without looking.
3. For every real problem found, use the Output Format below. For non-problems, say nothing — don't pad the review with praise.

# NexoraLink-Specific Rules — review categories
- **Correctness** — does it do what it claims, including edge cases (empty lists, failed AI call, race on accept)?
- **Architecture** — does it respect the Volunteer/NGO separation and the exact lifecycle states in PROJECT-CONTEXT.md?
- **Security / Auth / Authorization** — is every protected route actually checking the JWT and role, not just assuming client-side gating is enough?
- **Supabase RLS** — does any new table/query bypass RLS assumptions? Does anything use the service-role key somewhere it shouldn't (see `supabase-development`)?
- **SQL queries** — N+1 patterns, missing indexes on filtered/sorted columns, unbounded queries
- **TypeScript** — no `any` smuggled in, types actually match what Supabase/API returns
- **Error handling** — does a failed Gemini call, failed Supabase call, or failed fetch degrade gracefully or crash the flow?
- **API design** — consistent request/response shape with the rest of the API (see `api-development`)
- **Duplicated logic / unnecessary abstraction** — flag both; over-engineering is as much a hackathon risk as sloppiness
- **Frontend performance** — obvious re-render issues, missing loading/empty/error states
- **AI reliability** — does the code assume Gemini always succeeds and returns valid JSON? It must not (see `ai-matching`).
- **Git ownership / merge-conflict risk** — does this diff touch files outside the stated owner's branch territory?

# File Ownership Rules
Reviewing across ownership boundaries is fine (anyone can review anyone's code) — but flag it as CRITICAL if the diff itself contains edits to files outside the author's owned territory per PROJECT-CONTEXT.md, since that's a merge-conflict risk regardless of code quality.

# Validation
A review is only as good as what was actually read. Do not claim to have checked RLS policies, tests, or a live flow if you only read the diff text — mark those as `UNVERIFIED — needs a runtime check`, not silently skipped.

# Failure Handling
If the diff is too large or the surrounding context is missing to judge a category confidently, say so explicitly rather than guessing at a verdict.

# Output Format
For each problem found:
```
PROBLEM: <what's wrong>
SEVERITY: CRITICAL | HIGH | MEDIUM | LOW
WHY: <the underlying technical reason>
RISK: <what breaks or could break>
RECOMMENDED FIX: <concrete, minimal>
```
If nothing significant was found in a category, omit it — don't list "No issues" for every category as filler.

# Examples
**Good finding:** "PROBLEM: `/api/matches/:id/accept` has no unique-constraint check before insert. SEVERITY: CRITICAL. WHY: two volunteers accepting simultaneously both succeed instead of one getting a 409. RISK: double-dispatch, breaks the core race-condition guarantee for this project. RECOMMENDED FIX: add `UNIQUE(request_id)` on matches and catch the 23505 violation in the controller."

**Not a finding:** Restyling a button's padding — cosmetic, not worth a review comment unless it breaks the design tokens.
