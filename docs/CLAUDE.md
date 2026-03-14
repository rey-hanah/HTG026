# SpotAI — Claude Code Configuration
> Hackathon project: Smart parking finder with AI recommendations
> Stack: Next.js 15 · TypeScript · Leaflet · Shadcn UI · Gemini Flash · Vercel

---

## Project Context

Building a smart parking finder web app for Hack the Galaxy (SFU WiCS).
Solo developer. Time constraint: ~10 hours total.
Priority is: working demo > perfect code.

The app searches for parking near a user's destination in Vancouver using
multiple free APIs, then uses Gemini to rank and recommend the best option.

---

## Rules — Read These First

- We are solo and time-constrained. Write complete, working code on the first try.
- Do NOT create extra files unless explicitly asked. Keep it lean.
- Do NOT add a backend. Everything runs client-side in the browser.
- Do NOT use localStorage — use React state only.
- Always use TypeScript. No any types unless absolutely unavoidable.
- Tailwind only for styling. No custom CSS files unless for Leaflet specifics.
- Components go in components/, API helpers go in lib/.
- Keep components under 150 lines. Split if needed.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI + Aceternity UI (copy-paste) |
| Animation | Framer Motion |
| Map | Leaflet + react-leaflet |
| Map Tiles | Stadia Maps dark tiles (no API key needed) |
| Icons | Lucide React |
| AI | Google Gemini Flash (@google/generative-ai) |
| Deploy | Vercel |

---

## Environment Variables

```
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

Only one env var. All other APIs are public with no auth.

---

## APIs In Use

| API | Base URL | Auth |
|---|---|---|
| Nominatim (geocoding) | https://nominatim.openstreetmap.org/search | None |
| Overpass (OSM parking) | https://overpass-api.de/api/interpreter | None |
| Vancouver Open Data | https://opendata.vancouver.ca/api/explore/v2.1/... | None |
| Open Charge Map (EV) | https://api.openchargemap.io/v3/poi/ | None |
| OSRM (walk time) | https://router.project-osrm.org/route/v1/foot/ | None |
| Gemini Flash | via @google/generative-ai SDK | GEMINI_API_KEY |

---

## Core Type

```ts
// types/parking.ts
export interface ParkingSpot {
  id: string;
  name: string;
  type: "free" | "paid" | "ev" | "unknown";
  lat: number;
  lng: number;
  walkTime?: string;
  walkDistance?: number;
  rate?: string;
  timeLimit?: string;
  chargers?: number;
  source: "overpass" | "vancouver" | "ev" | "fallback";
  aiRecommended?: boolean;
  aiReason?: string;
  availabilityEstimate?: "likely available" | "might be busy" | "probably full";
}
```

---

## Gemini Prompt Template

When writing or editing the Gemini prompt, follow this structure:

1. Role: "You are a parking assistant in Vancouver, Canada."
2. Context: destination name + current time + day of week
3. Data: JSON array of top 5 spots (type, walkTime, rate, timeLimit)
4. Output: ONLY valid JSON, no markdown, no explanation outside JSON
5. Schema: { best_index, reason, availability_estimate, tip }

Always strip backticks before JSON.parse().
Always wrap in try/catch — fallback to index 0 if Gemini fails.

---

## Map Setup

```tsx
// Stadia dark tiles
const TILE_URL = "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
const DEFAULT_CENTER: [number, number] = [49.2827, -123.1207];
const DEFAULT_ZOOM = 14;
```

Leaflet MUST use dynamic import with ssr: false in Next.js:
```tsx
const Map = dynamic(() => import("@/components/Map"), { ssr: false });
```

---

## Marker Colors

```ts
const MARKER_COLORS = {
  free: "#22c55e",
  paid: "#eab308",
  ev: "#3b82f6",
  unknown: "#6b7280",
  recommended: "#a855f7",
};
```

---

## Navigation Link

```ts
const openNavigation = (lat: number, lng: number) => {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
    "_blank"
  );
};
```

---

## Fallback Spots (use if APIs timeout during demo)

```ts
export const FALLBACK_SPOTS: ParkingSpot[] = [
  { id: "f1", name: "Pacific Centre Parkade", type: "paid", lat: 49.2827, lng: -123.1207, rate: "$4/hr", walkTime: "2 min", source: "fallback" },
  { id: "f2", name: "Street Parking — Granville St", type: "free", lat: 49.2821, lng: -123.1198, timeLimit: "2 hours", walkTime: "3 min", source: "fallback" },
  { id: "f3", name: "EV Charging — Robson Square", type: "ev", lat: 49.2831, lng: -123.1228, chargers: 4, walkTime: "4 min", source: "fallback" },
];
```

---

## Skills Available

- /mnt/skills/user/prompt-eng/SKILL.md — use when writing/improving the Gemini prompt
- /mnt/skills/public/frontend-design/SKILL.md — use when building UI components
- /mnt/skills/user/humanizer/SKILL.md — use if writing pitch copy

---

## MCP Servers

| Server | Use For |
|---|---|
| filesystem | Read/write project files |
| context7 | Look up latest docs (Leaflet, Next.js, Shadcn) |
| GitHub | Commit, push, check history |
| fetch | Fetch Aceternity component source |

---

## Commit Convention

```
feat: leaflet map + stadia tiles
feat: nominatim geocoding + fly-to
feat: overpass parking markers
feat: open charge map EV layer
feat: gemini recommendation card
feat: results bottom sheet + filters
fix: leaflet ssr import
chore: vercel deploy
```

---

## Priority Order (if time runs out)

1. Map + search working
2. Parking markers on map
3. Gemini AI card  ← never skip this
4. Polish (animations, filters)
5. Mobile layout

---

## Pitch Notes

- Say "I built this solo in under 10 hours" explicitly
- Gemini ranks, predicts, explains — not a chatbot
- Real problem: Google Maps doesn't help you park
- Demo city: Vancouver. Have Cafe Medina address ready.
- Targeting: Best Solo Hack + Best Use of Gemini + Best Design
