export async function getWalkTime(
  fromLat: number, 
  fromLng: number, 
  toLat: number, 
  toLng: number
): Promise<{ duration: number; distance: number } | null> {
  const url = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.routes || data.routes.length === 0) return null;
    
    return {
      duration: data.routes[0].duration,
      distance: data.routes[0].distance,
    };
  } catch (e) {
    console.error("OSRM error:", e);
    return null;
  }
}

export function formatWalkTime(seconds: number): string {
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}
