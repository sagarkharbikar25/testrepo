# MEMBER 1 — Complete Frontend

## Role
Lead Frontend Developer — Next.js, UI/UX, Component Architecture.

## Strategy: Zero Merge Conflicts
You are the **ONLY** person allowed to touch the `apps/web/` directory. No one else is allowed to edit these files. This ensures your branch `member1-frontend` will never have a merge conflict.

## Branches
Branch name: `member1-frontend`
Base: `main`

## AI Acceleration (Allowed)
Since AI is allowed, your goal is to build the UI at lightning speed:
- Use **v0.dev** by Vercel to generate UI components (Dashboard, Request Forms).
- Use **Cursor IDE** or GitHub Copilot to rapidly wire up API calls using `fetch`.
- **Extra Feature Added:** Add a real-time "Activity Feed" component powered by AI to simulate real-time updates without WebSockets (just poll every 5 seconds).

## Files Owned
**ALL files inside `apps/web/`**
```
apps/web/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (requester)/...
│   ├── (volunteer)/...
│   └── (ngo)/...
├── components/
│   ├── ui/ (shadcn)
│   ├── shared/
│   ├── requester/
│   └── volunteer/
├── lib/
│   ├── api.ts
│   ├── types.ts
│   └── mock.ts
└── tailwind.config.ts
```

## Hour-by-Hour Plan (6 Hours)

### Hour 1: Setup & Landing
- Run `npx create-next-app@latest apps/web --typescript --tailwind --app`
- Install shadcn/ui and add: button, input, card, badge, dialog.
- **AI Prompt:** *"Generate a modern Next.js landing page for a community help platform called CivicBridge. Dark theme, glassmorphism, hero section with 3 role choices."*

### Hour 2: Auth & Navigation
- Build Login & Register forms.
- Create the dashboard layout with Sidebar navigation.
- Use mock data to ensure the UI looks good immediately.

### Hour 3: Requester Flow
- Build Request Creation Form (Food, Medicine, etc.).
- Build "My Requests" list and Request Detail view.
- **AI Prompt:** *"Generate a complex React Hook Form with Zod validation for creating a help request (title, description, category dropdown, urgency radio buttons)."*

### Hour 4: Volunteer & NGO Flow
- Build the Volunteer feed (list of nearby requests).
- Build the "Accept Request" UI.
- Build the NGO table view for managing multiple volunteers.

### Hour 5: API Wiring
- Member 3 and 4 should have the API deployed by now.
- Replace all mock data in `lib/api.ts` with real `fetch` calls to `NEXT_PUBLIC_API_URL`.
- Handle loading and error states.

### Hour 6: Polish & Demo Prep
- Deploy `apps/web/` to Vercel.
- Add AI-generated micro-animations (framer-motion).
- Perform end-to-end testing of the UI.
