export interface ParkingSpot {
  id: string;
  name: string;
  address?: string;
  type: "free" | "paid" | "ev" | "unknown";
  lat: number;
  lng: number;
  walkTime?: string;
  walkDistance?: number;
  walkGeometry?: any; // GeoJSON geometry for walking route
  
  // Paid parking details
  rate?: string;
  rateDetails?: {
    daytime?: string;    // e.g., "$6.50/hr (9am-6pm)"
    evening?: string;    // e.g., "$4.00/hr (6pm-10pm)"
    weekend?: string;    // e.g., "$3.00/hr"
  };
  
  // Free parking details
  timeLimit?: string;
  timeLimitDetails?: {
    daytime?: string;    // e.g., "Max 2 Hr (9am-6pm)"
    evening?: string;    // e.g., "Max 4 Hr (6pm-10pm)"
    weekend?: string;    // e.g., "No limit"
  };
  
  // EV charging details
  chargers?: number;
  operator?: string;
  isOperational?: boolean;
  connectorTypes?: string[];
  
  // Source and metadata
  source: "overpass" | "vancouver" | "ev" | "fallback";
  neighborhood?: string;
  
  // AI recommendation
  aiRecommended?: boolean;
  aiReason?: string;
  availabilityEstimate?: "likely available" | "might be busy" | "probably full";
  
  // Street View image
  streetViewUrl?: string;
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
