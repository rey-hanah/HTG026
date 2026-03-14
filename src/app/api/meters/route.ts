import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radiusParam = searchParams.get("radius") || "500"; // meters

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  try {
    // Vancouver Open Data - Parking Meters with geo filter
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusM = parseInt(radiusParam);
    
    // Create bounding box based on radius
    const delta = radiusM / 111000; // roughly convert meters to degrees
    
    const url = `https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/records?limit=50&where=within_distance(geom, GEOM'POINT(${lngNum} ${latNum})', ${radiusM}m)`;
    
    const res = await fetch(url);

    if (!res.ok) {
      // Fallback without geo filter
      const fallbackUrl = `https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/records?limit=100`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      
      if (!fallbackData.results) return NextResponse.json([]);
      
      // Manual distance filter based on radius
      const deltaThreshold = radiusM / 111000 * 1.2; // 20% buffer
      const filtered = fallbackData.results.filter((m: any) => {
        if (!m.geom?.geometry?.coordinates) return false;
        const [mLng, mLat] = m.geom.geometry.coordinates;
        const dist = Math.sqrt(Math.pow(mLat - latNum, 2) + Math.pow(mLng - lngNum, 2));
        return dist < deltaThreshold;
      });
      
      return NextResponse.json(parseMeters(filtered));
    }

    const data = await res.json();
    
    if (!data.results) {
      return NextResponse.json([]);
    }

    return NextResponse.json(parseMeters(data.results));
  } catch (e) {
    console.error("Vancouver meters error:", e);
    return NextResponse.json([]);
  }
}

function parseMeters(results: any[]) {
  return results.map((m: any) => {
    const coords = m.geom?.geometry?.coordinates || m.geo_point_2d;
    let mLat: number, mLng: number;
    
    if (Array.isArray(coords)) {
      [mLng, mLat] = coords;
    } else if (coords?.lat) {
      mLat = coords.lat;
      mLng = coords.lon;
    } else {
      return null;
    }

    // Parse rate info
    let rate = "Unknown";
    if (m.r_mf_9a_6p) {
      rate = `$${m.r_mf_9a_6p}/hr`;
    } else if (m.r_mf_6p_10) {
      rate = `$${m.r_mf_6p_10}/hr (evening)`;
    }

    // Parse time limit
    let timeLimit = m.t_mf_9a_6p ? `${m.t_mf_9a_6p} min` : undefined;

    return {
      id: `meter-${m.meter_id || m.meterid || Math.random()}`,
      name: `Street Parking - ${m.block || m.geo_local_area || "Meter"}`,
      address: m.block || "",
      type: "paid" as const,
      lat: mLat,
      lng: mLng,
      rate,
      timeLimit,
      source: "vancouver" as const,
    };
  }).filter(Boolean);
}
