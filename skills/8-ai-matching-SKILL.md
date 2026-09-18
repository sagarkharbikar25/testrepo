---
name: ai-matching
description: NexoraLink AI and matching rules — Gemini output must be schema-validated with a manual fallback, matching is deterministic and explainable, AI never makes emergency decisions alone.
---

# Purpose
Build the AI request-analysis and matching layer so the app still functions correctly if Gemini fails, and so every match can be explained rather than trusted blindly.

# When to Use
Implementing or modifying request classification, urgency detection, skill extraction, matching score calculation, or resource-gap detection.

# When NOT to Use
- General API route structure → use `api-development` first, then apply this skill to the AI-specific logic inside it.
- Non-AI matching-adjacent UI (e.g. displaying a score) → `feature-development` covers the UI; this skill covers producing the score correctly.

# Workflow
1. Define the exact schema you expect Gemini to return (category, urgency, extracted skills) before writing the prompt.
2. Call Gemini, parse the response against that schema.
3. If parsing fails or Gemini errors/times out → fall back to manual/deterministic classification immediately. The request must not be blocked or lost.
4. Run the deterministic matching score calculation (not Gemini) using the factors below.
5. Produce an explanation alongside the score — a bare number is not sufficient output.
6. Log which path was used (AI success vs. fallback) so `final-validation` can confirm the fallback was actually exercised, not just theoretically present.

# NexoraLink-Specific Rules
**AI responsibilities (bounded):**
- Category classification
- Task/need extraction
- Urgency classification
- Required-skill extraction

**AI must NOT:**
- Independently make medical or emergency decisions
- Be the sole determinant of matching — matching is deterministic, AI only feeds inputs into it (extracted category/urgency/skills)
- Be assumed to always return valid, parseable output — always schema-validate

**Deterministic matching score — factors (weights configurable, must be documented wherever set):**
- Distance
- Skill compatibility (volunteer skills vs. extracted required skills)
- Availability
- Urgency
- Trust/reputation
- Prior activity/history

**Explainability requirement** — every match score returned to the frontend includes human-readable reasons, e.g.:
```json
{
  "score": 94,
  "reasons": [
    "1.2 km away",
    "required skill available",
    "currently available",
    "strong trust score"
  ]
}
```
A score with no `reasons` array is incomplete.

**Resource-gap detection** compares aggregated community demand (open requests by category/area) against available capacity (resources/volunteers by category/area) — this is a comparison over existing data, not a new AI call; don't route it through Gemini unless summarizing the result in natural language for the admin dashboard.

# File Ownership Rules
All AI/matching logic belongs to Person 4 (`feature/ai-integration`). If matching needs a new field on `help_requests` or `volunteers`/`resources`, propose the exact column to that table's owner (Person 2 or Person 3) rather than adding it directly — see `supabase-development`.

# Validation
Before calling the AI/matching layer done: test the happy path (Gemini succeeds, valid schema), test the fallback path (force a Gemini failure or timeout, confirm classification still completes manually), and confirm the matching score is reproducible — same inputs produce the same score and same reasons, since non-determinism here would undermine the "explainable" claim.

# Failure Handling
Never let a Gemini failure surface as a broken request-creation flow. Never let the matching score be returned without its `reasons`. If the deterministic weights haven't been agreed on, use documented placeholder weights and flag them clearly as placeholders rather than silently picking arbitrary numbers.

# Output Format
```
AI CALL: <what was requested from Gemini>
SCHEMA VALIDATED: yes/no
FALLBACK TESTED: yes/no, <what triggered it and what happened>
MATCH SCORE FACTORS USED: <list with current weights>
REASONS INCLUDED: yes/no
```

# Examples
**Good:** "Category/urgency classification via Gemini, schema-validated against `{category: enum, urgency: enum, confidence: number}`. Forced a timeout — fallback correctly defaulted to manual category selection in the UI, request still created successfully. Match score uses distance (40%), skill match (25%), urgency (20%), availability (10%), trust (5%) — weights documented in `lib/matching.ts` header comment. Reasons array included on every score."

**Bad:** "Match score comes straight from a Gemini prompt asking it to rate compatibility 1-100" — non-deterministic, unexplainable, and puts a safety-relevant decision inside an LLM call with no fallback. This is exactly the pattern this skill exists to prevent.
