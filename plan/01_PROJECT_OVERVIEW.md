# 01 — NexoraLink Project Overview

## Project Name
**NexoraLink**

## Hackathon Theme
**Cooperation** — Creating platforms that facilitate better communication and resource sharing within local neighborhoods or NGOs.

## Elevator Pitch
NexoraLink is an AI-powered community coordination platform that connects people who need help with nearby volunteers, NGOs, and physical resources — turning a plain-language help request into a coordinated, trackable assistance workflow within minutes.

## Core Value Proposition
A citizen types: *"My elderly neighbor needs medicine but nobody is available to pick it up."*

NexoraLink:
1. Understands the request using Gemini AI
2. Classifies category → `medical`, task → `medicine_pickup`
3. Detects urgency → `HIGH`
4. Finds nearby volunteers with matching skills within configurable radius
5. Calculates a transparent match score (distance + skill + availability + trust)
6. Notifies the best-matched volunteer
7. Tracks the request from `REQUESTED` → `COMPLETED`
8. Exposes resource gaps to the admin coordinator
9. Shows everything live on a Leaflet + OpenStreetMap map

---

## User Roles

| Role | Who they are | Primary action |
|------|-------------|----------------|
| **Requester** | Citizens who need help | Create and track help requests |
| **Volunteer** | Individuals offering time/skill | Accept and fulfill requests |
| **NGO** | Organizations offering resources | Manage and allocate resources |
| **Admin** | Coordinator / hackathon judge view | Monitor, verify, and analyze |

---

## What Makes This Non-CRUD

- **AI-powered understanding**: Gemini extracts category, task type, urgency from free text
- **Deterministic weighted matching**: Distance × Skill × Availability × Urgency × Trust → numeric score
- **End-to-end lifecycle**: 7-stage request pipeline with status transitions
- **Resource gap detection**: Compares active request count vs available supply per category
- **Live map coordination**: Leaflet map with role-differentiated markers
- **NGO ↔ Volunteer distinction**: Two completely separate provider concepts

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (server actions where appropriate) |
| Database | Supabase PostgreSQL + Supabase Auth |
| AI | Google Gemini API (gemini-1.5-flash) |
| Maps | Leaflet.js + OpenStreetMap tiles |
| Deployment | Vercel (primary), Render only if separate service needed |

---

## Request Lifecycle (P0 — Must Work for Demo)

```
REQUESTED → AI_ANALYZED → MATCHING → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED
```

- `REQUESTED`: Citizen submits text request
- `AI_ANALYZED`: Gemini returns category + urgency + structured data
- `MATCHING`: System calculates scores for nearby volunteers/NGOs
- `ASSIGNED`: Best match shown to requester; volunteer notified
- `ACCEPTED`: Volunteer confirms they will help
- `IN_PROGRESS`: Volunteer marks start
- `COMPLETED`: Volunteer marks done; requester can rate

---

## MVP Scope (6 Hours)

### P0 — Non-negotiable (Demo blockers)
- Auth (login/register with role)
- Create help request with AI analysis
- Volunteer sees nearby requests with match score
- Volunteer accepts request → status changes
- Volunteer marks IN_PROGRESS → COMPLETED
- Requester sees status changes
- Admin dashboard with counts + map
- Leaflet map showing requests + volunteers
- NGO can add a resource
- Resource gap detection (basic)

### P1 — Important but not demo-blocking
- Feedback/rating after completion
- Volunteer profile with skills
- NGO resource request handling
- Request history per user
- Availability toggle for volunteers

### P2 — Only if time allows
- Real-time status updates (polling fallback acceptable)
- Notification system
- Advanced analytics
- Resource allocation workflow

---

## Team

| Person | Role | Branch |
|--------|------|--------|
| Person 1 | Complete Frontend | `feature/frontend` |
| Person 2 | Backend: Auth + Requester | `feature/backend-request` |
| Person 3 | Backend: Volunteer + NGO + Admin | `feature/backend-management` |
| Person 4 | AI + Matching + Leaflet + Integration | `feature/ai-integration` |

---

## Demo Scenario (Must be functional by Hour 5)

> **Scenario A — Help Request Lifecycle**
> 1. Citizen logs in → creates request: *"My elderly neighbor needs medicine pickup urgently"*
> 2. AI analyzes → category: medical, urgency: HIGH
> 3. System finds Rahul (1.2km, skill match 100%, trust 4.8) → score: 94%
> 4. Volunteer Rahul logs in → sees request with score → accepts
> 5. Status: ACCEPTED → IN_PROGRESS → COMPLETED
> 6. Admin dashboard shows updated stats
> 7. Map shows both pins resolved

> **Scenario B — NGO Resource Gap (P1)**
> 1. Admin map shows 23 medical requests, 5 medical volunteers
> 2. System flags: "Medical assistance resource gap detected"
> 3. NGO logs in → adds 50 medicine packets at coordinates
> 4. Gap indicator updates

---

## Success Criteria for Judges

The demo must visibly show:
- ✅ AI understanding free-text input (not a dropdown)
- ✅ Urgency badge automatically set
- ✅ Match score with breakdown
- ✅ Live map with markers
- ✅ Status tracking timeline
- ✅ Admin coordination view
- ✅ Resource gap warning
- ✅ End-to-end from request to completion
