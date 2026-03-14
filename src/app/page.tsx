"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import ResultsPanel from "@/components/ResultsPanel";
import RadiusControl from "@/components/RadiusControl";
import ArrivalTimeControl from "@/components/ArrivalTimeControl";
import { geocodeAddress } from "@/lib/nominatim";
import { fetchParkingFromOSM } from "@/lib/overpass";
import { fetchParkingMeters } from "@/lib/vancouver";
import { fetchEVChargers } from "@/lib/ev";
import { getWalkTime } from "@/lib/osrm";
import { rankParking } from "@/lib/gemini";
import { ParkingSpot } from "@/types/parking";

const DEFAULT_CENTER: [number, number] = [49.2827, -123.1207];
const DEFAULT_ZOOM = 13;

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "free" | "paid" | "ev">("all");
  const [recommendedId, setRecommendedId] = useState<string>();
  const [selectedSpotId, setSelectedSpotId] = useState<string>();
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(500); // meters
  const [hasSearched, setHasSearched] = useState(false);
  const [arrivalMinutes, setArrivalMinutes] = useState<number | null>(null);

  const handleSearch = async (query: string, searchRadius?: number) => {
    const currentRadius = searchRadius ?? radius;
    setLoading(true);
    setDestination(query);
    setRecommendedId(undefined);
    setSelectedSpotId(undefined);
    setError(null);
    setSpots([]);
    setHasSearched(true);
    
    try {
      console.log("Searching for:", query, "with radius:", currentRadius);
      
      const location = await geocodeAddress(query);
      console.log("Location result:", location);
      
      if (!location) {
        setError("Location not found. Try a more specific address.");
        setLoading(false);
        return;
      }

      const [lat, lng] = [location.lat, location.lng];
      console.log("Coordinates:", lat, lng);
      
      setDestinationCoords([lat, lng]);
      setCenter([lat, lng]);
      setZoom(16);

      // Fetch all parking data in parallel with radius
      console.log("Fetching parking data...");
      const [osmSpots, meters, evChargers] = await Promise.all([
        fetchParkingFromOSM(lat, lng, currentRadius),
        fetchParkingMeters(lat, lng, currentRadius),
        fetchEVChargers(lat, lng, currentRadius),
      ]);

      console.log("Results - OSM:", osmSpots.length, "Meters:", meters.length, "EV:", evChargers.length);

      let allSpots: ParkingSpot[] = [...osmSpots, ...meters, ...evChargers];

      if (allSpots.length === 0) {
        setError("No parking found nearby. Try a different location.");
        setLoading(false);
        return;
      }

      // Calculate straight-line distance and sort
      const spotsWithDistance = allSpots.map(spot => ({
        ...spot,
        straightDistance: Math.sqrt(
          Math.pow(spot.lat - lat, 2) + Math.pow(spot.lng - lng, 2)
        )
      }));
      
      spotsWithDistance.sort((a, b) => a.straightDistance - b.straightDistance);
      const topSpots = spotsWithDistance.slice(0, 15);

      // Batch walk time requests with small delays to avoid rate limiting
      console.log("Calculating walk times...");
      for (let i = 0; i < topSpots.length; i++) {
        const spot = topSpots[i];
        try {
          const walk = await getWalkTime(lat, lng, spot.lat, spot.lng);
          if (walk) {
            spot.walkTime = `${Math.round(walk.duration / 60)} min`;
            spot.walkDistance = walk.distance;
          }
        } catch (e) {
          console.warn("Walk time failed for spot:", spot.id);
        }
        
        // Small delay between requests
        if (i < topSpots.length - 1) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

      // Sort by walk time
      topSpots.sort((a, b) => (a.walkDistance || 999999) - (b.walkDistance || 999999));
      
      setSpots(topSpots);

      // Get AI recommendation
      console.log("Getting AI recommendation...");
      if (topSpots.length > 0) {
        try {
          const rec = await rankParking(query, topSpots, arrivalMinutes);
          if (rec && rec.best_index < topSpots.length) {
            const bestSpot = topSpots[rec.best_index];
            bestSpot.aiRecommended = true;
            bestSpot.aiReason = rec.reason;
            bestSpot.availabilityEstimate = rec.availability_estimate;
            setRecommendedId(bestSpot.id);
            setSpots([...topSpots]); // Trigger re-render
          }
        } catch (e) {
          console.warn("AI recommendation failed:", e);
        }
      }
      
      console.log("Search complete!");
    } catch (e) {
      console.error("Search error:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (spot: ParkingSpot) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=walking`;
    window.open(url, "_blank");
  };

  const handleSpotClick = (spot: ParkingSpot) => {
    setSelectedSpotId(spot.id);
    setCenter([spot.lat, spot.lng]);
    setZoom(18);
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    // Re-search with new radius if we have a destination
    if (destination) {
      handleSearch(destination, newRadius);
    }
  };

  const handleArrivalChange = (minutes: number | null) => {
    setArrivalMinutes(minutes);
    // Re-run AI recommendation if we have spots
    if (destination && spots.length > 0) {
      // Re-search to get updated AI recommendation
      handleSearch(destination, radius);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="flex justify-center items-center gap-3 flex-wrap">
          <SearchBar onSearch={handleSearch} loading={loading} />
          {hasSearched && (
            <>
              <RadiusControl radius={radius} onRadiusChange={handleRadiusChange} />
              <ArrivalTimeControl arrivalMinutes={arrivalMinutes} onArrivalChange={handleArrivalChange} />
            </>
          )}
        </div>
        {error && (
          <div className="flex justify-center mt-2">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm max-w-[560px]">
              {error}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col md:flex-row pt-20">
        <ResultsPanel
          spots={spots}
          loading={loading}
          recommendedId={recommendedId}
          onNavigate={handleNavigate}
          onSpotClick={handleSpotClick}
          filter={filter}
          onFilterChange={setFilter}
        />
        
        <div className="flex-1 h-[50vh] md:h-full">
          <Map
            center={center}
            zoom={zoom}
            spots={spots}
            recommendedId={recommendedId}
            selectedSpotId={selectedSpotId}
            onMarkerClick={handleSpotClick}
            destinationCoords={destinationCoords}
            filter={filter}
          />
        </div>
      </main>
    </div>
  );
}
