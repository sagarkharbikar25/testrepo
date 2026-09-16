# UI-UX.md — Design System & Screen Specifications

## Design Philosophy

CivicBridge is not a dashboard. It is a **dispatch board** — the feeling of a live coordination center, not a SaaS product. Think crisis hotline ops board meets neighborhood noticeboard. Everything should communicate:

- **Urgency** (color-coded, not hidden)
- **Proximity** (distance is always visible)
- **Movement** (requests move through states, visually)
- **Community** (human, warm, not corporate)

---

## Visual Identity

### Color System

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0F1117` | App background (near-black, not pure black) |
| `--bg-surface` | `#181C27` | Cards, panels |
| `--bg-raised` | `#1E2333` | Hover states, elevated elements |
| `--accent-primary` | `#38BDF8` | Sky blue — primary actions, links |
| `--accent-secondary` | `#818CF8` | Indigo — volunteer/NGO UI |
| `--urgency-critical` | `#EF4444` | CRITICAL requests |
| `--urgency-high` | `#F97316` | HIGH requests |
| `--urgency-medium` | `#EAB308` | MEDIUM requests |
| `--urgency-low` | `#22C55E` | LOW requests / completed |
| `--text-primary` | `#F1F5F9` | Main text |
| `--text-secondary` | `#94A3B8` | Labels, metadata |
| `--text-muted` | `#475569` | Disabled, placeholders |
| `--border` | `#2D3748` | Subtle borders |

**Design rationale:** Dark base + sky blue accent avoids the warm-cream/terracotta default. The urgency color system is the dominant visual storytelling device — judges should see RED immediately when there's a CRITICAL need.

### Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Headline | `Space Grotesk` | 700 | 2rem–3rem |
| Body / UI | `Inter` | 400–500 | 0.875rem–1rem |
| Data / Labels | `JetBrains Mono` | 400 | 0.75rem |
| Status badges | `Inter` | 600 | 0.7rem uppercase |

Load via Google Fonts. Two fonts maximum.

### Spacing Scale
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```
Tailwind defaults map cleanly to this. Use `gap-4`, `p-6`, `mt-8` consistently.

### Border Radius
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Badges: `rounded-full`
- Inputs: `rounded-lg`

### Shadow
Only one shadow level: `shadow-[0_0_0_1px_rgba(255,255,255,0.05)]` — subtle inner border, no blurry drop shadows.

---

## Information Architecture

```
/ (Landing / Impact Feed — public)
│
├── /auth/login
├── /auth/register
│
├── /dashboard             → role-aware redirect
│   ├── /dashboard/requester
│   ├── /dashboard/volunteer
│   └── /dashboard/ngo
│
├── /requests
│   ├── /requests/new      → create request
│   ├── /requests/[id]     → view request detail
│   └── /requests/my       → my submitted requests
│
├── /resources
│   ├── /resources/new
│   └── /resources/[id]
│
└── /profile
```

---

## Screen List & Specifications

---

### SCREEN 1 — Landing / Impact Feed
**Owner:** Member 1
**Purpose:** Show CivicBridge is alive and working. Public page.

**Components:**
- Hero: large headline + tagline
- Live "impact ticker": scrolling list of recently completed requests (anonymous)
- 3 role CTAs: "I Need Help" / "I Want to Help" / "I'm an NGO"
- Stats bar: "142 requests fulfilled · 38 volunteers active · 12 NGOs"

**Data shown:** Aggregated completions, active volunteer count, open request count
**Primary CTA:** "Get Started" → /auth/register
**Secondary CTA:** "View Open Requests" → /requests

**Layout:**
```
[HERO — full width dark]
  "Your neighborhood, coordinated."
  [3 CTA cards side by side]

[IMPACT TICKER — horizontal scroll strip, green text on dark]
  "Food packets delivered · Nagpur · 4 mins ago"

[STATS BAR]
  142 fulfilled   38 volunteers   12 NGOs
```

---

### SCREEN 2 — Register / Login
**Owner:** Member 1
**Purpose:** Auth flow. Role selection on register.

**Components:**
- Email + password inputs
- Role selector: 3 visual cards (Requester / Volunteer / NGO)
- Submit button
- "Already have account?" link

**States:**
- Default, Loading (spinner on button), Error (red border + message), Success (redirect)

**Layout:** Centered card on dark background. No sidebar.

---

### SCREEN 3 — Create Request
**Owner:** Member 1
**Purpose:** Core requester action.

**Components:**
- Category selector (visual icon grid: Food, Medicine, Shelter, Clothes, Tutoring, Transport, Other)
- Title input
- Description textarea (AI categorize button next to it — P1)
- Quantity input + unit dropdown
- Urgency selector (4 large colored buttons: LOW / MEDIUM / HIGH / CRITICAL)
- Location input (text or "Use my location" button)
- Submit

**Urgency selector visual:**
```
[  LOW  ]  [ MEDIUM ]  [  HIGH  ]  [CRITICAL]
 #22C55E    #EAB308     #F97316     #EF4444
```
Selected state: full background fill, white text, scale-105

**States:** Loading, Validation error (inline), Success → redirect to /requests/[id]

---

### SCREEN 4 — My Requests (Requester)
**Owner:** Member 1
**Purpose:** Track all submitted requests.

**Components:**
- Filter tabs: ALL / OPEN / IN PROGRESS / COMPLETED
- RequestCard list (see component spec)
- Empty state: "No requests yet. Start by asking for help."

**RequestCard:**
```
┌─────────────────────────────────────────┐
│ 🔴 CRITICAL    Food & Groceries    2 km │
│ "Need 5 food packets for 3 days"        │
│ Submitted 12 mins ago                   │
│ Status: [OPEN]          [View Details →]│
└─────────────────────────────────────────┘
```
Left border color = urgency color.

---

### SCREEN 5 — Request Detail
**Owner:** Member 1
**Purpose:** Full view of a single request, status timeline.

**Components:**
- Header: Category icon + Title + Urgency badge
- Status timeline (vertical stepper): OPEN → ACCEPTED → IN PROGRESS → COMPLETED
- Description, quantity, location
- Assigned volunteer name (if accepted)
- Action buttons: vary by role

**Status Timeline:**
```
● OPEN (12:04 PM)
● ACCEPTED (12:09 PM)  ← current
○ IN PROGRESS
○ COMPLETED
```
Completed steps = accent color. Future steps = muted.

---

### SCREEN 6 — Volunteer Request Feed
**Owner:** Member 2
**Purpose:** Main volunteer view. See and accept open requests.

**Components:**
- Header: "Requests Near You" + distance filter
- Sort: Urgency (default) / Distance / Time
- RequestCard list with Accept button
- Urgency filter pills: ALL / CRITICAL / HIGH / MEDIUM / LOW
- Empty state: "No open requests in your area right now."

**Layout:**
```
[HEADER + FILTER PILLS]
[SORT OPTIONS]
──────────────────────────────
[🔴 CRITICAL] Food  0.4 km  [ACCEPT]
[🟠 HIGH    ] Medicine 1.1km [ACCEPT]
[🟡 MEDIUM  ] Tutoring 2.3km [ACCEPT]
```

---

### SCREEN 7 — Volunteer Dashboard
**Owner:** Member 2
**Purpose:** Volunteer's home — active assignments + impact stats.

**Components:**
- Stats row: Requests Accepted / Completed / Streak
- Active assignments section (in-progress requests)
- Quick action: "Find Requests Near Me"
- Impact visualization: simple bar or number display

**Layout:**
```
┌──────────┬──────────┬──────────┐
│ Accepted │Completed │  Streak  │
│    12    │    9     │  3 days  │
└──────────┴──────────┴──────────┘

[ACTIVE ASSIGNMENTS]
  Food request · Ritu S. · IN PROGRESS  [Mark Done]

[FIND MORE REQUESTS →]
```

---

### SCREEN 8 — NGO Dashboard
**Owner:** Member 2
**Purpose:** NGO admin view — all requests, volunteer assignment, analytics.

**Components:**
- Overview stats: Open / Accepted / Completed / Volunteers Active
- Request board (filterable table-like list)
- Assign volunteer modal
- Category breakdown (simple horizontal bar chart)
- Export button (P2)

**Layout:**
```
[STATS ROW]
Open: 14  Accepted: 6  Completed: 28  Volunteers: 11

[REQUEST BOARD]
Category | Title        | Urgency | Status    | Assigned To  | Action
Food     | Food packets | HIGH    | OPEN      | —            | [Assign]
Medicine | Insulin      | CRITICAL| ACCEPTED  | Aryan K.     | [View]
```

---

### SCREEN 9 — Resource Listing (P1)
**Owner:** Member 2
**Purpose:** Volunteer/provider lists available physical resources.

**Components:**
- Resource form: name, category, quantity, location, description
- My resources list

---

### SCREEN 10 — Profile
**Owner:** Member 1 (basic) / Member 2 (volunteer stats section)
**Purpose:** View and edit profile.

**Components:**
- Avatar (initials-based, no upload needed for P0)
- Name, email, role badge
- Location
- Edit profile button

---

## Component System

### RequestCard
```tsx
interface RequestCardProps {
  id: string
  title: string
  category: Category
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: Status
  distance?: string
  createdAt: string
  onAccept?: () => void
  onView: () => void
}
```
Left border: urgency color. Dark background surface.

### UrgencyBadge
```tsx
// Usage: <UrgencyBadge level="CRITICAL" />
// Renders colored pill with appropriate text
```

### StatusStepper
Vertical timeline showing request lifecycle.

### CategoryIcon
Icon grid for category selection. Each category has a Lucide icon.

| Category | Icon |
|---|---|
| Food | `UtensilsCrossed` |
| Medicine | `Pill` |
| Shelter | `Home` |
| Clothes | `Shirt` |
| Tutoring | `GraduationCap` |
| Transport | `Car` |
| Other | `MoreHorizontal` |

### LoadingState
Full-screen: pulsing CivicBridge logo text
Inline: skeleton shimmer cards

### EmptyState
```
[Icon]
"Nothing here yet."
[Primary action button]
```

### ErrorState
```
[AlertTriangle icon — red]
"Something went wrong."
[Retry button]
```

---

## Responsive Design

| Breakpoint | Layout |
|---|---|
| Mobile (< 640px) | Single column, bottom nav |
| Tablet (640–1024px) | Two column where applicable |
| Desktop (> 1024px) | Sidebar navigation visible |

Navigation:
- Desktop: left sidebar (collapsed, icon-only with labels on hover)
- Mobile: bottom tab bar (max 4 items)

---

## Micro-interactions

- **Accept button:** Loading spinner → checkmark animation on success
- **Urgency selector:** Scale up + border glow on selection
- **Status badge:** Subtle pulse on CRITICAL
- **RequestCard:** Slight lift on hover (`translate-y-[-2px] transition-transform`)
- **Impact ticker:** CSS marquee scroll, pauses on hover
- **Form submit:** Button disabled + spinner during API call

---

## Accessibility Basics

- All interactive elements have `focus-visible` ring
- Color never the sole urgency indicator (text label always present)
- Min touch target 44×44px on mobile
- `aria-label` on icon-only buttons
- `role="status"` on loading indicators
- Sufficient contrast: all text >4.5:1 on dark backgrounds
