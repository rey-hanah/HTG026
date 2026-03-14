import { ParkingSpot } from "@/types/parking";

export async function fetchParkingMeters(lat: number, lng: number, radius: number = 500): Promise<ParkingSpot[]> {
  try {
    const res = await fetch(`/api/meters?lat=${lat}&lng=${lng}&radius=${radius}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Vancouver meters error:", e);
    return [];
  }
}
