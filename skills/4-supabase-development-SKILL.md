---
name: supabase-development
description: NexoraLink-specific Supabase rules — schema ownership, RLS, migrations, and service-role key safety for the split between backend-request and backend-management branches.
---

# Purpose
Make schema, RLS, and query changes to NexoraLink's Supabase project safely, without duplicate tables, unowned migrations, or leaked service-role keys.

# When to Use
Creating/altering tables, writing RLS policies, writing migrations, or any query whose performance or correctness depends on schema design.

# When NOT to Use
- Pure frontend Supabase Auth client calls with no schema change → covered under `feature-development` instead.
- Reviewing someone else's already-written SQL → use `code-review`.

# Workflow
1. **Inspect existing schema first** — list current tables/columns before proposing a new one. Determine whether an existing table can be extended instead of creating a new one.
2. **Identify ownership** — per the table below, confirm which branch owns the table you're about to touch.
3. **Design** — relationships, constraints, indexes on any column used in a WHERE/ORDER BY (status, urgency, category, requester_id, location).
4. **Write the migration** — as its own file, never appended into another owner's existing migration file.
5. **Write RLS policies** alongside the table in the same migration — a table without RLS is not considered done.
6. **Verify** — run the migration against dev, confirm RLS actually blocks what it should (test with a non-owner JWT, not just the service role).

# NexoraLink-Specific Rules — table ownership
| Table area | Owner |
|---|---|
| `profiles`, `help_requests`, request lifecycle/status, `feedback` | Person 2 (backend-request) |
| `volunteers`, `volunteer_skills`, `volunteer_availability`, `ngos`, `resources`, `resource_requests`, `resource_allocations`, reputation/trust | Person 3 (backend-management) |
| AI-support columns/tables (e.g. request analysis results, match scores) | Person 4 (ai-integration) — but these typically *extend* Person 2's or Person 3's tables via `ALTER TABLE`, so coordinate before writing the migration rather than assuming the base table's shape |

- Never put the Supabase **service-role key** in frontend code — it only ever belongs in server-side Next.js API route environment variables.
- Every user-sensitive table needs an explicit RLS decision made and written down, even if the decision is "public read" — don't leave RLS unconsidered.
- Do not create a new table if an existing owned table can hold the data via a nullable column — check with that table's owner first.
- Never modify another developer's existing migration file — write a new migration that alters/extends it instead.

# File Ownership Rules
One migration file, one owner, matching the table ownership table above. If your feature needs a column on a table you don't own, propose the exact `ALTER TABLE` statement to that table's owner rather than writing it into their file yourself.

# Validation
Before calling a schema change done: migration runs clean against dev, RLS policy tested against a real non-privileged JWT (not just "policy exists"), and any new indexed column actually matches what the application queries filter/sort by.

# Failure Handling
If an RLS policy blocks legitimate access during testing, do not disable RLS to unblock the demo — fix the policy. Disabling RLS as a workaround is explicitly the kind of shortcut that breaks the "security enforced at the database layer" claim this project depends on for its Technical Complexity score.

# Output Format
```
TABLE/MIGRATION: <name, owner>
SCHEMA CHANGE: <what, why existing tables weren't sufficient>
RLS: <policy summary>
TESTED: <ran against dev — yes/no, RLS tested with non-owner JWT — yes/no>
```

# Examples
**Good:** "Adding `ai_match_score decimal(6,2)` and `is_escalated boolean` to `help_requests` (Person 2's table) via new migration `003_ai_columns.sql`. Coordinated with Person 2 first. RLS unchanged — these columns follow the existing requests RLS policy, verified by querying as a non-owner requester and confirming the columns return null/false as expected, not an error."

**Bad:** "Just added the AI columns directly into migration `001_initial_schema.sql`" — edits another owner's existing migration file, exactly what this skill exists to prevent.
