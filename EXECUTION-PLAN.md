# EXECUTION-PLAN.md — 6-Hour Sprint Plan (Member-Based)

## Pre-Hackathon Checklist (Do Before Clock Starts)

- [ ] Supabase project created, URL + keys copied (Member 2)
- [ ] Gemini API key obtained (Member 4)
- [ ] GitHub repo created with monorepo structure
- [ ] All 4 members added to repo
- [ ] Vercel project linked to GitHub (auto-deploy)
- [ ] Render account ready (manual deploy from GitHub)
- [ ] All members have Node.js 20 installed
- [ ] All members have `pnpm` or `npm` installed
- [ ] .env.example files shared via Discord/WhatsApp
- [ ] AI Tools (Cursor, v0.dev, ChatGPT) open and ready for acceleration

---

## The AI Advantage (Extra Features)
Since AI is permitted, we are injecting extra functionality:
1. **M1:** AI-Generated Live Activity Feed.
2. **M2:** PostGIS Geospatial matching.
3. **M3:** AI-Powered User Trust Scoring.
4. **M4:** Auto-categorization of help requests via Gemini.

---

## Timeline

### Hour 1: Foundation & Scaffold
- **M1 (Frontend):** Inits Next.js app in `apps/web`. Uses v0.dev to generate the landing page and Auth UI.
- **M2 (Database):** Sets up Supabase. Uses AI to write PostGIS schema and RLS policies.
- **M3 (Backend 1):** Inits Express app in `apps/api`. Sets up `index.ts` and `auth.routes.ts`.
- **M4 (Backend 2):** Scaffolds `match.routes.ts` and `resource.routes.ts` in `apps/api/src/routes`.

### Hour 2: Core Auth & Data Structures
- **M1 (Frontend):** Wires up Supabase Auth and builds the complex Request Form using AI-generated Zod schemas.
- **M2 (Database):** Generates 100+ realistic seed data rows using ChatGPT and populates the DB.
- **M3 (Backend 1):** Completes the `auth.middleware.ts` and `request.routes.ts`.
- **M4 (Backend 2):** Writes the distance calculation algorithm and connects Gemini for auto-categorization.

### Hour 3: Dashboard & AI Integration
- **M1 (Frontend):** Builds the Volunteer Feed and Request Detail pages.
- **M2 (Database):** Adds triggers for the Impact Feed and Trust Scoring metrics.
- **M3 (Backend 1):** Tests all `POST` and `GET` request endpoints with Postman.
- **M4 (Backend 2):** Finishes NGO aggregation endpoints and Resource listing APIs.

### Hour 4: Wiring It Together
- **M1 (Frontend):** Replaces mock data with real API calls using the `NEXT_PUBLIC_API_URL`.
- **M2 (Database):** Helps M3 & M4 deploy the `apps/api` folder to Render.
- **M3 (Backend 1):** Mounts all of M4's routes inside `index.ts` (Zero Merge Conflict strategy).
- **M4 (Backend 2):** Hardens API against rate limits, adds Zod validation to bodies.

### Hour 5: Polish & Deployment
- **M1 (Frontend):** Adds framer-motion micro-animations. Deploys to Vercel.
- **M2 (Database):** Configures Vercel Env Vars. Double-checks RLS policies against production data.
- **M3 (Backend 1):** Tests CORS from the Vercel deployed frontend to Render.
- **M4 (Backend 2):** Verifies the Gemini API is correctly classifying data in production.

### Hour 6: Demo Rehearsal
- **ALL MEMBERS:** Stop coding.
- Create 3 fresh demo accounts (Requester, Volunteer, NGO).
- Run the full end-to-end path on the live Vercel URL.
- Prepare the 3-minute pitch.

---

## Branching Rules (Zero Conflicts)
- `member1-frontend`
- `member2-database`
- `member3-backend-core`
- `member4-backend-features`

DO NOT push to `main` until Hour 5. When you merge, there will be zero conflicts because each member owns totally separate file paths.
