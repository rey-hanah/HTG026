# ParkSense — Design System & UX Guide
> Written from the perspective of a designer who has shipped at Notion, Anthropic, and Linear.
> Rule 1: Every decision has a reason. Rule 2: When in doubt, add whitespace.

---

## Tool Decision: Lovable vs Framer vs V0

**TL;DR for your situation:**

| Tool | What it's for | Your verdict |
|------|--------------|-------------|
| **Lovable Pro** | Full-stack app builder — generates working React + Next.js + Shadcn + Tailwind code | ✅ Use for initial scaffold |
| **V0 (Vercel)** | Generate specific UI components (search bar, result cards) from prompts | ✅ Use for components |
| **Framer** | Marketing/landing pages, no-code animations | ❌ Wrong tool — this is an app, not a landing page |
| **Claude Code / Cursor** | Polish, API integration, Gemini logic | ✅ Primary coding environment |

**Recommended workflow:**
1. Use **Lovable Pro** to generate the initial Next.js scaffold with the map layout, search bar, and result panel (one prompt gets you 70% of the shell)
2. Use **V0** to generate specific components you want to drop in (AI recommendation card, warning banner, parking type badge)
3. Bring everything into **Claude Code / Cursor** for API integration, Gemini logic, and polish
4. Deploy on **Vercel** with a single `git push`

This is faster than starting from scratch AND gives you full code ownership. You own every file.

---

## Design Philosophy

### The three words
**Precise. Calm. Trustworthy.**

A parking app is used in a moment of mild stress — you're driving, you're almost there, you need to decide fast. The design should lower that stress, not add to it. No flashy animations on critical info. No visual noise. Clean information hierarchy. One clear answer at a time.

### What Notion does that we borrow
- Information is scannable, not decorative
- Hierarchy is clear at a glance (size + weight, not color)
- Whitespace is generous — breathing room = trust

### What Anthropic does that we borrow
- Restrained color palette with one strong accent
- Typography does most of the work
- Subtle interactions, never loud ones

### What we do differently
- Dark map (CartoDB dark tiles) creates atmosphere while the UI panel stays light
- Colored marker system encodes meaning at a glance without a legend
- The AI card is the one moment of visual distinction — everything else steps back

---

## Color Palette

### Base
```
Background:      #0F172A   (map / dark base)
Surface:         #1E293B   (panel background, dark cards)
Surface Light:   #FFFFFF   (light mode cards, inputs)
Border:          #334155   (subtle dividers)
```

### Text
```
Primary:         #F8FAFC   (headings on dark)
Secondary:       #94A3B8   (supporting text on dark)
On Light:        #0F172A   (text on white cards)
Muted:           #64748B   (labels, hints)
```

### Brand Accent (one color, used sparingly)
```
Purple 500:      #7C3AED   (AI recommendation, primary CTA)
Purple 400:      #8B5CF6   (hover state)
Purple 100:      #EDE9FE   (AI card background on light panel)
```

### Semantic — Parking Type System
```
EV Blue:         #3B82F6   (EV charger markers)
Free Green:      #22C55E   (free street parking markers)
Paid Amber:      #F59E0B   (paid lot/meter markers)
AI Purple:       #7C3AED   (Gemini best pick marker — with pulse)
Unknown Gray:    #6B7280   (unverified/unknown markers)
```

### Status
```
Warning:         #FEF3C7 bg / #92400E text   (time restriction alert)
Danger:          #FEE2E2 bg / #991B1B text   (rush hour warning)
Success:         #D1FAE5 bg / #065F46 text   (free parking confirmed)
Info:            #DBEAFE bg / #1E40AF text   (general info banner)
```

### Rules
1. Never introduce colors outside this palette
2. Purple is reserved for AI/Gemini moments only — do not use it for navigation or decoration
3. Marker colors must match consistently everywhere: on map, in list, in filters
4. Warning banners always use the semantic system — never custom colors

---

## Typography

### Font Pairing
```
Display / Headings:   "Geist" (from Vercel — modern, technical, clean)
Body / UI:            "Inter" (system default, universally readable)
Code / IDs:           "Geist Mono" (for meter IDs, coordinates, codes)
```

**Why Geist:** It's the font Vercel uses for their products. It reads as "made by engineers who care about design" — exactly the right signal for a hackathon tech app. Available free at https://vercel.com/font

**Install:**
```bash
npm install geist
```
```ts
// app/layout.tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
```

### Scale
```
xs:    12px / 0.75rem   — labels, badges, legal
sm:    14px / 0.875rem  — supporting text, metadata
base:  16px / 1rem      — body text, card content
lg:    20px / 1.25rem   — section headings, card titles
xl:    24px / 1.5rem    — panel headings
2xl:   32px / 2rem      — destination name, main heading
3xl:   40px / 2.5rem    — hero / empty state
```

### Weight
```
Regular:    400   — body text, descriptions
Medium:     500   — UI labels, subheadings
Semibold:   600   — card titles, important info
Bold:       700   — headings only, price display
```

### Tracking (letter-spacing)
```
Headings:   tracking-tight  (-0.025em)
Body:       tracking-normal (0)
Badges:     tracking-wide   (0.05em) — all-caps labels only
```

---

## Spacing Scale (4px base unit)

```
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
20:  80px
24:  96px
```

**Rules:**
- Never use arbitrary values (no `padding: 13px` or `margin: 22px`)
- Spacing between related items: 8–12px
- Spacing between sections: 24–32px
- Padding inside cards: 16–24px
- Padding inside inputs: 12px vertical, 16px horizontal

---

## Border Radius

```
none:   0px      — dividers, separators
sm:     4px      — badges, chips, small tags
md:     8px      — inputs, buttons, small cards
lg:     12px     — cards, modals, result panels
xl:     16px     — floating panels, bottom sheets
full:   9999px   — avatars, toggle pills, status dots
```

**Rules:**
- Input fields: `rounded-md` (8px)
- Parking result cards: `rounded-lg` (12px)
- AI recommendation card: `rounded-xl` (16px) — slightly more prominent
- Map markers: use `rounded-full` for dot markers, `rounded-md` for label chips
- Modals / bottom sheets: `rounded-xl` top corners only

---

## Component Specifications

### Search Bar (The Hero Element)
Inspired by Spotlight / Raycast / Linear's command palette. This is the first thing users see.

```
Width:           100% on mobile, 560px max on desktop
Height:          56px
Background:      white with 8px blur backdrop (glass effect)
Border:          1px solid #E2E8F0, on focus: 1.5px solid #7C3AED
Border radius:   rounded-xl (16px)
Shadow:          0 8px 32px rgba(0,0,0,0.12)
Font:            Geist, 16px, weight 400
Placeholder:     "Where are you going?" — color #94A3B8
Icon:            Search icon left-padded 16px, 20px size, color #6B7280
Clear button:    X icon, appears on input, right-padded 16px
```

**Micro-interaction:** On focus, border transitions to purple with a subtle shadow bloom (200ms ease-out). This tells the user "this is the main action."

```tsx
// From 21st.dev or build manually
<div className="relative w-full max-w-[560px]">
  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
  <input
    className="w-full h-14 pl-12 pr-4 rounded-xl border border-border 
               bg-white/90 backdrop-blur-sm text-base
               focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
               transition-all duration-200"
    placeholder="Where are you going?"
  />
</div>
```

### Parking Result Card
```
Width:           100% of panel
Padding:         16px
Background:      white
Border:          1px solid #E2E8F0
Border radius:   rounded-lg (12px)
Gap between cards: 8px
Hover:           border-color → #CBD5E0, subtle lift shadow

Layout:
  ┌─────────────────────────────────────────────┐
  │  [TYPE BADGE]                [WALK TIME]    │
  │                                             │
  │  Name / Address                             │
  │  [RATE]     [TIME LIMIT]     [STATUS]       │
  │─────────────────────────────────────────────│
  │  [Navigate →]               [Save]          │
  └─────────────────────────────────────────────┘
```

```tsx
<Card className="p-4 hover:border-slate-300 transition-colors cursor-pointer">
  <div className="flex items-start justify-between mb-2">
    <ParkingTypeBadge type={spot.type} />
    <span className="text-sm text-muted-foreground">{spot.walkMinutes} min walk</span>
  </div>
  <p className="font-semibold text-foreground">{spot.name}</p>
  <p className="text-sm text-muted-foreground mb-3">{spot.address}</p>
  <div className="flex gap-2 text-sm">
    <span className="font-bold">{spot.rate === '0.00' ? 'Free' : `$${spot.rate}/hr`}</span>
    {spot.timeLimit && <span className="text-muted-foreground">• {spot.timeLimit}</span>}
  </div>
</Card>
```

### AI Recommendation Card (The Star)
This card is pinned to the top of the results panel. It should feel distinct but not garish.

```
Background:      #EDE9FE (purple-100)
Border:          1.5px solid #7C3AED (purple-500)
Border radius:   rounded-xl (16px)
Left accent:     4px solid #7C3AED border-left (or purple left stripe)
Label:           "✦ AI Pick" — small caps, purple, weight 600
Reason text:     base size, foreground color, regular weight
Warning banners: below reason text, amber background
```

```tsx
<Card className="p-4 bg-purple-50 border-purple-400 border-2 rounded-xl">
  <div className="flex items-center gap-1.5 mb-2">
    <Sparkles className="w-4 h-4 text-purple-600" />
    <span className="text-xs font-semibold text-purple-600 tracking-wide uppercase">AI Pick</span>
  </div>
  <p className="text-base font-semibold text-slate-900 mb-1">{spot.name}</p>
  <p className="text-sm text-slate-600 mb-3">{geminiResult.reason}</p>
  {geminiResult.warnings.map((w, i) => (
    <div key={i} className="text-xs bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-1">
      {w}
    </div>
  ))}
  <Button className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white">
    Navigate here
  </Button>
</Card>
```

### Parking Type Badge
```tsx
const BADGE_CONFIG = {
  ev:      { label: 'EV', bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  free:    { label: 'Free', bg: 'bg-green-100', text: 'text-green-700',  dot: 'bg-green-500'  },
  paid:    { label: 'Paid', bg: 'bg-amber-100', text: 'text-amber-700',  dot: 'bg-amber-500'  },
  unknown: { label: '?',    bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400'   },
};

function ParkingTypeBadge({ type }) {
  const config = BADGE_CONFIG[type] ?? BADGE_CONFIG.unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
```

### Warning Banner
```tsx
function WarningBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm text-amber-800">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
      <span>{message}</span>
    </div>
  );
}
```

### Map Markers — Custom Leaflet Divicons
```ts
function createParkingMarker(type: 'ev' | 'free' | 'paid' | 'ai' | 'unknown') {
  const colors = {
    ev:      '#3B82F6',
    free:    '#22C55E',
    paid:    '#F59E0B',
    ai:      '#7C3AED',
    unknown: '#6B7280',
  };

  const isAI = type === 'ai';
  const color = colors[type];

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${isAI ? 20 : 14}px;
        height: ${isAI ? 20 : 14}px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isAI ? `animation: pulse 1.5s ease-in-out infinite;` : ''}
      "></div>
      ${isAI ? `<style>@keyframes pulse {
        0%,100% { box-shadow: 0 0 0 0 ${color}80; }
        50% { box-shadow: 0 0 0 10px transparent; }
      }</style>` : ''}
    `,
    iconSize: [isAI ? 20 : 14, isAI ? 20 : 14],
    iconAnchor: [isAI ? 10 : 7, isAI ? 10 : 7],
  });
}
```

---

## Layout — Two-Panel Design

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: [Logo]  [Search Bar—————————————————]  [Filters]   │
├─────────────────────┬────────────────────────────────────────┤
│                     │                                        │
│  RESULTS PANEL      │          MAP (full height)             │
│  (380px width)      │                                        │
│                     │   [Dark CartoDB tiles]                 │
│  [AI Card]          │   [Colored dot markers]                │
│  ─────────────      │   [Destination pin]                    │
│  [Card 1]           │   [Pulsing AI marker]                  │
│  [Card 2]           │                                        │
│  [Card 3]           │                                        │
│  [Card 4...]        │                                        │
│                     │                                        │
│  [Heatmap toggle]   │                                        │
└─────────────────────┴────────────────────────────────────────┘
```

**Mobile (< 768px):** Map full screen, bottom sheet slides up with results. Bottom sheet has handle, snaps to 40% / 80% heights.

```tsx
// Bottom sheet trigger on mobile
<div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl
                md:hidden
                transition-transform duration-300">
  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-3" />
  {/* Results content */}
</div>
```

### Responsive Breakpoints
```
Mobile:   < 768px   — bottom sheet, full-screen map
Tablet:   768–1024px — side panel 320px, map takes rest
Desktop:  > 1024px  — side panel 380px, map takes rest
```

---

## Motion & Animation

### Principles
- Animations communicate state, not decoration
- 200ms for micro-interactions (hover, focus)
- 300ms for layout changes (panel open/close)
- 500ms for map fly-to
- Never animate more than 2 things at once

### Key Animations

**Results panel slide-in (Framer Motion):**
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {results.length > 0 && (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Results */}
    </motion.div>
  )}
</AnimatePresence>
```

**Card stagger (each card enters 50ms after the last):**
```tsx
{spots.map((spot, i) => (
  <motion.div
    key={spot.id}
    initial={{ y: 8, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: i * 0.05, duration: 0.2 }}
  >
    <ParkingCard spot={spot} />
  </motion.div>
))}
```

**AI marker pulse:** CSS animation in the Leaflet divIcon (see marker spec above)

**Map fly-to after search:**
```ts
map.flyTo([lat, lng], 15, { duration: 0.8, easeLinearity: 0.5 });
```

**Loading skeleton (while APIs fetch):**
```tsx
import { Skeleton } from '@/components/ui/skeleton';

function ResultsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

---

## Steve Jobs Features — The "One More Thing" List

*Thinking as a busy Vancouver driver who owns a car and uses it daily. Ranked by impact vs build time.*

### Feature 1: Time-to-Leave Alert — "You need to leave by 5:47pm"
**The problem:** You park at 3:30pm at a 2-hour meter. You forget. You get a $75 ticket.  
**The solution:** When you click "Navigate" to a spot, show a banner: *"This is a 2-hour meter. You'll need to leave by 5:30pm."* One calculated line. Zero API calls. Pure date math.  
**Build time:** 20 minutes.  
**Demo moment:** "And one more thing — when you click navigate, ParkSense calculates your meter expiry time and tells you exactly when you need to leave."

### Feature 2: Sunday Free Detector
**The problem:** Nobody knows which meters are free on Sunday.  
**The solution:** If it's Sunday, and the meter rate field is `"0.00"` for Sunday, show a green banner at the top: *"🟢 Good news — most meters in this area are free today (Sunday)."*  
**Build time:** 15 minutes — just check day of week and rate field.  
**Demo moment:** Show it on a Sunday search. If the hackathon is on a weekend, this lights up for real.

### Feature 3: "On My Way" Mode — Park Along the Route
**The problem:** You're driving from UBC to Gastown. You want to park but don't want to circle around after arriving.  
**The solution:** User enters origin + destination. The app finds parking options within 400m of the destination that you can approach from the driving direction. Show them before you arrive.  
**Build time:** 3 hours (needs routing logic).  
**Skip for hackathon? Maybe** — mention it as a roadmap feature in the pitch.

### Feature 4: "Lucky Street" — Lowest Ticket Density Near You
**The problem:** You need free street parking but don't know which blocks are safe.  
**The solution:** Use the Vancouver ticket dataset to surface the block in your search radius with the historically lowest infraction count. Show it with a "low risk" green tag.  
**Build time:** 1 hour — you already have the ticket data.  
**Demo moment:** "And this is what makes us different from Google Maps — we show you the safest free street, backed by 4 years of city data."

### Feature 5: Event Warning System — "Canucks game tonight"
**The problem:** You search for parking near Rogers Arena on a game night without knowing. The area fills up 2 hours before puck drop.  
**The solution:** Pass current location + current time to Gemini. Let Gemini reason: *"⚠️ Rogers Arena is nearby. If there's an event tonight, this area fills up by 5pm. Consider the paid lot on Georgia."*  
**Build time:** 30 minutes — it's just a smarter Gemini prompt. No extra API.  
**Demo moment:** This is the "AI that knows Vancouver" moment.

### Feature 6: Parking Memory — "You parked here before"
**The problem:** You go to the same café every week. You always forget where you parked last time.  
**The solution:** Store the last 5 parking spots to `localStorage`. When the user searches the same destination, show a subtle tag: *"You parked here 2 weeks ago — 3 min walk."*  
**Build time:** 45 minutes — localStorage, no backend.  
**Demo moment:** Shows the app is personal, not generic.

---

## Hackathon Feature Priority Matrix

| Feature | Impact | Build Time | Include? |
|---------|--------|-----------|---------|
| Search → map markers | High | 2 hrs | ✅ Core |
| AI recommendation card | High | 1.5 hrs | ✅ Core |
| Meter rates + time limits | High | 1 hr | ✅ Core |
| Rush-hour warnings | High | 30 min | ✅ Core |
| EV charger layer | Medium | 45 min | ✅ Core |
| Time-to-leave alert | High | 20 min | ✅ Easy win |
| Sunday free detector | Medium | 15 min | ✅ Easy win |
| Heatmap toggle | Medium | 1 hr | ✅ Visual wow |
| Lucky Street feature | Medium | 1 hr | ✅ Differentiator |
| Color-coded markers | High | 30 min | ✅ Core design |
| Parking memory | Low | 45 min | ⚠️ If time permits |
| On My Way mode | High | 3 hrs | ❌ Roadmap only |
| Event warning | Medium | 30 min | ✅ Gemini prompt upgrade |

---

## Component Library Priority Order

Install and use in this order as you build:

```bash
# 1. Base UI
npx shadcn@latest init
npx shadcn@latest add card badge button input skeleton alert

# 2. Map
npm install leaflet react-leaflet leaflet.heat
npm install @types/leaflet

# 3. Animation
npm install framer-motion

# 4. Icons
npm install lucide-react

# 5. Font
npm install geist

# 6. AI
npm install @google/generative-ai

# 7. 21st.dev — command palette search bar (optional but stunning)
npx shadcn@latest add "https://21st.dev/r/serafimcloud/command-menu"
```

---

## Inspiration Reference

When building specific components, reference these:

| Component | Inspiration |
|-----------|-------------|
| Search bar | https://21st.dev/community/components/search — filter for "command" or "search" |
| Result cards | https://ui.shadcn.com/blocks — look at "Dashboard" blocks |
| Map dark tiles | CartoDB Dark Matter: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` |
| Micro-animations | https://animate-ui.com — for button and card hover states |
| AI card design | https://www.anthropic.com — study how they surface AI content with restraint |
| Mobile bottom sheet | https://magicui.design — search "drawer" |
| Loading states | https://ui.shadcn.com/docs/components/skeleton |
| Overall app feel | https://linear.app (not parking-related but the density + calm is the target vibe) |

---

## Fonts to Evaluate (Free)

From your resources — shortlist for this project:

| Font | Why it works here |
|------|------------------|
| **Geist** (recommended) | Vercel's font — technical, modern, clean. Signals engineering quality. |
| **Satoshi** (fontshare.com) | Friendly + professional. Good if you want warmer feeling. |
| **Cabinet Grotesk** (fontshare.com) | Strong display option for the logo/hero. |
| **General Sans** (fontshare.com) | Clean workhorse — very readable for dense card content. |

**Do not use:** Inter alone (too generic for a design award), Space Grotesk (overused in AI apps), Roboto (dated).

---

## Final Design Checklist Before Judging

- [ ] Dark CartoDB map tiles loaded
- [ ] Search bar centered, prominent, with purple focus state
- [ ] All 5 marker types render with correct colors
- [ ] AI marker has visible pulse animation
- [ ] AI card has purple border and is pinned top of panel
- [ ] Warning banners render in amber
- [ ] Sunday free banner appears correctly (if applicable on demo day)
- [ ] Time-to-leave text appears on the navigate CTA
- [ ] Mobile layout uses bottom sheet (test on phone)
- [ ] Skeleton loading shows while APIs fetch
- [ ] Card stagger animation plays on results load
- [ ] Heatmap toggle works and is labeled "Historically busy"
- [ ] Fonts loaded correctly (Geist or chosen font — not fallback)
- [ ] No arbitrary spacing or hardcoded hex colors outside palette
