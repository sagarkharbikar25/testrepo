---
name: debugging
description: Systematic NexoraLink debugging workflow — reproduce and trace before changing anything, never claim a fix works without re-verifying it.
---

# Purpose
Fix actual bugs in NexoraLink without random multi-file changes, hidden errors, or unverified "fixed it" claims — the failure mode this skill exists to prevent.

# When to Use
Any reported bug, failing build, runtime error, unexpected behavior, or "this doesn't work" report.

# When NOT to Use
- New feature work with no existing bug → use `feature-development`.
- A suspicion about code quality with nothing actually broken → use `code-review`.

# Workflow
```
REPRODUCE → INSPECT ERROR → TRACE EXECUTION → IDENTIFY ROOT CAUSE → PROPOSE FIX → IMPLEMENT → TEST → VERIFY
```

1. **REPRODUCE** — run the exact failing scenario yourself before touching code. If you cannot reproduce it, say so and ask for exact repro steps rather than guessing at a fix.
2. **INSPECT ERROR** — read the full error/stack trace, not just the first line. Check server logs and client console separately — a Next.js API route failure and a frontend fetch failure look similar but need different fixes.
3. **TRACE EXECUTION** — follow the actual code path involved (request → API route → Supabase call → response → UI), don't assume where the bug is.
4. **IDENTIFY ROOT CAUSE** — state it explicitly before writing any fix. If you're not sure, say `UNVERIFIED — suspected cause` and say what would confirm it.
5. **PROPOSE FIX** — smallest change that addresses the root cause, not the symptom.
6. **IMPLEMENT** — only the files needed, and only within your branch's ownership (see PROJECT-CONTEXT.md).
7. **TEST** — re-run the exact original repro scenario.
8. **VERIFY** — confirm the original error is gone AND nothing else broke (rerun adjacent flows if the fix touched shared logic like matching or lifecycle transitions).

# NexoraLink-Specific Rules
- A bug in AI categorization or matching is not automatically a Gemini bug — check the fallback path first (see `ai-matching`); many "AI is broken" reports are actually the fallback logic misfiring.
- A bug in accept/status-transition behavior should be checked against the exact lifecycle states in PROJECT-CONTEXT.md — an "invalid transition" is often the intended guard working correctly, not a bug.
- RLS-related failures (empty results, 401/403 where data should exist) should be checked against Supabase policies before assuming application code is at fault — see `supabase-development`.

# File Ownership Rules
If tracing the bug leads into a file outside your branch's ownership, stop and report the root cause to that file's owner rather than fixing it yourself — even for "quick" fixes, per PROJECT-CONTEXT.md's one-owner rule.

# Validation
"Fixed" means: reproduced originally, root cause identified, fix implemented, original repro re-run and confirmed clean, adjacent flows spot-checked. Any step skipped means the fix is reported as `UNVERIFIED`, not `FIXED`.

# Failure Handling
If the same symptom returns after a fix, do not apply a second, different fix on top without first re-tracing — stacking guesses hides the real root cause and often introduces a second bug.

# Output Format
```
REPRODUCED: <steps, actual outcome>
ROOT CAUSE: <what's actually wrong, or UNVERIFIED — suspected>
FIX: <what changed, files, all within your ownership>
RE-TESTED: <original repro result>
SIDE-EFFECT CHECK: <adjacent flows checked, or none needed and why>
```

# Examples
**Good:** "REPRODUCED: accepting a request as volunteer returns 500. ROOT CAUSE: matches insert violates FK because request_id references a request created before the AI columns migration ran — mismatched schema state, not a code bug. FIX: none needed in code; re-ran migration 002 (AI columns) against dev DB. RE-TESTED: accept succeeds now."

**Bad:** "Changed the error handling in three files, seems fixed now" — no reproduction, no stated root cause, no confirmation the original failure is actually gone.
