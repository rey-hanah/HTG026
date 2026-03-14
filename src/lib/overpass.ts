import { ParkingSpot } from "@/types/parking";

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
      
      // Get rate
      let rate = "Free";
      if (isPaid) {
        rate = tags["fee:amount"] || tags.charge || "Paid (check sign)";
      }

      return {
        id: `osm-${el.id}`,
        name,
        address: tags["addr:street"] || "",
        type: isPaid ? "paid" : "free",
        lat: spotLat,
        lng: spotLng,
        rate,
        timeLimit: tags.maxstay || undefined,
        capacity: tags.capacity ? parseInt(tags.capacity) : undefined,
        access: tags.access,
        source: "overpass" as const,
      };
    }).filter((s: any) => s.lat && s.lng);
  } catch (e) {
    console.error("Overpass error:", e);
    return [];
  }
}
