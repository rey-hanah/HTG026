export interface ParkingSpot {
  id: string;
  name: string;
  address?: string;
  type: "free" | "paid" | "ev" | "unknown";
  lat: number;
  lng: number;
  walkTime?: string;
  walkDistance?: number;
  rate?: string;
  timeLimit?: string;
  chargers?: number;
  operator?: string;
  isOperational?: boolean;
  source: "overpass" | "vancouver" | "ev" | "fallback";
  aiRecommended?: boolean;
  aiReason?: string;
  availabilityEstimate?: "likely available" | "might be busy" | "probably full";
}

export interface GeoLocation {
  lat: number;
  lng: number;
  display_name: string;
}

export interface GeminiRecommendation {
  best_index: number;
  reason: string;
  availability_estimate: "likely available" | "might be busy" | "probably full";
  tip?: string;
}
