export async function getWalkTime(
  fromLat: number, 
  fromLng: number, 
  toLat: number, 
  toLng: number
): Promise<{ duration: number; distance: number } | null> {
  try {
    const res = await fetch(
      `/api/walk?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`
    );
    const data = await res.json();
    
    if (!data.duration) return null;
    
    return {
      duration: data.duration,
      distance: data.distance,
    };
  } catch (e) {
    console.error("Walk time error:", e);
    return null;
  }
}

export function formatWalkTime(seconds: number): string {
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}
