# 14 — NexoraLink UI/UX Enhancement: "Coordination Ops" Design System
**Applies to:** `05_FRONTEND_PLAN.md` and `MEMBER_4_FRONTEND.md` — this is an addendum, not a replacement. Keep the page list, component list, and API hooks from those docs. This file only upgrades the *visual and interaction language* so the product doesn't read as a generic dark SaaS dashboard.

---

## Why this matters for judging

Innovation and Technical Complexity are visible in code judges may never fully see in a 5-minute demo. **Presentation is the one criterion that is 100% visible, 100% of the time.** A dark-theme dashboard with `slate-800` cards and default Tailwind spacing is what every third team in the room will also ship — it doesn't read as "AI-powered coordination platform," it reads as "we followed a Tailwind tutorial." The fix isn't more color, it's a **consistent motif** that a judge can name after seeing one screen.

---

## Design Direction: Mission-Control, not Community-App

NexoraLink isn't a cozy neighborhood app — per `01_PROJECT_OVERVIEW.md` it's positioned as AI-driven coordination with live tracking, urgency triage, and gap detection. Lean into that: the UI should feel like a **dispatch / situation-room console**, not a to-do list. This also happens to be cheap to build in 6 hours because it's mostly typography, borders, and small SVG details — not new components.

Keep the existing palette from `05_FRONTEND_PLAN.md` as the base (it's already good: slate-900 surface, blue-600 primary, violet-600 for AI, red/amber/emerald for urgency). Add the following on top of it.

---

## 1. Typography — swap one font, not all three

- **Headings / section labels / nav:** `Space Grotesk` (700/800) — geometric, technical, not another rounded UI-default font like Poppins/Inter-everywhere.
- **Body / forms / descriptions:** keep `Inter` 400/500 — it's fine, don't overdesign body text.
- **Scores, distances, IDs, timestamps, coordinates:** keep `JetBrains Mono` — already specified, correct choice, expand its usage: every *number* in the UI (match %, km, counts, trust score) should render in mono. This single rule does more to sell "data-driven platform" than any color choice.

```css
--font-display: 'Space Grotesk', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

---

## 2. The "one glow" rule

Right now the plan has urgency badges, score rings, status badges, and map pulses all competing for attention with translucent colored backgrounds. Constrain it:

- **Only the single highest-priority element on a screen may glow** (box-shadow bloom / pulse animation). On the volunteer dashboard, that's the top-ranked match card. On the admin map, that's a CRITICAL marker. On a request detail page, that's the current active status step.
- Everything else uses **flat, bordered, no-glow** treatment — `border border-slate-700`, no `shadow-lg`, no colored blur.
- This is the same discipline used in real ops dashboards (Datadog, PagerDuty, air-traffic displays): color draws the eye *because* it's rare.

```css
.glow-critical {
  box-shadow: 0 0 0 1px rgba(239,68,68,0.4), 0 0 24px 4px rgba(239,68,68,0.25);
}
/* Use on exactly one element at a time per screen. */
```

---

## 3. Clipped-corner motif (replace `rounded-xl` on key surfaces)

Rounded corners everywhere is the single fastest way to look like a generic dashboard template. For **status/data-bearing surfaces only** (Badge, ScoreRing container, map legend, StatusTimeline node, GapAlertBanner), use a clipped top-right corner instead of full border-radius — it reads as "instrument panel," costs one CSS property, and is a strong repeatable brand mark.

```css
.hud-panel {
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  border: 1px solid var(--border-color, #334155);
  background: #1E293B;
}
```

Keep regular `rounded-lg` on ordinary content cards, inputs, and modals — **do not clip everything**, or the motif stops meaning anything. Clip-path is reserved for things that represent live/tracked state.

---

## 4. Corner-bracket accents for the map and score elements

Borrow the "targeting reticle" language that fits a coordination/dispatch product:

- **Map markers (volunteer/NGO available):** small L-shaped bracket corners around the marker on hover/selection, not a full ring.
- **ScoreRing:** the SVG circle already planned is good — add four short tick marks at 0/90/180/270° around it (like a dial), and render the number itself in `--font-mono` at the center, large, with the label ("MATCH") small and uppercase-tracked above it.
- **StatusTimeline:** render as a horizontal bracket-connected sequence (`[ REQUESTED ]──[ ANALYZED ]──[ MATCHING ]...`) rather than plain dots-and-lines — connects visually to the bracket motif used elsewhere.

This is a *motif*, not new components — apply it as an SVG/CSS treatment to the components already scoped in `05_FRONTEND_PLAN.md` (`ScoreRing.tsx`, `StatusTimeline.tsx`, `NexoraMap.tsx` marker rendering).

---

## 5. Two modes: Ops Mode vs Calm Mode

Don't apply the HUD treatment everywhere — dense glow/clip/mono on a long text form (the request description textarea, the feedback modal) makes it *harder* to read, not more impressive.

| Screen type | Mode | Treatment |
|---|---|---|
| Admin dashboard, Volunteer dashboard, Map views | **Ops Mode** | Clipped panels, mono numerals, glow-on-priority, dense grid layout |
| New Request form, Register/Login, Feedback modal, About/empty states | **Calm Mode** | Normal `rounded-lg`, Inter throughout, generous whitespace, no glow, no clip-path |

Toggle this at the layout/page level, not per-component — `AppShell.tsx` can pass a `mode` context so `Card`/`Badge` render their Ops variant only inside Ops screens.

---

## 6. Background texture (cheap, high-impact)

Add a near-invisible 1px grid or scanline texture to `slate-900` surfaces in Ops Mode only — this is a single CSS `background-image` with `linear-gradient`, zero extra components, and instantly reads as "console" instead of "flat dark theme":

```css
.ops-bg {
  background-color: #0F172A;
  background-image:
    linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

---

## 7. Motion — restrained, purposeful, not decorative

- Status transitions: when a request status changes, the StatusTimeline's active segment should animate a fill/sweep (200–300ms), not fade.
- ScoreRing: animate the arc filling from 0 to the match % on mount — this is the one moment worth spending animation budget on, since judges will watch it during the live demo.
- CRITICAL urgency markers: slow pulse (2s ease-in-out), never fast/strobing — fast pulsing reads as broken, not urgent.
- Everything else: no animation. Resist adding hover-lift/scale to every card — it's noise.

---

## 8. What to explicitly avoid

- Default shadcn/ui look left untouched (rounded-md everywhere, default gray borders) — if you pull in shadcn components per the artifact library note, restyle border-radius and borders to match the tokens above before demo.
- Emoji as icons — use `lucide-react` only (already in the plan), sized consistently (16/20px).
- Stock illustrations on empty states — use a simple line-art SVG (a radar sweep, a dashed route line) instead; two or three reusable SVGs cover every empty state.
- Colored drop-shadows on more than one element per screen (see Rule 2).
- Full `rounded-full` badges with default Tailwind spacing — that's the exact look every other team's Badge component will have. The clipped-corner version above is a 10-minute swap that differentiates you for the whole demo.

---

## 9. Handoff checklist for whoever owns frontend

- [ ] Add `Space Grotesk` + `JetBrains Mono` + `Inter` via Google Fonts in `layout.tsx` (Space Grotesk replaces nothing existing — it's additive to the font stack already planned)
- [ ] Define `--font-display` / `--font-mono` CSS vars once in `globals.css`
- [ ] Build `hud-panel` and `ops-bg` utility classes once, reuse everywhere
- [ ] Implement the one-glow-point rule as a *component prop* (`priority?: boolean`) on `Badge`/`Card` so it's enforced structurally, not by discipline alone
- [ ] Apply clip-path only to: `Badge`, `ScoreRing` wrapper, `StatusTimeline` node, `GapAlertBanner`, map legend
- [ ] Everything else (`Input`, `Modal`, `Button`, forms) stays Calm Mode, untouched from the original plan

This is roughly 1–1.5 hours of extra frontend work on top of the existing Hour 0–1 design-system step in `12_6_HOUR_EXECUTION_PLAN.md` — worth front-loading in Hour 0–1 since every other component inherits it for free afterward.
