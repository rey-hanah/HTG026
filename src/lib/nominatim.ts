import { GeoLocation } from "@/types/parking";

export async function geocodeAddress(query: string): Promise<GeoLocation | null> {
  // Use our API route to avoid CORS and rate limiting issues
  const url = `/api/geocode?q=${encodeURIComponent(query)}`;
  
  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error("Geocoding API error:", res.status, res.statusText);
      return null;
    }
    
    const data = await res.json();
    
    if (data.error || !data.lat || !data.lng) {
      console.error("Geocoding failed:", data.error || "Invalid response");
      return null;
    }
    
    return {
      lat: data.lat,
      lng: data.lng,
      display_name: query, // We don't get display_name from our API, use query
    };
  } catch (e) {
    console.error("Geocoding error:", e);
    return null;
  }
}
