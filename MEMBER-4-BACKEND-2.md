# MEMBER 4 — Backend Part 2 (Features & AI)

## Role
Backend Engineer — Matching Logic, NGO Features, Resources, and Gemini AI.

## Strategy: Zero Merge Conflicts
You and Member 3 share the `apps/api/` directory. To prevent merge conflicts, you will **only create new files** and never edit Member 3's files (especially `index.ts`). You will build your routes and controllers, and then Slack/WhatsApp Member 3 to import them into `index.ts`.

## Branches
Branch name: `member4-backend-features`
Base: `main`

## AI Acceleration (Allowed)
- Use Gemini/ChatGPT to write the complex geographic distance calculation algorithms and the AI integration wrapper.
- **Extra Feature Added:** Integrate Gemini API to automatically read the description of a help request and output a suggested `urgency` level and `category` if the user leaves them blank.

## Files Owned
You own these specific files inside `apps/api/src/`:
```
apps/api/src/
├── routes/
│   ├── match.routes.ts
│   ├── ngo.routes.ts
│   └── resource.routes.ts
├── controllers/
│   ├── match.controller.ts
│   ├── ngo.controller.ts
│   └── resource.controller.ts
├── services/
│   ├── matching.service.ts
│   └── gemini.service.ts
└── schemas/
    ├── match.schema.ts
    └── resource.schema.ts
```
*(Do not edit `index.ts`! Ask Member 3 to mount your routes).*

## Hour-by-Hour Plan (6 Hours)

### Hour 1: Setup & Planning
- Wait for Member 3 to push the initial `package.json` for `apps/api/`.
- Pull `main`, create your branch `member4-backend-features`.
- Scaffold your empty controller and route files.
- Tell Member 3: *"I created match.routes.ts, please mount it in index.ts."*

### Hour 2: The Matching Engine
- Create `match.routes.ts` and `match.controller.ts`.
- Build `POST /api/matches/:id/accept` (Volunteer accepts a request).
- Implement the Race Condition guard: Handle the Supabase unique constraint error if two volunteers accept the same request at the same time.
- Build `PATCH /api/requests/:id/status` (Update status to in_progress / completed).

### Hour 3: Gemini AI Integration
- Install `@google/genai` (or use fetch directly).
- Create `gemini.service.ts`.
- Build `POST /api/ai/categorize`.
- **AI Prompt:** *"Write a Node.js function using the Gemini API that takes a string of text describing a person in need, and returns a JSON object with 'category' (food, medicine, shelter) and 'urgency' (LOW, MEDIUM, HIGH, CRITICAL)."*

### Hour 4: NGO & Resource Endpoints
- Create `ngo.routes.ts` and `ngo.controller.ts`.
- Build `GET /api/ngo/dashboard` (Returns aggregated stats for NGOs).
- Create `resource.routes.ts` (Listings of available goods).

### Hour 5: Integration & Testing
- Ensure all your routes use Member 3's `auth.middleware.ts` to protect them.
- Run local tests on your routes using Postman.
- Add Zod validation to your inputs.

### Hour 6: Production Support
- Help Member 2 and 3 ensure the Render deployment works.
- Generate backup mock responses for the Gemini API just in case rate limits are hit during the live demo.
