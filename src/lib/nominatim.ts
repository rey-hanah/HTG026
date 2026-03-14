import { GeoLocation } from "@/types/parking";

export async function geocodeAddress(query: string): Promise<GeoLocation | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query + ", Vancouver")}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SpotAI/1.0 (Parking Finder)",
      },
    });
    
    if (!res.ok) {
      console.error("Nominatim API error:", res.status, res.statusText);
      return null;
    }
    
    const data = await res.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("No results from Nominatim");
      return null;
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch (e) {
    console.error("Geocoding error:", e);
    return null;
  }
}
