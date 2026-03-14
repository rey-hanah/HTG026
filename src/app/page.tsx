"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import ResultsPanel from "@/components/ResultsPanel";
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
  const [destination, setDestination] = useState("");

  const handleSearch = async (query: string) => {
    setLoading(true);
    setDestination(query);
    setRecommendedId(undefined);
    
    try {
      const location = await geocodeAddress(query);
      if (!location) {
        console.error("Location not found");
        setLoading(false);
        return;
      }

      const [lat, lng] = [location.lat, location.lng];
      setCenter([lat, lng]);
      setZoom(15);

      const [osmSpots, meters, evChargers] = await Promise.all([
        fetchParkingFromOSM(lat, lng),
        fetchParkingMeters(lat, lng),
        fetchEVChargers(lat, lng),
      ]);

      let allSpots: ParkingSpot[] = [...osmSpots, ...meters, ...evChargers];

      for (const spot of allSpots) {
        const walk = await getWalkTime(lat, lng, spot.lat, spot.lng);
        if (walk) {
          spot.walkTime = `${Math.round(walk.duration / 60)} min`;
          spot.walkDistance = walk.distance;
        }
      }

      setSpots(allSpots);

      if (allSpots.length > 0) {
        const rec = await rankParking(query, allSpots);
        if (rec && rec.best_index < allSpots.length) {
          const bestSpot = allSpots[rec.best_index];
          bestSpot.aiRecommended = true;
          bestSpot.aiReason = rec.reason;
          bestSpot.availabilityEstimate = rec.availability_estimate;
          setRecommendedId(bestSpot.id);
        }
      }
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (spot: ParkingSpot) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=walking`;
    window.open(url, "_blank");
  };

  const handleSpotClick = (spot: ParkingSpot) => {
    setCenter([spot.lat, spot.lng]);
    setZoom(16);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="flex justify-center">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
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
            onMarkerClick={handleSpotClick}
          />
        </div>
      </main>
    </div>
  );
}
