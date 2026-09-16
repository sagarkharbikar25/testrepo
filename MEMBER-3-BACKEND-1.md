# MEMBER 3 — Backend Part 1 (Core & Auth)

## Role
Backend Engineer — Express Setup, Middleware, Auth, and Request Routes.

## Strategy: Zero Merge Conflicts
You and Member 4 share the `apps/api/` directory. To prevent merge conflicts, you own **specific files**. Member 4 will create completely separate files. **You are the ONLY person allowed to edit `index.ts`.** When Member 4 creates their route files, they will tell you the filename, and you will add the `app.use()` line to `index.ts`.

## Branches
Branch name: `member3-backend-core`
Base: `main`

## AI Acceleration (Allowed)
- Use AI to generate Zod schemas, Express middleware, and complex Supabase JS queries.
- **Extra Feature Added:** Add an AI-powered "Trust Score" middleware that analyzes a user's completion rate and adds a trust badge boolean to the profile response.

## Files Owned
You own these specific files inside `apps/api/src/`:
```
apps/api/src/
├── index.ts                  <-- ONLY YOU EDIT THIS
├── lib/
│   └── supabase.ts           <-- Shared client setup
├── middleware/
│   ├── auth.middleware.ts
│   └── role.middleware.ts
├── routes/
│   ├── auth.routes.ts
│   └── request.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   └── request.controller.ts
└── schemas/
    ├── auth.schema.ts
    └── request.schema.ts
```

## Hour-by-Hour Plan (6 Hours)

### Hour 1: Express Initialization
- `mkdir apps/api && cd apps/api && npm init -y`
- Install `express cors dotenv zod @supabase/supabase-js`.
- Create `index.ts` with basic Express setup and CORS.
- Set up `lib/supabase.ts` using the service role key provided by Member 2.

### Hour 2: Auth & Middleware
- Create `auth.middleware.ts` to verify Supabase JWTs.
- Create `auth.routes.ts` and `auth.controller.ts`.
- Build the `POST /api/auth/profile` endpoint to save user profiles after Supabase signup.
- **AI Prompt:** *"Write an Express middleware in TypeScript that verifies a Supabase JWT from the Authorization header and fetches the user's role from a 'profiles' table."*

### Hour 3: Request CRUD
- Create `request.routes.ts` and `request.controller.ts`.
- Build `POST /api/requests` (Create).
- Build `GET /api/requests` (List open requests, sorted by urgency).
- Build `GET /api/requests/my` (List my requests).

### Hour 4: Integrating Member 4's Work
- Member 4 will tell you they have created `match.routes.ts` and `ngo.routes.ts`.
- YOU open `index.ts` and add:
  `import matchRoutes from './routes/match.routes';`
  `app.use('/api/matches', matchRoutes);`
- Test the combined API locally using Postman.

### Hour 5: Refinement & Validation
- Ensure all your POST/PUT routes use Zod for body validation.
- Implement robust error handling (return clean JSON errors, no stack traces to frontend).
- Assist Member 2 with deploying the API to Render.

### Hour 6: Production Monitoring
- Keep the Render API "warm" (ping it so it doesn't sleep).
- Watch Render logs during the final demo tests to ensure no 500 errors occur on your routes.
