# REPO-AND-DEPLOYMENT.md — Repository Structure & Git Strategy

---

## Repository Structure (Zero Merge Conflict Design)

We use a monorepo approach where file ownership is strictly divided among the 4 members. 

```
civicbridge/
├── apps/
│   ├── web/                    # MEMBER 1 OWNS THIS ENTIRE FOLDER
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── package.json
│   │   └── tailwind.config.ts
│   │
│   └── api/                    
│       ├── package.json        # MEMBER 3 OWNS
│       └── src/
│           ├── index.ts        # MEMBER 3 OWNS
│           ├── lib/            # MEMBER 3 OWNS
│           ├── middleware/     # MEMBER 3 OWNS
│           ├── routes/
│           │   ├── auth...     # MEMBER 3 OWNS
│           │   ├── request...  # MEMBER 3 OWNS
│           │   ├── match...    # MEMBER 4 OWNS
│           │   └── ngo...      # MEMBER 4 OWNS
│           ├── controllers/    # Split exactly like routes (M3 vs M4)
│           └── services/       # MEMBER 4 OWNS
│
├── supabase/                   # MEMBER 2 OWNS THIS ENTIRE FOLDER
│   ├── migrations/
│   ├── seed/
│   └── rls/
│
├── docs/                       # Shared Documentation
├── .gitignore
├── README.md
└── package.json                
```

---

## Git Strategy: Member-Wise Branches

**Decision: 4 Permanent Branches (No feature branches).**

### The Branches
1. `member1-frontend`
2. `member2-database`
3. `member3-backend-core`
4. `member4-backend-features`

### Merge Protocol
At the end of the hackathon (Hour 5), you will merge into `main`. Because M1 is only in `apps/web/`, M2 is only in `supabase/`, and M3/M4 have strictly segregated files in `apps/api/`, **Git will auto-merge everything with 0 conflicts.**

*Note: Member 4 must communicate with Member 3 so Member 3 can import Member 4's routes into `index.ts`. Member 4 never edits `index.ts`.*

---

## Deployment Instructions

### Supabase (Database - M2)
- Hosted service. M2 runs SQL scripts via the Supabase dashboard.

### Render (Backend - M2/M3/M4)
- Linked to GitHub `main` branch.
- Root Directory: `apps/api`
- Build Command: `npm install && npm run build`
- Start Command: `node dist/index.js`

### Vercel (Frontend - M1/M2)
- Linked to GitHub `main` branch.
- Root Directory: `apps/web`
- Build Command: `npm run build`
