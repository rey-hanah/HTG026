import { NextRequest, NextResponse } from "next/server";

// OpenChargeMap API key - get free key at https://openchargemap.org/site/profile/api
const OCM_API_KEY = process.env.OCM_API_KEY || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "1"; // km

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  // If no API key, return empty gracefully
  if (!OCM_API_KEY) {
    console.log("OpenChargeMap: No API key configured, skipping EV data");
    return NextResponse.json([]);
  }

  try {
    const url = `https://api.openchargemap.io/v3/poi/?latitude=${lat}&longitude=${lng}&distance=${radius}&distanceunit=km&maxresults=15&output=json&compact=true&verbose=false&key=${OCM_API_KEY}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SpotAI/1.0",
      },
    });

    if (!res.ok) {
      console.error("OpenChargeMap error:", res.status);
      return NextResponse.json([]);
    }

    const data = await res.json();
    
    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }

    // Parse and return clean data
    const chargers = data.map((c: any) => ({
      id: `ev-${c.ID}`,
      name: c.AddressInfo?.Title || "EV Charging Station",
      address: c.AddressInfo?.AddressLine1 || "",
      type: "ev" as const,
      lat: c.AddressInfo?.Latitude,
      lng: c.AddressInfo?.Longitude,
      chargers: c.NumberOfPoints || 1,
      rate: c.UsageCost || "Check provider",
      operator: c.OperatorInfo?.Title || "Unknown",
      isOperational: c.StatusType?.IsOperational ?? true,
      source: "ev" as const,
    })).filter((s: any) => s.lat && s.lng);

    return NextResponse.json(chargers);
  } catch (e) {
    console.error("EV API error:", e);
    return NextResponse.json([]);
  }
}
