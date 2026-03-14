import { ParkingSpot } from "@/types/parking";

const OCMS_API = "https://api.openchargemap.io/v3/poi/";

export async function fetchEVChargers(lat: number, lng: number): Promise<ParkingSpot[]> {
  const url = `${OCMS_API}?latitude=${lat}&longitude=${lng}&distance=0.5&distanceunit=2&maxresults=10&output=json`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (!Array.isArray(data)) return [];
    
    return data.map((c: any) => ({
      id: `ev-${c.ID}`,
      name: c.AddressInfo?.Title || "EV Charging Station",
      type: "ev" as const,
      lat: c.AddressInfo?.Latitude,
      lng: c.AddressInfo?.Longitude,
      chargers: c.NumberOfPoints || 1,
      rate: c.UsageCost || "See provider",
      source: "ev" as const,
    })).filter((s: ParkingSpot) => s.lat && s.lng);
  } catch (e) {
    console.error("EV API error:", e);
    return [];
  }
}
