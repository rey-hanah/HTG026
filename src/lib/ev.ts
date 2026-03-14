import { ParkingSpot } from "@/types/parking";

export async function fetchEVChargers(lat: number, lng: number, radius: number = 500): Promise<ParkingSpot[]> {
  try {
    // Convert radius from meters to km for API
    const radiusKm = radius / 1000;
    const res = await fetch(`/api/ev?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("EV API error:", e);
    return [];
  }
}
