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
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusM = parseInt(radiusParam);

    // Vancouver Open Data - geo_point_2d works for distance filter
    // Only fetch meters that are "In Service"
    const url = `https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/records?limit=100&where=within_distance(geo_point_2d,GEOM'POINT(${lngNum} ${latNum})',${radiusM}m) AND service_status="In Service"`;

    const res = await fetch(url, {
      headers: { "User-Agent": "SpotAI/1.0" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("Meters API error:", res.status);
      return NextResponse.json([]);
    }

    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json([]);
    }

    return NextResponse.json(parseMeters(data.results));
  } catch (e) {
    console.error("Vancouver meters error:", e);
    return NextResponse.json([]);
  }
}

function parseMeters(results: any[]) {
  return results
    .map((m: any) => {
      // Prefer geo_point_2d, fall back to geom coordinates
      let mLat: number, mLng: number;
      if (m.geo_point_2d?.lat) {
        mLat = m.geo_point_2d.lat;
        mLng = m.geo_point_2d.lon;
      } else if (m.geom?.geometry?.coordinates) {
        [mLng, mLat] = m.geom.geometry.coordinates;
      } else {
        return null;
      }

      const area = m.geo_local_area || "";

      // Build structured rateDetails
      const rateDetails: {
        daytime?: string;
        evening?: string;
        weekend?: string;
      } = {};

      if (m.rate_9am_6pm) {
        rateDetails.daytime = `${m.rate_9am_6pm}/hr (9am–6pm)`;
      }
      if (m.rate_6pm_10pm) {
        rateDetails.evening = `${m.rate_6pm_10pm}/hr (6pm–10pm)`;
      }
      // Weekend uses same rates typically, but note time limits differ
      if (m.rate_9am_6pm || m.rate_6pm_10pm) {
        rateDetails.weekend = m.rate_9am_6pm
          ? `${m.rate_9am_6pm}/hr`
          : undefined;
      }
      if (m.flat_rate) {
        rateDetails.daytime = `Flat rate: ${m.flat_rate}`;
      }

      // Build flat rate string as fallback
      let rate: string | undefined;
      if (m.rate_9am_6pm) {
        rate = `${m.rate_9am_6pm}/hr (9am–6pm)`;
        if (m.rate_6pm_10pm) rate += `, ${m.rate_6pm_10pm}/hr (6pm–10pm)`;
      } else if (m.flat_rate) {
        rate = `Flat rate: ${m.flat_rate}`;
      }

      // Build structured timeLimitDetails
      const timeLimitDetails: {
        daytime?: string;
        evening?: string;
        weekend?: string;
      } = {};

      if (m.time_limit_9am_6pm) {
        timeLimitDetails.daytime = `Max ${m.time_limit_9am_6pm} (9am–6pm)`;
      }
      if (m.time_limit_6pm_10pm) {
        timeLimitDetails.evening = `Max ${m.time_limit_6pm_10pm} (6pm–10pm)`;
      }
      if (m.time_limit_weekend_9am_6pm) {
        timeLimitDetails.weekend = `Max ${m.time_limit_weekend_9am_6pm} (weekend 9am–6pm)`;
        if (m.time_limit_weekend_6pm_10pm) {
          timeLimitDetails.weekend += `, ${m.time_limit_weekend_6pm_10pm} (6pm–10pm)`;
        }
      }

      // Build flat time limit string
      let timeLimit: string | undefined;
      if (m.time_limit_9am_6pm) {
        timeLimit = `Max ${m.time_limit_9am_6pm} (9am–6pm)`;
        if (m.time_limit_6pm_10pm)
          timeLimit += `, ${m.time_limit_6pm_10pm} (6pm–10pm)`;
      }

      // Build descriptive name
      const headType = m.meter_head || "";
      const payMethod = m.credit_card === "Yes" ? "Card accepted" : "Coins/mobile only";

      return {
        id: `meter-${m.meter_id || m.object_id || Math.random()}`,
        name: `Street Parking${area ? ` – ${area}` : ""}`,
        address: m.meter_id
          ? `Meter #${m.meter_id}${headType ? ` · ${headType}` : ""} · ${payMethod}`
          : "",
        type: "paid" as const,
        lat: mLat,
        lng: mLng,
        rate,
        rateDetails:
          Object.keys(rateDetails).length > 0 ? rateDetails : undefined,
        timeLimit,
        timeLimitDetails:
          Object.keys(timeLimitDetails).length > 0
            ? timeLimitDetails
            : undefined,
        neighborhood: area || undefined,
        source: "vancouver" as const,
      };
    })
    .filter(Boolean);
}
