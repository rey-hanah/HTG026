import { ParkingSpot } from "@/types/parking";

const VancouverOD_API = "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/records";

export async function fetchParkingMeters(lat: number, lng: number): Promise<ParkingSpot[]> {
  const radius = 0.01; 
  
  const url = `${VancouverOD_API}?limit=20&offset=0`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.results) return [];
    
    return data.results
      .filter((m: any) => {
        const mLat = m.geo_point_2d?.lat;
        const mLng = m.geo_point_2d?.lon;
        if (!mLat || !mLng) return false;
        const dist = Math.sqrt(Math.pow(mLat - lat, 2) + Math.pow(mLng - lng, 2));
        return dist < radius;
      })
      .map((m: any) => ({
        id: `meter-${m.meter_id}`,
        name: `Street Parking - ${m.blockface_id || "Meter"}`,
        type: "paid" as const,
        lat: m.geo_point_2d.lat,
        lng: m.geo_point_2d.lon,
        rate: m.rate_misc || "$2.00/hr",
        timeLimit: m.time_limit ? `${m.time_limit} min` : undefined,
        source: "vancouver" as const,
      }));
  } catch (e) {
    console.error("Vancouver OD error:", e);
    return [];
  }
}
