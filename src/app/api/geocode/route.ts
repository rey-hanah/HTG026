import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { lat: number; lng: number; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  // Check cache first
  const cached = cache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ lat: cached.lat, lng: cached.lng });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}, Vancouver`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SpotAI/1.0",
      },
    });

    if (!res.ok) {
      console.error("Nominatim geocoding error:", res.status);
      return NextResponse.json({ error: "Geocoding failed" }, { status: res.status });
    }

    const data = await res.json();
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    // Cache the result
    cache.set(query, { ...result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (e) {
    console.error("Nominatim geocoding error:", e);
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
