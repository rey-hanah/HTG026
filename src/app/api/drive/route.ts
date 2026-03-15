import { NextRequest, NextResponse } from "next/server";

// OSRM returns ideal no-traffic driving durations.
// Apply a multiplier to approximate real-world urban Vancouver traffic.
// 1.5x is a reasonable average — peak hours may be 2x, off-peak ~1.2x.
const TRAFFIC_MULTIPLIER = 1.5;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromLat = searchParams.get("fromLat");
  const fromLng = searchParams.get("fromLng");
  const toLat = searchParams.get("toLat");
  const toLng = searchParams.get("toLng");

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SpotAI/1.0",
      },
    });

    if (!res.ok) {
      console.error("OSRM driving error:", res.status);
      return NextResponse.json({ duration: null, distance: null });
    }

    const data = await res.json();
    
    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json({ duration: null, distance: null });
    }

    // Apply traffic multiplier to get a more realistic estimate
    const rawDuration = data.routes[0].duration; // seconds
    const adjustedDuration = Math.round(rawDuration * TRAFFIC_MULTIPLIER);

    return NextResponse.json({
      duration: adjustedDuration,
      distance: data.routes[0].distance,
    });
  } catch (e) {
    console.error("OSRM driving error:", e);
    return NextResponse.json({ duration: null, distance: null });
  }
}
