---
name: feature-development
description: Reusable workflow for implementing any NexoraLink feature — inspect the repo and ownership before writing code, plan before implementing, validate and report the diff before calling anything done.
---

# Purpose
Implement NexoraLink features (frontend, API, database, or AI) without duplicating existing functionality, touching another developer's owned files, or introducing scope beyond what the 6-hour plan calls for.

# When to Use
Any time a developer asks you to build, add, or wire up a feature — a new screen, endpoint, table, or AI behavior.

# When NOT to Use
- Pure bug fixing with no new behavior → use `debugging` instead.
- Reviewing already-written code with no changes requested → use `code-review` instead.
- Pre-merge or pre-demo checks → use `final-validation` instead.

# Workflow
```
INSPECT → PLAN → IMPLEMENT → VALIDATE → REVIEW DIFF → REPORT
```

1. **INSPECT** — before writing anything:
   - `git status`, `git branch --show-current` — confirm you're on the correct feature branch for the current developer (see PROJECT-CONTEXT.md ownership table)
   - Read the existing implementation of anything adjacent to what you're about to touch
   - Identify which files the requested change actually requires
   - Identify whether the requested files fall inside the current branch owner's territory — if not, stop and say so rather than editing
   - Check for existing functionality that already does this — do not duplicate
2. **PLAN** — state in 3-6 lines: what will change, which files, why this is the smallest safe implementation, and whether it's P0/P1/P2 per PROJECT-CONTEXT.md priority rules. If it's P1/P2, confirm P0 is actually done first.
3. **IMPLEMENT** — smallest change that satisfies the request. No speculative abstraction, no "while I'm in here" refactors of unrelated code.
4. **VALIDATE** — typecheck, lint, and run/build as appropriate for what changed (see `final-validation` for the full checklist if this is close to a merge point).
5. **REVIEW DIFF** — `git diff --stat` then `git diff` — confirm only intended, owned files changed.
6. **REPORT** — what was built, what was verified vs. left `UNVERIFIED`, and any follow-up needed.

# NexoraLink-Specific Rules
- Never implement a feature that merges Volunteer and NGO concepts — they are structurally separate (see PROJECT-CONTEXT.md).
- Never invent a lifecycle state outside `REQUESTED → ANALYZED → MATCHING → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED`.
- Never add a new technology/library without stating the concrete technical reason in the PLAN step.

# File Ownership Rules
Follow the branch ownership table in PROJECT-CONTEXT.md exactly. If the feature spans two owners' territory (e.g., a frontend screen needs a new API field), implement only your own side and state explicitly what the other owner needs to add — do not cross the boundary yourself, even temporarily "to unblock."

# Validation
Before reporting a feature done: typecheck passes, lint passes, the specific flow was actually exercised (manually or via test), and the diff contains no files outside your ownership. Anything not actually exercised is reported as `UNVERIFIED`, not as done.

# Failure Handling
If implementation reveals the plan was wrong (missing dependency, wrong assumption about existing code), stop, restate the problem using PROBLEM/WHY/RISK/BETTER APPROACH, and get confirmation before continuing — do not silently improvise a different implementation.

# Output Format
```
PLAN: <what and why>
FILES: <list, all within your ownership>
IMPLEMENTED: <summary>
VALIDATED: <what was actually checked> / UNVERIFIED: <what wasn't>
DIFF REVIEWED: <confirmed only owned files changed — yes/no>
```

# Examples
**Good:** "Adding urgency-color badge to RequestCard. Files: components/shared/RequestCard.tsx, components/shared/UrgencyBadge.tsx — both frontend-owned. Typecheck + lint pass. Manually verified all 4 urgency levels render distinct colors. Diff confirmed: only these 2 files changed."

**Bad:** "Added the badge and also cleaned up the API route file while I was there" — touches another owner's file without request or notice; this skill exists specifically to prevent that.
