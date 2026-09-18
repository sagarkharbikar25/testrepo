---
name: git-safe-workflow
description: Safe Git workflow for NexoraLink's 4-branch, one-file-one-owner system — never push to main directly, never touch another developer's files.
---

# Purpose
Keep NexoraLink's 4 parallel branches mergeable without conflicts or accidental overwrites of another developer's work, for the full 6-hour build.

# When to Use
Before every commit, and before every merge/PR to `main`.

# When NOT to Use
Not a substitute for `final-validation` (the pre-demo functional checklist) — this skill covers Git safety specifically, not whether the feature works.

# Workflow
Before making any change:
```
git status
git branch --show-current
```
Confirm the current branch matches the developer's assigned ownership (see PROJECT-CONTEXT.md) before editing anything.

Before every commit:
```
git status
git diff --stat
git diff
```
Manually confirm every file listed is inside that branch owner's territory. If anything unexpected appears (e.g. a lockfile, an unrelated config file), stop and ask before committing it.

# NexoraLink-Specific Rules — the 4 branches
```
feature/frontend            → Person 1 → apps/web (all of it)
feature/backend-request     → Person 2 → auth wiring, profiles, help requests, lifecycle, feedback
feature/backend-management  → Person 3 → volunteers, NGOs, resources, admin, reputation
feature/ai-integration      → Person 4 → Gemini, matching, resource-gap detection, Leaflet, integration testing, final QA
```
**ONE FILE = ONE OWNER.** No developer edits a file outside their column above, even for a "quick fix" — flag the issue to the owner instead.

# File Ownership Rules
Never:
- push directly to `main`
- rewrite another developer's commits/history
- modify a file inside another developer's owned module
- modify unrelated files while working on something else
- add a dependency or modify `package.json` without the relevant owner's authorization
- commit `.env` or any secret
- modify a database migration file owned by another developer (see `supabase-development`)
- change architecture without explicit approval from the team

# Validation
Before opening a PR / merging to main:
1. `git status` — clean, nothing stray staged
2. `git diff --stat` against `main` — every path shown belongs to your ownership column
3. `git diff` — read it, don't just glance at the file list
4. Typecheck passes
5. Lint passes
6. Relevant tests/flows pass (see `final-validation` if this is near a demo checkpoint)
7. Build succeeds if the change could affect it

# Failure Handling
If a merge conflict occurs, it almost always means the ownership rule was violated somewhere — identify which file and which two branches touched it, and route the resolution to that file's actual owner rather than resolving it arbitrarily. Never force-push to `main` to "solve" a conflict.

If you discover you've already committed a change outside your ownership, don't silently leave it — flag it immediately so the actual owner can review it before it merges.

# Output Format
```
BRANCH: <current>
FILES CHANGED: <list>
OWNERSHIP CHECK: <all files confirmed within [branch]'s territory — yes/no, with exceptions named>
CHECKS: typecheck <pass/fail> · lint <pass/fail> · build <pass/fail/n-a>
READY TO MERGE: yes/no
```

# Examples
**Good:** "On `feature/ai-integration`. Files changed: `lib/gemini.ts`, `lib/matching.ts`, `app/api/ai/classify/route.ts` — all within AI-integration ownership. Typecheck/lint pass. Ready to merge."

**Bad:** committing a fix to `components/RequestCard.tsx` while on `feature/backend-request` because "it was a one-line change" — still a violation; route it to Person 1 instead.
