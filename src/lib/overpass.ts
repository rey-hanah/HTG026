import { ParkingSpot } from "@/types/parking";

export async function fetchParkingFromOSM(lat: number, lng: number): Promise<ParkingSpot[]> {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="parking"](around:600,${lat},${lng});
      way["amenity"="parking"](around:600,${lat},${lng});
    );
    out body center;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });

  const data = await res.json();
  
  if (!data.elements) return [];

  return data.elements.map((el: any) => {
    const spotLat = el.lat ?? el.center?.lat;
    const spotLng = el.lon ?? el.center?.lon;
    const tags = el.tags || {};
    
    return {
      id: `osm-${el.id}`,
      name: tags.name || tags.operator || "Parking Lot",
      type: tags.fee === "yes" ? "paid" : "free",
      lat: spotLat,
      lng: spotLng,
      rate: tags.fee === "yes" ? "Unknown" : "Free",
      timeLimit: tags.maxstay || undefined,
      capacity: tags.capacity ? parseInt(tags.capacity) : undefined,
      source: "overpass" as const,
    };
  });
}
