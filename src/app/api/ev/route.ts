import { NextRequest, NextResponse } from "next/server";
import { getOperatorRates } from "@/lib/operatorPricing";

const VANCOUVER_EV_API =
  "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/electric-vehicle-charging-stations/records";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const radiusKm = parseFloat(searchParams.get("radius") || "1");
  const radiusMeters = Math.round(radiusKm * 1000);

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  try {
    // Use geo_point_2d for distance filter — this is the correct field name
    const url = `${VANCOUVER_EV_API}?limit=50&where=within_distance(geo_point_2d,GEOM'POINT(${lng} ${lat})',${radiusMeters}m)`;

    const res = await fetch(url, {
      headers: { "User-Agent": "SpotAI/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("Vancouver EV API error:", res.status);
      return NextResponse.json([]);
    }

    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json([]);
    }

    const chargers = data.results
      .filter(
        (station: any) =>
          station.geo_point_2d?.lat && station.geo_point_2d?.lon
      )
      .map((station: any) => {
        const operator = station.lot_operator || "City of Vancouver";

        // Look up real operator-based pricing
        const operatorRates = getOperatorRates(operator);
        let rate: string;
        if (operatorRates) {
          rate = operatorRates.summary;
        } else {
          // Unknown operator — generic fallback
          const isCity = operator.toLowerCase().includes("city of vancouver");
          rate = isCity ? "Free (City of Vancouver)" : "Paid (see operator kiosk)";
        }

        return {
          id: `ev-van-${station.address
            ?.replace(/\s+/g, "-")
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "") || Math.random().toString(36).substr(2, 9)}`,
          name: `EV Charging – ${station.address || "Unknown"}`,
          address: station.address || "",
          type: "ev" as const,
          lat: station.geo_point_2d.lat,
          lng: station.geo_point_2d.lon,
          chargers: 2, // dataset does not expose port count; 2 is a safe minimum
          rate,
          operator: operatorRates?.operator ?? operator,
          isOperational: true,
          source: "ev" as const,
          neighborhood: station.geo_local_area || undefined,
        };
      });

    return NextResponse.json(chargers);
  } catch (e) {
    console.error("EV API error:", e);
    return NextResponse.json([]);
  }
}
