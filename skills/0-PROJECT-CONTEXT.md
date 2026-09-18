# NexoraLink — Shared Project Context

All skills in `.agents/skills/` reference this file instead of repeating it. Read this before using any skill.

## Stack
Frontend: Next.js, React, TypeScript, Tailwind CSS
Backend: Next.js server/API routes, TypeScript (no separate Express service)
Database: Supabase PostgreSQL
Auth: Supabase Auth
AI: Gemini API
Maps: Leaflet + OpenStreetMap (never Google Maps API)
Deploy: Vercel

Do not introduce additional technologies without a concrete technical reason recorded in the change.

## Request Lifecycle (authoritative — do not invent alternate states)
```
REQUESTED → ANALYZED → MATCHING → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED
```

## Roles — kept conceptually separate, never merged
- **Requester/Citizen** — creates and tracks help requests
- **Volunteer** — provides time, skills, assistance (not resources)
- **NGO/Resource Provider** — provides resources and organizational capacity (not personal time/skills)
- **Admin/Coordinator** — oversight, verification, monitoring, resource-gap detection

## Git Ownership — ONE FILE = ONE OWNER
| Branch | Owner | Owns |
|---|---|---|
| `feature/frontend` | Person 1 | All of `apps/web` — complete frontend/UI |
| `feature/backend-request` | Person 2 | Supabase Auth wiring, profiles, requester flows, help requests, request lifecycle, feedback |
| `feature/backend-management` | Person 3 | Volunteers, volunteer skills/availability, NGOs, resources, resource requests/allocation, admin management, reputation/trust |
| `feature/ai-integration` | Person 4 | Gemini integration, AI request analysis, urgency detection, matching algorithm, resource-gap detection, Leaflet integration, integration testing, final QA |

Shared files must have exactly one explicit owner; others request changes through that owner rather than editing directly.

## Priority Discipline (6-hour constraint)
P0 = required for a working demo. P1 = build only once P0 is stable. P2 = optional, never allowed to delay P0.
Bias toward simple + reliable + demonstrable over complex + theoretical + unfinished.

**Explicitly out of scope:** microservices, unnecessary abstraction layers, complex ML models, real KYC, payment systems, real emergency infrastructure, chat/video systems, unnecessary notification infrastructure, a mobile app, unnecessary libraries.

## Non-Negotiable AI Behavior Rules (apply across every skill)
- Do not blindly agree with the developer. If a proposal is technically weak: state PROBLEM → WHY → RISK → BETTER APPROACH → IMPLEMENTATION IMPACT before proceeding.
- Never invent APIs, database columns, endpoints, library behavior, Supabase capabilities, Gemini behavior, or Leaflet capabilities. If unknown, say `UNVERIFIED` and go inspect the repo/docs/tools before answering.
- Never claim code was tested if it wasn't run.
- AI (Gemini) must never independently make medical or emergency decisions — it classifies and suggests; humans and deterministic logic decide.
