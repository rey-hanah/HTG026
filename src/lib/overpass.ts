import { ParkingSpot } from "@/types/parking";
import { getOperatorRates } from "@/lib/operatorPricing";

export async function fetchParkingFromOSM(lat: number, lng: number, radius: number = 500): Promise<ParkingSpot[]> {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="parking"](around:${radius},${lat},${lng});
      way["amenity"="parking"](around:${radius},${lat},${lng});
      node["amenity"="parking_space"](around:${Math.min(radius, 400)},${lat},${lng});
    );
    out body center;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (!res.ok) {
      console.error("Overpass error:", res.status);
      return [];
    }

    const data = await res.json();
    
    if (!data.elements) return [];

    return data.elements.map((el: any) => {
      const spotLat = el.lat ?? el.center?.lat;
      const spotLng = el.lon ?? el.center?.lon;
      const tags = el.tags || {};
      
      // Determine if free or paid
      const isFree = tags.fee === "no" || tags.access === "yes" || !tags.fee;
      const isPaid = tags.fee === "yes";
      
      // Get name
      let name = tags.name || tags.operator || "";
      if (!name) {
        const parkingType = tags.parking || "lot";
        name = `Parking ${parkingType.charAt(0).toUpperCase() + parkingType.slice(1)}`;
      }
      
      // Get rate — try tag data first, then operator lookup
      let rate = "Free";
      let rateDetails: { daytime?: string; evening?: string; weekend?: string } | undefined;
      if (isPaid) {
        if (tags["fee:amount"] || tags.charge) {
          rate = tags["fee:amount"] || tags.charge;
        } else {
          // No explicit rate in OSM — try operator-based lookup
          const operatorName = tags.operator || tags.name || "";
          const opRates = getOperatorRates(operatorName);
          if (opRates) {
            rate = opRates.summary;
            rateDetails = {};
            if (opRates.hourly) rateDetails.daytime = opRates.hourly;
            if (opRates.evening) rateDetails.evening = opRates.evening;
            if (opRates.daily) rateDetails.weekend = `Daily: ${opRates.daily}`;
          } else {
            rate = operatorName
              ? `Paid · ${operatorName} (see sign)`
              : "Paid (see sign for rates)";
          }
        }
      }

      return {
        id: `osm-${el.id}`,
        name,
        address: tags["addr:street"] || "",
        type: isPaid ? "paid" : "free",
        lat: spotLat,
        lng: spotLng,
        rate,
        rateDetails,
        timeLimit: tags.maxstay || undefined,
        capacity: tags.capacity ? parseInt(tags.capacity) : undefined,
        access: tags.access,
        operator: tags.operator || undefined,
        source: "overpass" as const,
      };
    }).filter((s: any) => s.lat && s.lng);
  } catch (e) {
    console.error("Overpass error:", e);
    return [];
  }
}
