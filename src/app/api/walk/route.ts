import { NextRequest, NextResponse } from "next/server";

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
    // OSRM uses lng,lat order - get geometry for route visualization
    const url = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SpotAI/1.0",
      },
    });

    if (!res.ok) {
      console.error("OSRM error:", res.status);
      return NextResponse.json({ duration: null, distance: null, geometry: null });
    }

    const data = await res.json();
    
    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json({ duration: null, distance: null, geometry: null });
    }

    const route = data.routes[0];
    return NextResponse.json({
      duration: route.duration,
      distance: route.distance,
      geometry: route.geometry,
    });
  } catch (e) {
    console.error("OSRM error:", e);
    return NextResponse.json({ duration: null, distance: null, geometry: null });
  }
}
