# SpotAI: Smart Parking Finder with AI Recommendations

**Hack the Galaxy (SFU WiCS) — Solo Project**

---

## The Problem

Google Maps tells you how to get somewhere. It does not tell you where to park when you arrive. You circle blocks, check signage, wonder if that side street has a time limit, and watch gas burn while you hunt for a spot. Studies show drivers spend an average of 17 hours per year searching for parking. In dense urban areas, this accounts for up to 30% of city traffic.

I built SpotAI to fix this.

---

## What It Does

SpotAI searches for parking near your destination — every free street spot, paid lot, and EV charger — then uses Gemini AI to recommend the single best option for your situation.

You type in an address (demo: Cafe Medina, Vancouver), and SpotAI queries multiple free APIs in parallel:

- **Overpass API** — OpenStreetMap data for street parking
- **Vancouver Open Data** — city parking meters and zones
- **Open Charge Map** — EV charging stations
- **OSRM** — walking distance and time to destination
- **Nominatim** — geocoding to get coordinates

The results appear on an interactive Leaflet map with color-coded markers (green for free, yellow for paid, blue for EV). Each spot shows walk time, distance, pricing, and time limits.

Then Gemini Flash steps in. It receives the top results with context — current time, day of week, spot details — and recommends the best match. It also predicts availability ("likely available at this hour") and gives a short reason. Not a chatbot. Just a smart ranking that actually helps you decide.

---

## How I Built It

**Stack:** Next.js 15, TypeScript, Tailwind, Shadcn UI, Framer Motion, Leaflet, Gemini Flash, Vercel.

I had roughly 10 hours. This meant cutting scope aggressively. No backend — everything runs client-side. No auth. No user accounts. Just search, see results, pick a spot.

The map uses Stadia dark tiles because they look clean and require no API key. Leaflet needed a dynamic import with `ssr: false` to work in Next.js — a small gotcha that ate an hour.

Gemini integration was the trickiest part. The prompt had to be precise: role, context, data format, output schema. I learned to strip backticks before `JSON.parse()` and wrap everything in try/catch — the API times out sometimes, and the app needs to fallback to index 0.

---

## What I'd Do Different

The geocoding is decent but imperfect. Sometimes it picks the wrong Vancouver (there's one in Washington State). I'd add a city selector or auto-detect from browser location.

The availability prediction is a guess based on time of day. Real-time occupancy data exists in some cities but not Vancouver. I used a simple heuristic: business hours = likely busy, evenings = likely available. It's not perfect, but it demonstrates the concept.

I also wanted a mobile-friendly bottom sheet for results. Ran out of time. Works fine on desktop, acceptable on mobile.

---

## Demo

Try searching for **Cafe Medina** in downtown Vancouver. The app will show nearby parking with walk times and an AI recommendation.

---

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI + Aceternity UI
- Framer Motion
- Leaflet + react-leaflet
- Google Gemini Flash
- Vercel

## APIs

- Nominatim (geocoding)
- Overpass (OpenStreetMap)
- Vancouver Open Data
- Open Charge Map (EV)
- OSRM (walking routes)

---

## Future Ideas

- Real-time occupancy data integration
- User accounts to save favorite spots
- Trip history to learn parking preferences
- Support for other cities beyond Vancouver
- PWA for offline capability

---

Built solo in under 10 hours for Hack the Galaxy (SFU WiCS).
