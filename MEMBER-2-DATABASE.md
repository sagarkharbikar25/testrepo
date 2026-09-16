# MEMBER 2 — Complete Database & DevOps

## Role
Database Architect & Deployment Manager — Supabase, SQL, RLS, Vercel, Render.

## Strategy: Zero Merge Conflicts
You are the **ONLY** person allowed to touch the `supabase/` directory. No one else is allowed to edit these files. You also manage the online platforms (Supabase Dashboard, Render, Vercel). Your branch `member2-database` will never have a merge conflict.

## Branches
Branch name: `member2-database`
Base: `main`

## AI Acceleration (Allowed)
- Use AI to generate complex SQL schemas, trigger functions, and Row Level Security (RLS) policies.
- **Extra Feature Added:** Use AI to generate an advanced "Geospatial indexing" SQL script for PostGIS in Supabase to make distance matching lightning fast.

## Files Owned
**ALL files inside `supabase/`**
```
supabase/
├── migrations/
│   └── 001_initial_schema.sql
├── seed/
│   └── seed.sql
└── rls/
    └── policies.sql
```

## Hour-by-Hour Plan (6 Hours)

### Hour 1: Schema & Supabase Setup
- Create a Supabase project at supabase.com.
- Share the `SUPABASE_URL` and `SUPABASE_ANON_KEY` and `SERVICE_ROLE_KEY` with the team.
- **AI Prompt:** *"Write a PostgreSQL schema for a community help platform with tables for profiles, requests (with lat/lng), matches, and resources. Include ENUMs for urgency (LOW, MEDIUM, HIGH, CRITICAL)."*
- Execute the schema in Supabase SQL Editor.

### Hour 2: Security & RLS
- Write and execute Row Level Security policies.
- Ensure requesters can only see their own data unless it's public.
- Ensure volunteers can read all open requests.
- **AI Prompt:** *"Write Supabase RLS policies for a 'requests' table where the creator can UPDATE it, but anyone with the 'volunteer' role in their profile can only UPDATE the status."*

### Hour 3: Mock Data Generation
- **AI Prompt:** *"Generate a massive SQL seed script with 50 realistic users (Indian names), 100 requests in various states (open, in_progress, completed) scattered across Nagpur city coordinates."*
- Run the seed script so Member 1 and Backend team have rich data to test against.

### Hour 4: Triggers & PostGIS (Extra Feature)
- Enable PostGIS extension in Supabase.
- Write a trigger to automatically update the `updated_at` column.
- Write a trigger to insert a row into an `impact_feed` table whenever a request is marked 'completed'.

### Hour 5: Backend Deployment (Render)
- Help Member 3 & 4 deploy `apps/api/` to Render.
- Manage all Environment Variables on the Render dashboard.

### Hour 6: Frontend Deployment (Vercel) & Testing
- Help Member 1 deploy `apps/web/` to Vercel.
- Configure Vercel environment variables.
- Monitor Supabase database logs during the final E2E demo run.
