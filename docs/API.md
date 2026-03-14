# ParkSense — API Reference
> Test every endpoint here before writing integration code. If it doesn't return data, it doesn't go in the app.

---

## Quick Status

| # | API | Free? | Auth | Core Value | Test First |
|---|-----|-------|------|-----------|------------|
| 1 | [Google Places API (New)](#1-google-places-api-new) | ⚠️ ~$5/1K req | API Key | Named garages (Impark, Indigo) + parkingOptions | Yes |
| 2 | [Overpass API (OSM)](#2-overpass-api-osm) | ✅ Free | None | Street parking + OSM lots | Yes |
| 3 | [Nominatim](#3-nominatim--geocoding) | ✅ Free | User-Agent header | Destination → lat/lng | Yes |
| 4 | [Vancouver OD — Meters](#4-vancouver-open-data--parking-meters) | ✅ Free | None | $/hr rates + time limits per block | Yes |
| 5 | [Vancouver OD — Tickets](#5-vancouver-open-data--parking-tickets-heatmap) | ✅ Free | None | Historical busyness → heatmap | Yes |
| 6 | [Open Charge Map](#6-open-charge-map--ev-chargers) | ✅ Free | None | EV charger locations + status | Yes |
| 7 | [BestTime.app](#7-besttimeapp--area-busyness-forecast) | ⚠️ Free credits | API Key | Foot traffic % by hour/day | Optional |
| 8 | [Gemini 1.5 Flash](#8-google-gemini-15-flash--ai-layer) | ✅ Free tier | NEXT_PUBLIC key | Constraint parser + AI ranker | Yes |
| 9 | [OSRM](#9-osrm--pedestrian-walk-time) | ✅ Free | None | Real walk time (seconds) | Yes |

---

## 1. Google Places API (New)

**Docs:** https://developers.google.com/maps/documentation/places/web-service/nearby-search  
**Console (get key):** https://console.cloud.google.com/apis/library/places-backend.googleapis.com  
**Billing:** ~$0.005–$0.017 per request depending on fields requested  
**What it gives:** Named commercial parking garages and lots (Impark, Indigo, EasyPark), with `parkingOptions` booleans and opening hours. Does NOT give street parking, pricing, or time limits.

### Endpoint
```
POST https://places.googleapis.com/v1/places:searchNearby
```

### Request
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: YOUR_KEY" \
  -H "X-Goog-FieldMask: places.displayName,places.location,places.formattedAddress,places.parkingOptions,places.regularOpeningHours,places.primaryType" \
  -d '{
    "includedTypes": ["parking"],
    "maxResultCount": 10,
    "locationRestriction": {
      "circle": {
        "center": { "latitude": 49.2827, "longitude": -123.1207 },
        "radius": 600.0
      }
    }
  }' \
  https://places.googleapis.com/v1/places:searchNearby
```

### Response Shape
```json
{
  "places": [
    {
      "name": "places/ChIJxxxxxxxx",
      "displayName": { "text": "Impark Parking", "languageCode": "en" },
      "formattedAddress": "789 Burrard St, Vancouver, BC V6Z 1X3",
      "location": { "latitude": 49.2831, "longitude": -123.1195 },
      "primaryType": "parking",
      "parkingOptions": {
        "freeParkingLot": false,
        "paidParkingLot": true,
        "freeStreetParking": false,
        "paidStreetParking": false,
        "valetParking": false,
        "freeGarageParking": false,
        "paidGarageParking": true
      },
      "regularOpeningHours": {
        "openNow": true,
        "weekdayDescriptions": [
          "Monday: 6:00 AM – 11:00 PM",
          "Tuesday: 6:00 AM – 11:00 PM"
        ]
      }
    }
  ]
}
```

### Fields You Can Use
| Field | What it tells you |
|-------|------------------|
| `displayName.text` | Lot/garage name |
| `location` | lat/lng for map pin |
| `formattedAddress` | Street address |
| `parkingOptions.paidGarageParking` | Is it a paid garage? |
| `parkingOptions.freeStreetParking` | Does this place offer free street access? |
| `regularOpeningHours.openNow` | Open right now? |

### What This Does NOT Give
- ❌ Price per hour
- ❌ Time limits (maxstay)
- ❌ Rush-hour restrictions
- ❌ Street parking blocks (only named places)
- ❌ Capacity or availability

### TypeScript Helper
```ts
// lib/googlePlaces.ts
export async function fetchNearbyGarages(lat: number, lng: number) {
  const res = await fetch(
    'https://places.googleapis.com/v1/places:searchNearby',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY!,
        'X-Goog-FieldMask':
          'places.displayName,places.location,places.formattedAddress,places.parkingOptions,places.regularOpeningHours',
      },
      body: JSON.stringify({
        includedTypes: ['parking'],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 600.0,
          },
        },
      }),
    }
  );
  const data = await res.json();
  return data.places ?? [];
}
```

---

## 2. Overpass API (OSM)

**Docs:** https://wiki.openstreetmap.org/wiki/Overpass_API  
**Endpoint:** https://overpass-api.de/api/interpreter  
**Test tool (browser):** https://overpass-turbo.eu  
**Auth:** None — CORS enabled, call directly from client  
**What it gives:** All OSM-tagged parking nodes and ways within a radius — street parking, surface lots, underground, multi-storey. Includes fee, maxstay, capacity tags where available.

### Test in Browser (Overpass Turbo)
Paste this query at https://overpass-turbo.eu and hit Run:
```
[out:json][timeout:10];
(
  node["amenity"="parking"](around:600,49.2827,-123.1207);
  way["amenity"="parking"](around:600,49.2827,-123.1207);
);
out body center;
```

### Request (TypeScript)
```ts
const query = `
  [out:json][timeout:10];
  (
    node["amenity"="parking"](around:600,${lat},${lng});
    way["amenity"="parking"](around:600,${lat},${lng});
  );
  out body center;
`;

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: query,
});
const data = await res.json();
return data.elements;
```

### Response Shape
```json
{
  "elements": [
    {
      "type": "node",
      "id": 123456789,
      "lat": 49.2831,
      "lon": -123.1195,
      "tags": {
        "amenity": "parking",
        "fee": "yes",
        "parking": "surface",
        "maxstay": "2 hours",
        "capacity": "45",
        "access": "yes",
        "operator": "Impark",
        "lit": "yes"
      }
    },
    {
      "type": "way",
      "center": { "lat": 49.2819, "lon": -123.1188 },
      "tags": {
        "amenity": "parking",
        "fee": "no",
        "parking": "street_side",
        "maxstay": "1 hour"
      }
    }
  ]
}
```

### Tag Reference — Vancouver Coverage Quality
| Tag | Values | Vancouver Coverage |
|-----|--------|-------------------|
| `fee` | `yes` / `no` | ✅ Good — most lots tagged |
| `parking` | `surface`, `multi-storey`, `street_side`, `underground` | ✅ Good for lots, sparse for street |
| `maxstay` | `"1 hour"`, `"2 hours"`, `"unlimited"` | ⚠️ Partial — fill gaps with Van OD Meters |
| `capacity` | number | ⚠️ Often missing |
| `operator` | `"Impark"`, `"EasyPark"`, etc | ⚠️ Major lots usually tagged |
| `access` | `yes`, `private`, `customers` | ⚠️ Moderate |

### Normalizer
```ts
// lib/overpass.ts
export function normalizeOSMSpot(el: any) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  return {
    id: `osm-${el.id}`,
    source: 'osm',
    lat,
    lng,
    type: el.tags?.parking ?? 'unknown',
    fee: el.tags?.fee === 'yes',
    maxstay: el.tags?.maxstay ?? null,
    capacity: el.tags?.capacity ? parseInt(el.tags.capacity) : null,
    operator: el.tags?.operator ?? null,
    access: el.tags?.access ?? 'yes',
  };
}
```

---

## 3. Nominatim — Geocoding

**Docs:** https://nominatim.org/release-docs/develop/api/Search/  
**Endpoint:** `GET https://nominatim.openstreetmap.org/search`  
**Auth:** None — but **MUST** include `User-Agent` header (their Terms of Service)  
**Rate limit:** Max 1 request/second — add 400ms debounce on search input  
**What it gives:** Converts text like "Café Medina Vancouver" → `{ lat, lon, display_name }`

### Test in Browser
```
https://nominatim.openstreetmap.org/search?q=Cafe+Medina+Vancouver&format=json&limit=1
```

### Request
```ts
// lib/nominatim.ts
export async function geocode(query: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
    {
      headers: {
        'User-Agent': 'ParkSense-Hackathon/1.0 (your@email.com)',
      },
    }
  );
  const data = await res.json();
  if (!data.length) return null;
  return {
    lat: parseFloat(data[0].lat),   // Note: returns as string — must parseFloat
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
```

### Response Shape
```json
[
  {
    "place_id": 123456,
    "lat": "49.27919",
    "lon": "-123.11731",
    "display_name": "Café Medina, 780 Richards St, Vancouver, BC V6B 3A4, Canada",
    "type": "restaurant",
    "importance": 0.7
  }
]
```

> ⚠️ `lat` and `lon` are strings — always `parseFloat()` before using as numbers.

---

## 4. Vancouver Open Data — Parking Meters

**Portal:** https://opendata.vancouver.ca/explore/dataset/parking-meters/  
**API Endpoint:** `GET https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/records`  
**Auth:** None  
**Update frequency:** Weekly  
**What it gives:** Official City of Vancouver meter data — block-level rates ($/hr) for different time windows, time limits per window, and geo coordinates.

### Test in Browser (API Console)
https://opendata.vancouver.ca/explore/dataset/parking-meters/api/

### Request — meters within 500m of destination
```ts
// lib/vanMeters.ts
export async function fetchMetersNear(lat: number, lng: number) {
  const url = new URL(
    'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/records'
  );
  url.searchParams.set('limit', '100');
  // Geo filter: returns meters within 500m
  url.searchParams.set(
    'where',
    `dist(geo_point_2d, GEOM'POINT(${lng} ${lat})')<500`
  );

  const res = await fetch(url.toString());
  const data = await res.json();
  return data.results ?? [];
}
```

### Response Shape
```json
{
  "total_count": 23,
  "results": [
    {
      "meter_head": "SINGLE",
      "hundred_block": "700 BURRARD ST",
      "r_mf_9a_6p": "2.00",   // Mon-Fri 9am-6pm rate ($/hr)
      "r_mf_6p_10": "2.00",   // Mon-Fri 6pm-10pm rate
      "r_sa_9a_6p": "2.00",   // Saturday 9am-6pm rate
      "r_sa_6p_10": "2.00",   // Saturday 6pm-10pm rate
      "r_su_9a_6p": "0.00",   // Sunday rate — often free!
      "t_mf_9a_6p": "2 Hr",   // Mon-Fri 9am-6pm time limit
      "t_mf_6p_10": "2 Hr",
      "t_sa_9a_6p": "2 Hr",
      "t_su_9a_6p": "10 Hr",  // Sunday limit usually longer
      "geo_point_2d": { "lon": -123.1195, "lat": 49.2831 }
    }
  ]
}
```

### Rate Field Key
| Field | Time Window | Notes |
|-------|-------------|-------|
| `r_mf_9a_6p` | Mon–Fri 9am–6pm | Most common enforcement window |
| `r_mf_6p_10` | Mon–Fri 6pm–10pm | Evening rate |
| `r_sa_9a_6p` | Saturday 9am–6pm | Weekend daytime |
| `r_su_9a_6p` | Sunday 9am–6pm | Often `"0.00"` = free |
| `t_*` | Same windows | Time limit string: `"1 Hr"`, `"2 Hr"`, `"10 Hr"` |

### Get Active Rate for Current Time
```ts
export function getActiveRate(meter: any): { rate: string; limit: string } {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Sun, 6=Sat

  if (day === 0) return { rate: meter.r_su_9a_6p, limit: meter.t_su_9a_6p };
  if (day === 6) {
    if (hour >= 9 && hour < 18) return { rate: meter.r_sa_9a_6p, limit: meter.t_sa_9a_6p };
    return { rate: meter.r_sa_6p_10, limit: meter.t_sa_6p_10 };
  }
  if (hour >= 9 && hour < 18) return { rate: meter.r_mf_9a_6p, limit: meter.t_mf_9a_6p };
  if (hour >= 18 && hour < 22) return { rate: meter.r_mf_6p_10, limit: meter.t_mf_6p_10 };
  return { rate: '0.00', limit: 'Unlimited' }; // Outside enforcement hours
}
```

---

## 5. Vancouver Open Data — Parking Tickets (Heatmap)

**Portal:** https://opendata.vancouver.ca/explore/dataset/parking-tickets/  
**API Endpoint:** `GET https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-tickets/records`  
**Auth:** None  
**Update frequency:** Quarterly  
**What it gives:** Every parking infraction since 2020, by block and date. High ticket density = historically busy area. This is your heatmap source.

### Logic
```
More tickets on a block  =  More parking demand  =  Hotter on the heatmap
```

### Request — ticket counts grouped by block near destination
```ts
// lib/vanTickets.ts
export async function fetchTicketDensity(streetName: string) {
  const url = new URL(
    'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-tickets/records'
  );
  url.searchParams.set('limit', '100');
  url.searchParams.set('where', `street='${streetName.toUpperCase()}'`);
  url.searchParams.set('select', 'hundred_block,count(record_id) as ticket_count');
  url.searchParams.set('group_by', 'hundred_block');
  url.searchParams.set('order_by', 'ticket_count desc');

  const res = await fetch(url.toString());
  const data = await res.json();
  return data.results ?? [];
}
```

### Response Shape
```json
{
  "results": [
    { "hundred_block": "900 ROBSON ST",  "ticket_count": 2341 },
    { "hundred_block": "1000 ROBSON ST", "ticket_count": 1876 },
    { "hundred_block": "800 ROBSON ST",  "ticket_count": 1203 }
  ]
}
```

### Heatmap Integration with Leaflet.heat
```bash
npm install leaflet.heat
```

```ts
// components/map/HeatmapLayer.tsx
import 'leaflet.heat';

const maxCount = Math.max(...tickets.map(t => t.ticket_count));

const heatPoints = tickets.map(t => [
  t.lat,
  t.lng,
  t.ticket_count / maxCount,   // normalize 0.0–1.0
]);

L.heatLayer(heatPoints, {
  radius: 30,
  blur: 20,
  gradient: {
    0.2: '#4ADE80',   // green  = low demand
    0.5: '#FBBF24',   // amber  = moderate
    0.8: '#EF4444',   // red    = high demand
  },
}).addTo(map);
```

> ⚠️ Label this "Historically busy" in the UI — not "Currently busy". Be honest. Judges respect it.

---

## 6. Open Charge Map — EV Chargers

**Docs:** https://openchargemap.org/site/develop/api  
**Endpoint:** `GET https://api.openchargemap.io/v3/poi/`  
**Auth:** None for basic reads (optional key for higher rate limits)  
**CORS:** Enabled — safe to call from client  
**What it gives:** EV charging station locations, connector types, number of points, and operational status.

### Test in Browser
```
https://api.openchargemap.io/v3/poi/?output=json&latitude=49.2827&longitude=-123.1207&distance=1&distanceunit=KM&maxresults=5
```

### Request
```ts
// lib/openChargeMap.ts
export async function fetchEVChargers(lat: number, lng: number) {
  const url = new URL('https://api.openchargemap.io/v3/poi/');
  url.searchParams.set('output', 'json');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lng.toString());
  url.searchParams.set('distance', '1');
  url.searchParams.set('distanceunit', 'KM');
  url.searchParams.set('maxresults', '20');
  url.searchParams.set('compact', 'true');
  url.searchParams.set('verbose', 'false');

  const res = await fetch(url.toString());
  return res.json();
}
```

### Response Shape
```json
[
  {
    "ID": 12345,
    "AddressInfo": {
      "Title": "Tesla Supercharger — Hotel Vancouver",
      "AddressLine1": "900 West Georgia St",
      "Latitude": 49.2845,
      "Longitude": -123.1218
    },
    "NumberOfPoints": 8,
    "StatusType": {
      "Title": "Operational",
      "IsOperational": true
    },
    "Connections": [
      {
        "ConnectionType": { "Title": "CCS (Type 1)" },
        "PowerKW": 150,
        "StatusType": { "IsOperational": true },
        "Quantity": 4
      }
    ]
  }
]
```

### Fields to Display
| Field | Display as |
|-------|-----------|
| `AddressInfo.Title` | Charger name |
| `AddressInfo.Latitude/Longitude` | Map pin |
| `NumberOfPoints` | "8 charging points" |
| `StatusType.IsOperational` | Green/red status badge |
| `Connections[0].PowerKW` | "150 kW" |
| `Connections[0].ConnectionType.Title` | Connector type |

---

## 7. BestTime.app — Area Busyness Forecast

**Docs:** https://besttime.app/api/v1/  
**Sign up (get free credits):** https://besttime.app  
**Endpoint:** `GET https://besttime.app/api/v1/forecasts`  
**Auth:** API key (free tier = limited credits)  
**What it gives:** Foot traffic % by hour (0–23) relative to venue peak, for any address. Use the destination area to estimate how busy parking will be.

### Request
```ts
// lib/bestTime.ts
export async function getAreaBusyness(venueName: string, venueAddress: string) {
  const url = `https://besttime.app/api/v1/forecasts` +
    `?api_key=${process.env.NEXT_PUBLIC_BESTTIME_KEY}` +
    `&venue_name=${encodeURIComponent(venueName)}` +
    `&venue_address=${encodeURIComponent(venueAddress)}`;

  const res = await fetch(url);
  const data = await res.json();

  const currentHour = new Date().getHours();
  const busynessNow = data?.analysis?.day_raw?.[currentHour] ?? null;

  return {
    busynessPercent: busynessNow,          // e.g. 78 = 78% of peak
    busyHours: data?.analysis?.busy_hours ?? [],
    quietHours: data?.analysis?.quiet_hours ?? [],
  };
}
```

### Response Shape
```json
{
  "analysis": {
    "day_raw": [5, 5, 5, 5, 5, 10, 20, 40, 60, 75, 80, 85, 90, 85, 80, 75, 85, 90, 88, 80, 65, 50, 30, 15],
    "day_info": { "day_text": "Friday", "day_mean": 56 },
    "busy_hours": [11, 12, 13, 17, 18, 19, 20],
    "quiet_hours": [1, 2, 3, 4, 5, 6]
  }
}
```

> ⚠️ Have a fallback. If BestTime fails or runs out of credits, pass just the current time + day to Gemini and let it reason: "It's Friday evening — this area is typically very busy."

---

## 8. Google Gemini 1.5 Flash — AI Layer

**Docs:** https://ai.google.dev/gemini-api/docs  
**API Studio (test prompts first):** https://aistudio.google.com  
**SDK:** `npm install @google/generative-ai`  
**Model:** Always `gemini-1.5-flash` — fast, free tier, reliable JSON output  
**Free tier:** 15 req/min, 1M tokens/day

### Setup
```ts
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

### Step 1 — Constraint Parser

Runs immediately on user submit, before any map API calls.

```ts
export async function parseConstraints(userInput: string) {
  const prompt = `
Extract parking constraints from this user query.
Respond ONLY with valid JSON. No markdown, no preamble.

{
  "destination": "the place name as written",
  "maxDuration": null or number (minutes),
  "maxPrice": null or number (dollars/hr),
  "needsEV": true or false,
  "needsAccessible": true or false,
  "timeOfArrival": "now" or "HH:MM" (24h)
}

User query: "${userInput}"
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    // Fallback: treat full input as destination with no constraints
    return { destination: userInput, maxDuration: null, maxPrice: null, needsEV: false, needsAccessible: false, timeOfArrival: 'now' };
  }
}
```

**Examples of what it parses:**

| User types | Parsed output |
|-----------|--------------|
| "parking near Café Medina" | `{ destination: "Café Medina", maxDuration: null, maxPrice: null, needsEV: false }` |
| "parking near Robson for 2 hours under $5" | `{ destination: "Robson", maxDuration: 120, maxPrice: 5, needsEV: false }` |
| "EV charging near Science World" | `{ destination: "Science World", needsEV: true, maxDuration: null }` |
| "accessible parking near VGH" | `{ destination: "Vancouver General Hospital", needsAccessible: true }` |

### Step 2 — Parking Ranker

Runs after all parking data is fetched and merged.

```ts
export async function rankParkingSpots(
  destination: string,
  constraints: any,
  spots: ParkingSpot[],
  busynessPercent: number | null
) {
  const now = new Date().toLocaleString('en-CA', { timeZone: 'America/Vancouver' });

  const prompt = `
You are a parking advisor for Vancouver, BC, Canada.
Current local time: ${now}
User destination: ${destination}
User constraints: ${JSON.stringify(constraints)}
Area busyness right now: ${busynessPercent !== null ? `${busynessPercent}% of peak` : 'unknown'}

Nearby parking options:
${spots.slice(0, 8).map((s, i) => `[${i}] ${JSON.stringify(s)}`).join('\n')}

Rules:
- If needsEV is true, ONLY consider spots with EV chargers
- If maxPrice is set, EXCLUDE spots priced above that per hour
- If maxDuration is set, EXCLUDE spots with time limits shorter than that
- Consider rush-hour restrictions based on current time
- Warn about any time restrictions the user should know before parking

Respond ONLY with valid JSON. No markdown, no extra text:
{
  "best_index": 0,
  "reason": "one sentence why this is best for this specific user",
  "warnings": ["any time restrictions or risks as strings"],
  "ranked": [0, 2, 1, 3]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { best_index: 0, reason: 'Closest available spot.', warnings: [], ranked: spots.map((_, i) => i) };
  }
}
```

**Example Gemini output:**
```json
{
  "best_index": 1,
  "reason": "The Seymour St lot is your best bet — $3/hr, no time limit, and only a 2 min walk from Café Medina.",
  "warnings": [
    "⚠️ The metered spots on Richards become no-parking at 4pm on weekdays — it is currently 3:45pm.",
    "⚠️ This area is at 78% capacity on Friday evenings — arrive before 6pm for better options."
  ],
  "ranked": [1, 0, 3, 2]
}
```

---

## 9. OSRM — Pedestrian Walk Time

**Docs:** https://project-osrm.org/docs/v5.22.0/api/  
**Endpoint:** `GET https://router.project-osrm.org/route/v1/foot/{parkLng},{parkLat};{destLng},{destLat}`  
**Auth:** None — public instance  
**What it gives:** Real pedestrian route duration in seconds and distance in meters.

### Test in Browser
```
https://router.project-osrm.org/route/v1/foot/-123.1195,49.2831;-123.1178,49.2792?overview=false
```

### Request
```ts
// lib/walkTime.ts
export async function getWalkTime(
  parkLat: number, parkLng: number,
  destLat: number, destLng: number
): Promise<number> {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${parkLng},${parkLat};${destLng},${destLat}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    return Math.round(data.routes[0].duration / 60); // seconds → minutes
  } catch {
    return haversineMinutes(parkLat, parkLng, destLat, destLng); // fallback
  }
}

// Fallback — instant, no API call
export function haversineMinutes(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(dist / 80); // 80 m/min average walk speed
}
```

### Response Shape
```json
{
  "code": "Ok",
  "routes": [
    {
      "distance": 420.3,
      "duration": 312.1
    }
  ]
}
```

> Use Haversine by default for all results. Only call OSRM for the single AI-recommended best spot where walk time accuracy matters for the display card.

---

## Data Flow — Full Sequence

```
User submits query: "parking near Café Medina for 2 hours EV"
│
├─ Step 1:  Gemini parser  →  { destination: "Café Medina", maxDuration: 120, needsEV: true }
│
├─ Step 2:  Nominatim      →  { lat: 49.2792, lng: -123.1178 }
│
├─ Step 3 (parallel):
│   ├─ 3a: Overpass        →  OSM parking nodes/ways (street + lots)
│   ├─ 3b: Vancouver OD    →  Meter rates + time limits per block
│   └─ 3c: Open Charge Map →  EV charger locations + status
│
├─ Step 4:  Google Places  →  Named garage names (Impark, EasyPark) [optional layer]
│
├─ Step 5:  Merge all      →  Unified ParkingSpot[] array
│
├─ Step 6:  Haversine      →  Add walkMinutes to each spot (instant, client-side)
│
├─ Step 7:  BestTime       →  busynessPercent for destination area [optional]
│
└─ Step 8:  Gemini ranker  →  { best_index, reason, warnings, ranked }
                                        │
                                        ├─ Map: pulsing purple pin on best spot
                                        └─ Panel: AI card + warning banners
```

### Promise.all for parallel calls
```ts
const [osmSpots, meterData, evSpots] = await Promise.all([
  fetchOverpassParking(lat, lng),
  fetchVancouverMeters(lat, lng),
  fetchEVChargers(lat, lng),
]);
```

---

## Environment Variables

```env
# .env.local

# Required
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here

# Optional — for named garage names (Impark etc.)
NEXT_PUBLIC_GOOGLE_PLACES_KEY=your_google_places_key_here

# Optional — for area busyness forecast
NEXT_PUBLIC_BESTTIME_KEY=your_besttime_key_here
```

> For a hackathon demo, `NEXT_PUBLIC_` keys exposed in the browser bundle is acceptable.

---

## Pre-Build Testing Checklist

Before writing any integration code, verify each endpoint returns real data:

- [ ] **Nominatim** — paste the browser URL, check lat/lon come back as strings
- [ ] **Overpass** — run the query at overpass-turbo.eu, verify Vancouver parking nodes appear
- [ ] **Vancouver OD Meters** — use the API console at the portal URL, filter by `hundred_block`
- [ ] **Vancouver OD Tickets** — same portal, confirm `hundred_block` + count grouping works
- [ ] **Open Charge Map** — paste the browser URL, verify Vancouver EV stations appear
- [ ] **OSRM** — paste the browser URL, verify `duration` comes back in seconds
- [ ] **Gemini** — test constraint parser prompt in Google AI Studio before SDK integration
- [ ] **Google Places** — test in Maps Platform console (only if adding named garage names)
