# 15 — NexoraLink Presentation Plan

## Judging Criteria (from team notes) → What Must Be Visible On-Slide

| Criteria | What judges are scoring | Where it must show up |
|---|---|---|
| Innovation | Is this more than a CRUD form wrapped in a chatbot? | AI-analysis pipeline, deterministic explainable matching, gap detection |
| Technical Complexity | Real architecture, not a toy | PostGIS geospatial queries, RLS, matching algorithm math, status-machine |
| Impact | Does this solve a real Cooperation-track problem | Concrete before/after scenario, resource-gap story |
| Presentation | Clarity, confidence, live proof | Live demo > screenshots; tight timing; no dead air |

Assumption: a **5-minute pitch slot** (typical for a 6-hour hackathon), split as **~3 min slides + ~2 min live demo**, then Q&A. Adjust timings below if your actual slot differs.

---

## Deck Structure (8 slides, ~20 seconds each for the slide portion)

### Slide 1 — Title
- Project name **NexoraLink**, one-line tagline: *"From a text message to a coordinated volunteer, in minutes."*
- Team name (Nexora), track (Cooperation), team code
- Visual: use the Ops-Mode dark theme from `14_UI_UX_ENHANCEMENT.md` as the deck background — the deck should look like a screenshot of the product, not a mismatched template

### Slide 2 — The Problem (Impact)
- One sentence, one real scenario: *"An elderly resident needs a medicine pickup. There's no single place to ask, no way to know who's nearby and able to help, and no visibility into whether help ever arrived."*
- Keep it to 1 scenario, not a bullet list of problems — judges remember stories, not lists

### Slide 3 — The Solution (Innovation, 20 sec)
- The 3-step value prop straight from `01_PROJECT_OVERVIEW.md`: **Understand → Match → Track**
- One diagram: free-text request → AI classification → ranked matches → live status
- Say explicitly: *"Not a form with dropdowns — the requester just types what's wrong."*

### Slide 4 — How Matching Actually Works (Technical Complexity)
- Show the scoring formula on-screen (from `02_ARCHITECTURE.md`):
  `score = distance(30%) + skill(30%) + availability(20%) + urgency(10%) + trust(10%)`
- Say why it's **deterministic, not a black-box ML call** — judges with technical backgrounds respect explainability, and it's honest about scope for a 6-hour build
- Mention PostGIS `ST_DWithin` for geospatial filtering — one sentence, don't over-explain

### Slide 5 — Beyond the Happy Path (Innovation + Technical Complexity)
- Resource gap detection: *"The system doesn't just match — it tells NGOs and admins where supply can't meet demand, by category, in real time."*
- One before/after number if you can fake realistic seed data: e.g. *"23 active medical requests, 5 available medical volunteers → flagged HIGH gap automatically."*
- This is the single most differentiating feature in your doc set — don't bury it, it's what separates you from "another request-board app"

### Slide 6 — Live Demo (Presentation — this is the real slide)
- Transition line: *"Let's just show you."* Then switch to the actual deployed app.
- **Do not screenshot the demo into the deck.** A live demo (or, as fallback, a screen-recorded video embedded and played, not narrated over static images) scores dramatically higher on Presentation than static slides.
- See Demo Script below for exactly what to click.

### Slide 7 — Architecture Snapshot (Technical Complexity, 15 sec)
- One clean diagram: Next.js (frontend + API routes) → Supabase (Postgres + PostGIS + Auth) → Gemini API
- Say the monolith-first decision was intentional for a 6-hour scope, not a limitation — judges penalize over-engineering claims that don't match a 6-hour build far more than they penalize an honest "monolith by design" statement

### Slide 8 — What's Next / Close (Impact)
- 2–3 P1/P2 items from `01_PROJECT_OVERVIEW.md` framed as roadmap, not excuses: real-time push instead of polling, volunteer trust/reputation over time, NGO resource-request workflow
- Close on the team + a repeat of the tagline
- Thank you + team names

---

## Live Demo Script (maps to Demo Scenario A in `01_PROJECT_OVERVIEW.md` / `11_TEST_PLAN.md`)

Rehearse this exact sequence at Hour 5:30 — do not improvise during judging.

1. **[Citizen tab, pre-logged-in]** Type the request live, on stage, in front of judges: *"My elderly neighbor needs medicine but nobody can pick it up."* — typing it live (not pasting) proves it's really free-text AI, not a canned demo.
2. Submit → AI analysis panel appears → **pause 1 second, point at the urgency badge** ("HIGH") and category chip ("medical") — this is the moment that sells Innovation.
3. Click "Find Help" → match results appear → **point at the score ring and say the number out loud** ("94% match, 1.2km, trust score 4.8") — this sells Technical Complexity in one sentence.
4. **[Switch to pre-logged-in volunteer tab]** — show the request already visible in Nearby Requests with the same score. Click Accept.
5. **[Switch back to citizen tab, refresh]** — status timeline shows ACCEPTED. Don't wait for IN_PROGRESS/COMPLETED live (too slow for 2 minutes) — say *"and it walks through in-progress to completed the same way"* while switching to:
6. **[Admin tab]** — dashboard stat grid + map, point at the resource-gap banner if seeded. This is your **last visual** before cutting back to slides — end the demo on the most impressive screen, not the login page.

**Total demo time budget: ~90–110 seconds.** Practice with a timer; cut step 5's live wait, it's the easiest place to run over.

---

## Fallback Plan (Presentation risk mitigation)

- Record a 90-second screen capture of the exact script above by Hour 5:00, even if you intend to demo live — Wi-Fi/deploy failures during judging are common and unrecoverable if you have no backup.
- Keep the recording as an embedded video in the deck (auto-muted, click-to-play), not a link to open separately — switching windows/apps live is where demos visibly fall apart.
- If Vercel deploy is flaky, demo from `localhost` on the same machine as the deck — judges care that it works, not where it's hosted.

---

## Speaker Assignment

| Slot | Speaker | Why |
|---|---|---|
| Slides 1–3 (problem/solution) | Team lead | Framing and narrative — should be whoever is most comfortable presenting under time pressure |
| Slides 4–5 (technical) | Whoever owns matching/AI or database | Can answer follow-up technical questions credibly in real time |
| Live demo (slide 6) | Frontend owner, driving; lead narrating | The person who built the UI clicks fastest and recovers from UI glitches without visible panic |
| Slides 7–8 + Q&A | Whole team present, lead fields first question, defers technical questions to the relevant member | Judges notice when only one person can answer questions |

---

## Anticipated Judge Questions (prep answers now, don't improvise)

- **"Is the AI matching actually doing anything, or is it random?"** → Point to the deterministic weighted formula on slide 4; offer to show the `matches` table with stored score breakdowns.
- **"What happens if Gemini is down or slow?"** → Fallback response documented in `02_ARCHITECTURE.md`/`04_API_CONTRACT.md`: defaults to `general`/`MEDIUM` with `confidence: 0`, manual override shown to the user. Say this proactively if there's room — it shows you thought about failure modes, which is rare in 6-hour demos.
- **"How does this scale past a demo?"** → Honest answer: PostGIS indexes handle the geospatial query at scale; the real bottleneck would be polling-based "real-time" updates, which is exactly why it's listed as the first roadmap item on slide 8.
- **"Why no real-time / WebSockets?"** → Deliberate scope decision for a 6-hour build (documented in `02_ARCHITECTURE.md`'s key decisions table) — polling was chosen for reliability over impressiveness. Own this, don't apologize for it.

---

## Deck Production Note

Build the deck itself in the same Ops-Mode visual language as `14_UI_UX_ENHANCEMENT.md` (dark background, Space Grotesk headers, mono numerals for any stat you show) — a pitch deck that visually matches the live product reads as one coherent piece of work, not "we built an app and then someone made unrelated slides at the end."
