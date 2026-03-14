export async function getWalkTime(
  fromLat: number, 
  fromLng: number, 
  toLat: number, 
  toLng: number
): Promise<{ duration: number; distance: number; geometry?: any } | null> {
  try {
    const res = await fetch(
      `/api/walk?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`
    );
    const data = await res.json();
    
    if (!data.duration) return null;
    
    return {
      duration: data.duration,
      distance: data.distance,
      geometry: data.geometry,
    };
  } catch (e) {
    console.error("Walk time error:", e);
    return null;
  }
}

export async function getWalkTimesBatch(
  fromLat: number,
  fromLng: number,
  spots: { lat: number; lng: number; id: string }[]
): Promise<Map<string, { duration: number; distance: number; geometry?: any }>> {
  const results = new Map<string, { duration: number; distance: number; geometry?: any }>();
  
  // Process in small batches to avoid rate limiting (4 at a time)
  const batchSize = 4;
  for (let i = 0; i < spots.length; i += batchSize) {
    const batch = spots.slice(i, i + batchSize);
    
    const promises = batch.map(async (spot) => {
      const walk = await getWalkTime(fromLat, fromLng, spot.lat, spot.lng);
      return { id: spot.id, walk };
    });
    
    const batchResults = await Promise.all(promises);
    
    batchResults.forEach(({ id, walk }) => {
      if (walk) {
        results.set(id, walk);
      }
    });
    
    // Small delay between batches
    if (i + batchSize < spots.length) {
      await new Promise(r => setTimeout(r, 30));
    }
  }
  
  return results;
}

export function formatWalkTime(seconds: number): string {
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}
