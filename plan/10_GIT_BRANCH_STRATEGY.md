# 10 — NexoraLink Git Branch Strategy

## Branch Decision: No `develop` Branch

For a 6-hour hackathon with 4 people working in parallel, a `develop` branch adds merge complexity without benefit. We use:

```
main ← final working product (merge only at Hours 3 and 5)
feature/frontend
feature/backend-request
feature/backend-management
feature/ai-integration
```

**Integration strategy**: Progressive merges at Hour 3 and Hour 5. Final merge at Hour 5.5.

---

## Branch Creation (First 15 Minutes)

**Person 2 (repo owner) runs first:**
```bash
# Initialize repo
git init nexoralink
cd nexoralink
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Set up .env.example (frozen after this)
cat > .env.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
EOF

# First commit — ONLY Person 2 does this
git add .
git commit -m "chore: initialize Next.js project with TypeScript + Tailwind"
git branch -M main
git remote add origin <repo-url>
git push -u origin main
```

**All others clone and create their branch:**
```bash
# Person 1
git clone <repo-url>
git checkout -b feature/frontend

# Person 3
git clone <repo-url>
git checkout -b feature/backend-management

# Person 4
git clone <repo-url>
git checkout -b feature/ai-integration
```

---

## File Ownership Table

| File / Directory | Owner | Others may edit? |
|-----------------|-------|-----------------|
| `src/app/layout.tsx` | Person 2 (initial setup) | NO — frozen after Hour 0 |
| `src/app/globals.css` | Person 1 | Person 2 adds Leaflet import ONCE in Hour 0 |
| `src/app/page.tsx` | Person 1 | NO |
| `src/app/(auth)/**` | Person 1 | NO |
| `src/app/(requester)/**` | Person 1 | NO |
| `src/app/(volunteer)/**` | Person 1 | NO |
| `src/app/(ngo)/**` | Person 1 | NO |
| `src/app/(admin)/**` | Person 1 | NO |
| `src/app/api/auth/**` | Person 2 | NO |
| `src/app/api/requests/**` | Person 2 | NO |
| `src/app/api/feedback/**` | Person 2 | NO |
| `src/app/api/volunteers/**` | Person 3 | NO |
| `src/app/api/ngos/**` | Person 3 | NO |
| `src/app/api/resources/**` | Person 3 | NO |
| `src/app/api/admin/**` | Person 3 | NO |
| `src/app/api/ai/**` | Person 4 | NO |
| `src/app/api/matches/**` | Person 4 | NO |
| `src/components/**` | Person 1 | NO |
| `src/features/requester/**` | Person 1 | NO |
| `src/features/volunteer/**` | Person 1 | NO |
| `src/features/ngo/**` | Person 1 | NO |
| `src/features/admin/**` | Person 1 | NO |
| `src/features/auth/**` | Person 1 (UI), Person 2 (logic) | Split — see below |
| `src/features/map/NexoraMap.tsx` | Person 4 | NO — import only |
| `src/lib/supabase/client.ts` | Person 2 | NO |
| `src/lib/supabase/server.ts` | Person 2 | NO |
| `src/lib/gemini.ts` | Person 4 | NO |
| `src/lib/matching.ts` | Person 4 | NO |
| `src/lib/geo.ts` | Person 4 | NO |
| `src/lib/utils.ts` | Person 2 (initial), frozen | NO changes without Person 2 approval |
| `src/lib/validation/auth.schema.ts` | Person 2 | NO |
| `src/lib/validation/request.schema.ts` | Person 2 | NO |
| `src/lib/validation/volunteer.schema.ts` | Person 3 | NO |
| `src/lib/validation/ngo.schema.ts` | Person 3 | NO |
| `src/lib/validation/resource.schema.ts` | Person 3 | NO |
| `src/lib/validation/ai.schema.ts` | Person 4 | NO |
| `src/lib/status-colors.ts` | Person 1 | NO |
| `src/types/auth.ts` | Person 2 | NO |
| `src/types/request.ts` | Person 2 | NO |
| `src/types/volunteer.ts` | Person 3 | NO |
| `src/types/ngo.ts` | Person 3 | NO |
| `src/types/resource.ts` | Person 3 | NO |
| `src/types/admin.ts` | Person 3 | NO |
| `src/types/matching.ts` | Person 4 | NO |
| `src/types/ai.ts` | Person 4 | NO |
| `src/middleware.ts` | Person 2 | NO |
| `supabase/migrations/001_*.sql` | Person 2 | NO |
| `supabase/migrations/002_*.sql` | Person 2 | NO |
| `supabase/migrations/003_*.sql` | Person 3 | NO |
| `supabase/migrations/004_*.sql` | Person 3 | NO |
| `supabase/migrations/005_*.sql` | Person 4 | NO |
| `package.json` | Person 2 | Others REQUEST changes via Person 2 |
| `package-lock.json / yarn.lock` | Person 2 | Auto-updated only |
| `.env.example` | Person 2 (initial) | Person 4 adds GEMINI_API_KEY once |
| `.env.local` | Individual (NOT committed) | Each person maintains own |
| `README.md` | Person 2 (initial), Person 4 (final) | Person 4 fills demo section |
| `next.config.js` | Person 2 | NO |
| `tailwind.config.ts` | Person 1 | NO |
| `tsconfig.json` | Person 2 | NO |

---

## Shared File Protocol

### `package.json` (Owner: Person 2)
When any person needs a new package:
1. Send message to Person 2: "Please add [package] [version] to dependencies"
2. Person 2 runs `npm install [package]`
3. Person 2 commits the package.json change
4. Others `git fetch` and `git rebase` to get the update

### `src/types/` files (Each person owns their file)
- No barrel `index.ts` — import directly: `import type { HelpRequest } from '@/types/request'`
- Each person only writes to their own type file
- If you need a type from another person's file, import it — never copy it

### `.env.local` (NOT in git)
Each person creates their own `.env.local` from `.env.example`.

---

## Commit Naming Convention

Format: `type(scope): description`

Types: `feat`, `fix`, `chore`, `refactor`, `test`

```
# Good examples
feat(auth): add register API route with profile creation
feat(volunteer): implement nearby request query with PostGIS
feat(ai): add Gemini analysis with Zod validation and fallback
feat(map): implement NexoraMap with urgency-colored markers
fix(matching): correct distance score calculation
chore(db): add migration 003 volunteers table

# Bad examples (too vague)
update stuff
fix bug
wip
```

---

## Progressive Merge Schedule

### Hour 0 (Setup)
- Person 2 pushes initial Next.js scaffold to `main`
- All others pull `main` and create their branches

### Hour 3 — First Integration Merge
Purpose: Unblock frontend from consuming real API data.

**Merge order:**
```
feature/backend-request → main    (Person 2 opens PR, Person 4 reviews)
feature/backend-management → main (Person 3 opens PR, Person 2 reviews)
feature/frontend → main           (Person 1 opens PR, Person 3 reviews)
```

After each merge, others rebase:
```bash
git fetch origin
git rebase origin/main
```

### Hour 5 — Second Integration Merge
Purpose: Bring AI + matching into the integrated build.

```
feature/ai-integration → main     (Person 4 opens PR, Person 1 reviews)
feature/frontend → main           (with updated UI connecting to AI endpoints)
```

### Hour 5.5 — Final Merge + Deploy
```bash
# All feature branches merged into main
# Vercel auto-deploys
# Test live URL
```

---

## Rebase Strategy (NOT merge)

Use `git rebase origin/main` instead of `git merge origin/main` for keeping branches updated. This keeps history clean and reduces conflict surface.

```bash
# Daily (every hour) rebase ritual:
git fetch origin
git rebase origin/main
# If conflicts: resolve, then git rebase --continue
```

---

## BEFORE PUSH CHECKLIST

Every developer must run this before pushing:

```bash
# 1. Check what files changed
git status
git diff --name-only HEAD

# 2. Verify you only touched YOUR files
# Cross-reference with the ownership table above

# 3. Fetch latest main
git fetch origin

# 4. Rebase on main
git rebase origin/main

# 5. Build check
npm run build

# 6. TypeScript check
npx tsc --noEmit

# 7. Only stage YOUR files
git add src/app/api/requests/          # Example for Person 2
# NEVER: git add .   (this stages everything including others' files)

# 8. Commit with conventional format
git commit -m "feat(requests): add POST /api/requests with status history"

# 9. Push to your branch
git push origin feature/backend-request

# 10. Open PR on GitHub — request review from assigned reviewer
```

---

## Conflict Prevention Rules

1. **Never run `git add .`** — always stage specific files you own
2. **Never push to `main` directly** — always via PR
3. **Never edit another person's file** even for a "small fix" — raise in group chat
4. **If you accidentally modify a shared file**: `git checkout HEAD -- <file>` to discard
5. **Rebase every hour** to pull in others' merged changes early
6. **Types first**: Person 2 publishes `types/request.ts` and `types/auth.ts` by Hour 1 so others can import

---

## Emergency Conflict Resolution

If a conflict occurs during rebase:
1. `git rebase --abort` to back out
2. Message the file's owner
3. Owner rebases their branch on main first
4. You then rebase after owner's changes are in main

If the same function is accidentally modified by two people:
1. Keep the version from the file's designated owner
2. Discard the other person's changes to that function
3. The non-owner re-implements what they needed in their own file
