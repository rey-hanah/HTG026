import { NextRequest, NextResponse } from "next/server";

// Vancouver OpenData API for EV charging stations
const VANCOUVER_EV_API = "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/electric-vehicle-charging-stations/records";

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const radiusKm = parseFloat(searchParams.get("radius") || "1");
  const radiusMeters = radiusKm * 1000;

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  try {
    // Fetch all Vancouver EV charging stations
    const url = `${VANCOUVER_EV_API}?limit=100`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SpotAI/1.0 (Parking Finder)",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      console.error("Vancouver EV API error:", res.status);
      return NextResponse.json([]);
    }

    const data = await res.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json([]);
    }

    // Filter by distance and parse
    const chargers = data.results
      .filter((station: any) => {
        if (!station.geo_point_2d) return false;
        const stationLat = station.geo_point_2d.lat;
        const stationLng = station.geo_point_2d.lon;
        const distance = calculateDistance(lat, lng, stationLat, stationLng);
        return distance <= radiusMeters;
      })
      .map((station: any) => ({
        id: `ev-van-${station.address?.replace(/\s+/g, "-").toLowerCase() || Math.random().toString(36).substr(2, 9)}`,
        name: `EV Charging - ${station.address || "Unknown"}`,
        address: station.address || "",
        type: "ev" as const,
        lat: station.geo_point_2d.lat,
        lng: station.geo_point_2d.lon,
        chargers: 2, // Vancouver data doesn't specify, assume 2
        rate: "Free (City of Vancouver)",
        operator: station.lot_operator || "City of Vancouver",
        isOperational: true,
        source: "ev" as const,
        neighborhood: station.geo_local_area || "",
      }));

    return NextResponse.json(chargers);
  } catch (e) {
    console.error("EV API error:", e);
    return NextResponse.json([]);
  }
}
