# PRD.md — Product Requirements Document

## Product Name
**CivicBridge**

## Tagline
> *"From neighbors who have, to neighbors who need — bridged in minutes."*

---

## Problem Statement

Community resource coordination in India is deeply fragmented. NGOs, volunteers, and local organizations exist and *want* to help — but they operate in silos. Requests for help are lost in WhatsApp groups. Volunteers don't know who to contact. NGOs duplicate efforts. People in need don't know where to look.

The result: resources sit unused while needs go unmet — not because of scarcity, but because of a **coordination gap**.

---

## Target Users

| Persona | Description |
|---|---|
| **Requester** | Individual in need — food, medicine, clothes, tutoring, transport |
| **Volunteer** | Individual willing to help with time, skills, or delivery |
| **Resource Provider** | Person/business with physical goods to donate |
| **NGO Admin** | Organization managing multiple volunteers, resources, drives |

---

## Personas

### Ritu, 34 — Requester
Single mother in Nagpur. Lost her job. Needs groceries for 3 days. She heard about CivicBridge from a neighbor. She opens the app, selects "Food & Groceries", enters her address, sets urgency to HIGH. Within 4 minutes, a volunteer 1.2 km away accepts.

### Aryan, 22 — Volunteer
College student in Pune. Has free weekends. Wants to contribute meaningfully. Signs up as volunteer, lists skills: delivery, tutoring. Gets pinged when a nearby request matches his profile. One tap to accept. Tracks completion.

### Anita, 45 — NGO Admin (Asha Foundation)
Runs a mid-sized NGO. Manages 30+ volunteers. Currently uses WhatsApp + Google Sheets. On CivicBridge, she can see all open requests, assign volunteers, track fulfillment, and generate weekly impact reports.

---

## Pain Points

- Requests in WhatsApp die without response or get buried
- No visibility into "is this request already being handled?"
- Volunteers don't know their impact
- NGOs can't coordinate across multiple volunteers efficiently
- No urgency signaling — a critical need looks the same as a low-priority one
- No location awareness — volunteers 20 km away get pinged when someone 500m away is available
- No completion tracking — no feedback loop

---

## Existing Workflow (Before CivicBridge)

```
Person in need → posts in WhatsApp group
→ someone may or may not see it
→ private DM maybe happens
→ no confirmation of receipt
→ no tracking
→ sometimes duplicate help, sometimes none
```

---

## Proposed Solution

CivicBridge is a **geo-aware, urgency-first community coordination platform** that connects requests directly to the nearest available volunteer or resource, with real-time status tracking and NGO-level coordination tools.

**Core differentiators vs generic platforms:**
1. **Urgency triage system** — requests are color-coded and ranked by urgency + proximity
2. **Smart matching** — backend matches request to nearest volunteer/resource by category and location
3. **NGO coordination layer** — NGOs can bulk-assign, monitor, and report
4. **Impact feed** — public, anonymous feed showing completed helps ("17 food packets delivered today in Pune")
5. **AI categorization** (P1) — Gemini auto-tags and prioritizes incoming requests

---

## Unique Value Proposition

> CivicBridge is not a directory. It is a **live coordination layer** for community help — with urgency, proximity, and accountability built in.

---

## Core User Journeys

### Journey 1 — Requester creates a request
1. Sign up / log in
2. Click "I Need Help"
3. Select category (Food, Medicine, Shelter, Clothes, Tutoring, Transport, Other)
4. Describe need, set quantity, set urgency (LOW / MEDIUM / HIGH / CRITICAL)
5. Location auto-detected or entered manually
6. Request submitted → status: OPEN
7. Matched volunteer/resource notified
8. Requester sees status: ACCEPTED → IN PROGRESS → COMPLETED

### Journey 2 — Volunteer accepts a request
1. Log in as Volunteer
2. See nearby open requests on dashboard (sorted by urgency + distance)
3. Click request → view details
4. Accept → status changes to ACCEPTED
5. Mark as In Progress, then Completed
6. Impact score updated

### Journey 3 — NGO manages a drive
1. Log in as NGO Admin
2. View all open requests in their region
3. Assign volunteers to requests
4. Monitor live status board
5. See completion rate

---

## Functional Requirements

### P0 — MUST HAVE
- [ ] Auth: Sign up, Login, Logout (Supabase Auth)
- [ ] Roles: Requester, Volunteer, NGO Admin
- [ ] Create request with: category, description, quantity, urgency, location
- [ ] View open requests (sorted urgency + proximity)
- [ ] Accept a request (volunteer/NGO)
- [ ] Update request status (OPEN → ACCEPTED → IN PROGRESS → COMPLETED)
- [ ] Basic dashboard per role
- [ ] Resource listing: volunteer can list available resources
- [ ] Basic location input (lat/lng or city area text)

### P1 — SHOULD HAVE
- [ ] AI categorization via Gemini (auto-tag category from description)
- [ ] Map view of nearby requests (Google Maps or Leaflet)
- [ ] Search + filter requests (category, urgency, status)
- [ ] NGO profile page with stats
- [ ] Impact feed (public anonymous completed requests ticker)
- [ ] Email/in-app notification on match

### P2 — ONLY IF TIME REMAINS
- [ ] In-app chat between requester and volunteer
- [ ] Volunteer reputation/rating
- [ ] Advanced analytics charts
- [ ] Real-time updates via polling or SSE
- [ ] Export impact report

---

## Non-Functional Requirements

- Page load < 2s on 4G
- API response < 500ms for standard queries
- Mobile-first responsive design
- Works without Gemini (fallback: manual category)
- Works without Maps (fallback: text-based location)
- Secure: RLS enforced on all tables
- Zero exposed secret keys on frontend

---

## Success Metrics (Demo Day)

- End-to-end request → completion flow works live
- At least 3 roles demonstrated
- At least 10 realistic seed data entries visible
- Dashboard shows real numbers
- Map shows pinned requests (if P1 achieved)
- AI categorization fires (if P1 achieved)

---

## Expected Impact

If deployed in a real city:
- 40–60% reduction in unresolved community requests
- NGOs save 5–8 hours/week on coordination
- Volunteers gain visibility into local needs within 2 km
- Community gets a feedback loop (completions are public)

---

## Differentiation from Generic Platforms

| Feature | Generic NGO App | CivicBridge |
|---|---|---|
| Urgency triage | ❌ | ✅ CRITICAL / HIGH / MEDIUM / LOW |
| Proximity-aware matching | ❌ | ✅ Geo-sorted volunteer queue |
| Status lifecycle | Basic | ✅ OPEN→ACCEPTED→IN PROGRESS→COMPLETED |
| NGO coordination layer | ❌ | ✅ Assign, monitor, report |
| Impact feed | ❌ | ✅ Public anonymous ticker |
| AI categorization | ❌ | ✅ Gemini (P1) |

---

## Future Scope (Post-Hackathon)

- WhatsApp bot integration (request via WhatsApp message)
- Multi-city/district support
- Verified NGO badges
- Government integration (municipality drives)
- SMS-based requests for non-smartphone users
- Offline-capable PWA
