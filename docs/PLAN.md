# SpotAI — Hackathon Project Plan
> Hack the Galaxy · SFU WiCS · Solo Build · 8–10 hrs

---

## Name Ideas (pick one before you pitch)

| Name | Vibe |
|---|---|
| **SpotAI** | Highlights the AI angle, memorable |
| **ParkSense** | Clean, product-y |
| **NearPark** | Simple, intuitive |
| **ParkLens** | Implies intelligence + vision |

> Recommendation: **SpotAI** — judges hear it once and remember it.

---

## The Real Problem

Google Maps takes you to the destination.
It drops you into a parking nightmare.

No app tells you:
- Where to park *near* the destination
- What the time limits are
- Whether EV charging is available
- Which option is actually the *best* for right now

SpotAI solves this with a single search.

---

## Honest API Assessment

> What data can you actually get for free?

| Data Type | Available? | Source | Quality |
|---|---|---|---|
| Parking lot locations | ✅ Yes | Overpass (OSM) | Good coverage in Vancouver |
| Street parking zones | ✅ Yes | Vancouver Open Data | Excellent — meter locations + rates |
| Time restrictions | ✅ Yes | Vancouver Open Data | Hours, day limits |
| Hourly rates | ✅ Partial | Vancouver Open Data | Most paid meters included |
| EV charger locations | ✅ Yes | Open Charge Map | Very accurate |
| EV charger live status | ⚠️ Sometimes | Open Charge Map (status field) | Not guaranteed |
| **Real-time occupancy** | ❌ No | Doesn't exist free | None |
| Walk time to parking | ✅ Yes | OSRM routing | Free, accurate |

### The Availability Problem — Your Gemini Play

Real-time occupancy data does not exist for free anywhere.
This is actually your opportunity.

**Gemini generates intelligent availability estimates** based on:
- Time of day (6pm Friday = packed downtown)
- Day of week
- Proximity to destination type (café vs hospital vs mall)
- Parking type (surface lot vs underground garage)

Frame this in your pitch as: *"AI-powered availability prediction using contextual patterns"*
That is more impressive than raw sensor data — and more honest.

---

## Full App Flow

```
User types destination
       ↓
Nominatim geocodes address → lat/lng
       ↓
Leaflet map flies to location
       ↓
Overpass API query (radius 500m)
→ returns parking nodes + ways
       ↓
Vancouver Open Data query
→ returns meter locations + restrictions
       ↓
Open Charge Map query
→ returns EV chargers
       ↓
All results merged + deduplicated
       ↓
OSRM calculates walk time from each spot
       ↓
Gemini Flash receives:
  - destination name
  - time + day
  - top 5 parking options (type, distance, rate, restrictions)
→ returns: best_index + reason (one sentence) + availability_estimate
       ↓
Map renders color-coded markers
AI Recommendation Card slides up (highlighted)
User clicks → opens Google Maps / Apple Maps navigation
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER (Client-Side Only)        │
│                                                      │
│  ┌──────────────┐     ┌───────────────────────────┐ │
│  │  Search Bar  │────▶│     Next.js App Router    │ │
│  │  (Aceternity)│     │   fully client-side        │ │
│  └──────────────┘     └────────────┬──────────────┘ │
│                                    │                  │
│              ┌─────────────────────┼──────────────┐  │
│              ▼                     ▼              ▼  │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────┐│
│  │  Leaflet Map   │  │  Results Panel  │  │ AI Card  ││
│  │  react-leaflet │  │  Shadcn Cards   │  │ Gemini   ││
│  │  Stadia tiles  │  │  + Badges       │  │ Flash    ││
│  └────────────────┘  └─────────────────┘  └──────────┘│
└─────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────────────┐
│                   FREE PUBLIC APIs                   │
│                                                      │
│  Nominatim       → geocode destination               │
│  Overpass        → parking lots/areas (OSM)          │
│  Vancouver OD    → meters, rates, restrictions       │
│  Open Charge Map → EV charger locations              │
│  OSRM            → walking distance/time             │
│  Gemini Flash    → AI ranking + recommendation       │
└─────────────────────────────────────────────────────┘
```

---

## Complete API Reference

### 1. Nominatim (Geocoding)
```
GET https://nominatim.openstreetmap.org/search
Params: q=Cafe+Medina+Vancouver&format=json&limit=1
Auth: None (add User-Agent header with your app name)
Returns: lat, lon, display_name
```

### 2. Overpass API (Parking from OSM)
```
POST https://overpass-api.de/api/interpreter
Body (Overpass QL):

[out:json][timeout:10];
(
  node["amenity"="parking"](around:600,LAT,LNG);
  way["amenity"="parking"](around:600,LAT,LNG);
  node["parking"="street_side"](around:400,LAT,LNG);
);
out body center;

Returns: nodes/ways with tags: fee, capacity, parking type, access
```

### 3. Vancouver Open Data — Parking Meters
```
GET https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/records
Params:
  limit=20
  offset=0
Auth: None
Returns: meter_id, geo_point_2d, rate_misc, time_limit, r_mf_9a_6p, r_sa_9a_6p

Filter by proximity client-side after fetch (calculate distance from lat/lng).
```

### 4. Open Charge Map (EV Chargers)
```
GET https://api.openchargemap.io/v3/poi/
Params:
  latitude=LAT
  longitude=LNG
  distance=0.5
  distanceunit=km
  maxresults=10
  output=json
Auth: None for basic reads
Returns: AddressInfo, NumberOfPoints, StatusType, UsageCost
```

### 5. OSRM (Walk Time)
```
GET https://router.project-osrm.org/route/v1/foot/LNG1,LAT1;LNG2,LAT2
Params: overview=false
Auth: None
Returns: duration (seconds), distance (meters)
Note: OSRM takes lng,lat order (not lat,lng)
```

### 6. Gemini Flash (AI Recommendation)
```ts
// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function rankParking(destination: string, spots: ParkingSpot[]) {
  const now = new Date();
  const prompt = `
You are a parking assistant in Vancouver, Canada.
User wants to park near: "${destination}"
Current time: ${now.toLocaleTimeString()} on ${now.toLocaleDateString('en-CA', { weekday: 'long' })}

Parking options:
${JSON.stringify(spots.slice(0, 5), null, 2)}

Return ONLY valid JSON, no markdown backticks:
{
  "best_index": 0,
  "reason": "one sentence why this is best for the user right now",
  "availability_estimate": "likely available | might be busy | probably full",
  "tip": "short optional tip about timing or alternatives"
}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}
```

---

## UI Stack — Killer Design Plan

### Install
```bash
npm install leaflet react-leaflet
npm install @google/generative-ai
npm install framer-motion
npm install lucide-react
npx shadcn@latest init
npx shadcn@latest add card badge button
```

### Map Tiles (replaces default OSM look)
**Dark mode (recommended for wow factor):**
```
https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png
```

**Light mode alternative:**
```
https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png
```

Both are free with no API key required in development.

### Marker Color System
```
🟢 Green  = free street parking
🟡 Yellow = paid parking lot
🔵 Blue   = EV charger
🟣 Purple = AI-recommended (add CSS pulse animation)
```

### Layout Strategy
- Full-screen map (100vw, 100vh)
- Floating search bar centered at top (Aceternity Spotlight input)
- Results slide-up panel from bottom (mobile-first sheet)
- AI recommendation card pinned at top of results, subtle glow border
- Filter pills: All / Free / Paid / EV

### Aceternity UI Components
Copy from: https://ui.aceternity.com/components
- **Spotlight** → search input
- **Card hover effect** → parking result cards
- **Animated tooltip** → marker popups

---

## 10-Hour Build Plan

```
Hour 0–1   PROJECT SETUP
           npx create-next-app@latest spotai --typescript --tailwind
           Install all deps
           Deploy blank app to Vercel immediately (get live URL)
           First commit pushed ✓

Hour 1–3   MAP + SEARCH
           Leaflet map fullscreen with Stadia dark tiles
           Nominatim geocoding on search
           Map flies to destination, drops pin
           Commit ✓

Hour 3–5   PARKING DATA LAYER
           Overpass query → parking markers
           Vancouver OD → meter overlays
           Open Charge Map → EV markers
           Color-coded custom icons
           Click popup (type, rate, time limit, walk time)
           Commit ✓

Hour 5–6.5 GEMINI INTEGRATION
           lib/gemini.ts with rankParking()
           Triggered after all data loads
           AI card renders with reason + availability estimate
           Commit ✓

Hour 6.5–8 DESIGN POLISH
           Aceternity spotlight search bar
           Results bottom sheet (Framer Motion slide-up)
           Filter pills (All/Free/Paid/EV)
           Walk time badges on each card
           Navigate button → Google Maps deep link
           Pulse animation on AI-recommended marker
           Commit ✓

Hour 8–9   BUFFER + TESTING
           Test on mobile view
           Add fallback spots if Overpass is slow
           Handle API timeout gracefully
           Final Vercel deploy check
           Commit ✓

Hour 9–10  PITCH PREP
           Write 30-second hook
           Practice demo flow with real Vancouver address
           Memorize 3 wow moments for judges
```

---

## Google Maps Navigation Deep Link
```ts
// Opens Google Maps walking directions to the parking spot
const navigateTo = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  window.open(url, "_blank");
};

// Apple Maps fallback (iOS)
const navigateApple = (lat: number, lng: number) => {
  const url = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`;
  window.open(url, "_blank");
};
```

---

## Demo Script

**Opening hook (30 seconds):**
> "You're driving to a café in Vancouver. Google Maps gets you there.
> Then you spend 15 minutes circling for parking.
> SpotAI solves that — one search, AI-ranked results, instant navigation."

**Live demo flow:**
1. Type "Café Medina, Vancouver" → map flies there
2. Markers appear — point out the color coding
3. Click AI recommendation card → read the reason out loud
4. Hit Navigate → Google Maps opens with walking directions
5. Show EV filter → only EV chargers remain on map

**3 wow moments to hit:**
- The map animation flying to the destination
- The AI card appearing with a human-readable reason
- The Google Maps handoff working live

---

## Fallback Spots (use if APIs are slow during demo)
```ts
export const FALLBACK_SPOTS = [
  {
    id: "fallback-1",
    name: "Pacific Centre Parkade",
    type: "paid",
    rate: "$4/hr",
    walkTime: "2 min",
    lat: 49.2827,
    lng: -123.1207,
  },
  {
    id: "fallback-2",
    name: "Street Parking — Granville St",
    type: "free",
    limit: "2 hours",
    walkTime: "3 min",
    lat: 49.2821,
    lng: -123.1198,
  },
  {
    id: "fallback-3",
    name: "EV Charging — Robson Square",
    type: "ev",
    chargers: 4,
    walkTime: "4 min",
    lat: 49.2831,
    lng: -123.1228,
  },
];
```

---

## Prizes Targeting Strategy

| Prize | Why You Can Win |
|---|---|
| **Best Solo Hack** | You built this alone in 10 hours — say it explicitly |
| **Best Use of Gemini** | Gemini is the decision-maker, not a chatbot |
| **Best Design** | Dark map + animated cards = rare for hackathons |
| **Top 3** | Real-world problem, working demo, clean pitch |

---

## File Structure
```
spotai/
├── app/
│   ├── page.tsx            ← main page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Map.tsx             ← Leaflet map
│   ├── SearchBar.tsx       ← Aceternity spotlight
│   ├── ResultsPanel.tsx    ← bottom sheet
│   ├── AICard.tsx          ← Gemini recommendation
│   └── FilterPills.tsx     ← type filters
├── lib/
│   ├── gemini.ts           ← Gemini helper
│   ├── overpass.ts         ← OSM parking query
│   ├── vancouver.ts        ← Vancouver Open Data
│   ├── ev.ts               ← Open Charge Map
│   └── osrm.ts             ← walk time
├── types/
│   └── parking.ts          ← ParkingSpot type
└── .env.local
    └── NEXT_PUBLIC_GEMINI_API_KEY=your_key
```
