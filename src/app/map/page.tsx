"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import ResultsPanel from "@/components/ResultsPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { geocodeAddress } from "@/lib/nominatim";
import { fetchParkingFromOSM } from "@/lib/overpass";
import { fetchParkingMeters } from "@/lib/vancouver";
import { fetchEVChargers } from "@/lib/ev";
import { getWalkTimesBatch } from "@/lib/osrm";
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
  const [destinationCoords, setDestinationCoords] = useState<
    [number, number] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(500);
  const [hasSearched, setHasSearched] = useState(false);
  const [arrivalMinutes, setArrivalMinutes] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [driveTimeMinutes, setDriveTimeMinutes] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Auto-detect user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]);
          setZoom(14);
          setIsLocating(false);
        },
        () => {
          // Silently fail - use default center
          setIsLocating(false);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    }
  }, []);

  const handleUserLocationSelect = async (lat: number, lng: number) => {
    setUserLocation([lat, lng]);
    setCenter([lat, lng]);
    setZoom(14);
  };

  const getDriveTime = async (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ): Promise<number | null> => {
    try {
      const res = await fetch(
        `/api/drive?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`
      );
      const data = await res.json();
      if (data.duration) {
        return Math.round(data.duration / 60);
      }
    } catch (e) {
      console.warn("Drive time failed:", e);
    }
    return null;
  };

  const handleSearch = useCallback(async (query: string, searchRadius?: number) => {
    const currentRadius = searchRadius ?? radius;
    setLoading(true);
    setDestination(query);
    setRecommendedId(undefined);
    setSelectedSpotId(undefined);
    setError(null);
    setSpots([]);
    setHasSearched(true);
    setDriveTimeMinutes(null);

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

      // Calculate driving time from user location to destination
      let travelMinutes: number | null = null;
      if (userLocation) {
        console.log("Calculating drive time from user location...");
        travelMinutes = await getDriveTime(
          userLocation[0],
          userLocation[1],
          lat,
          lng
        );
        if (travelMinutes) {
          setDriveTimeMinutes(travelMinutes);
          console.log("Drive time:", travelMinutes, "minutes");
        }
      }

      // Fetch all parking data in parallel
      console.log("Fetching parking data...");
      const [osmSpots, meters, evChargers] = await Promise.all([
        fetchParkingFromOSM(lat, lng, currentRadius),
        fetchParkingMeters(lat, lng, currentRadius),
        fetchEVChargers(lat, lng, currentRadius),
      ]);

      console.log(
        "Results - OSM:",
        osmSpots.length,
        "Meters:",
        meters.length,
        "EV:",
        evChargers.length
      );

      const allSpots: ParkingSpot[] = [...osmSpots, ...meters, ...evChargers];

      if (allSpots.length === 0) {
        setError("No parking found nearby. Try increasing the radius or a different location.");
        setLoading(false);
        return;
      }

      // Calculate straight-line distance and sort
      const spotsWithDistance = allSpots.map((spot) => ({
        ...spot,
        straightDistance: Math.sqrt(
          Math.pow(spot.lat - lat, 2) + Math.pow(spot.lng - lng, 2)
        ),
      }));

      spotsWithDistance.sort((a, b) => a.straightDistance - b.straightDistance);
      const topSpots = spotsWithDistance.slice(0, 10);

      // Batch fetch walk times
      console.log("Calculating walk times...");
      const walkResults = await getWalkTimesBatch(
        lat,
        lng,
        topSpots.map((s) => ({ lat: s.lat, lng: s.lng, id: s.id }))
      );

      topSpots.forEach((spot) => {
        const walk = walkResults.get(spot.id);
        if (walk) {
          spot.walkTime = `${Math.round(walk.duration / 60)} min`;
          spot.walkDistance = walk.distance;
          spot.walkGeometry = walk.geometry;
        }
      });

      // Sort by walk distance
      topSpots.sort(
        (a, b) => (a.walkDistance || 999999) - (b.walkDistance || 999999)
      );

      // Fetch drive time from user location to each parking spot (in parallel)
      if (userLocation) {
        const drivePromises = topSpots.map(async (spot) => {
          try {
            const res = await fetch(
              `/api/drive?fromLat=${userLocation[0]}&fromLng=${userLocation[1]}&toLat=${spot.lat}&toLng=${spot.lng}`
            );
            const d = await res.json();
            if (d.duration) {
              spot.driveTime = `${Math.round(d.duration / 60)} min`;
            }
          } catch {
            // silently skip
          }
        });
        await Promise.all(drivePromises);
      }

      // Calculate parking density for AI
      const parkingDensity = {
        totalSpots: allSpots.length,
        freeSpots: allSpots.filter((s) => s.type === "free").length,
        paidSpots: allSpots.filter((s) => s.type === "paid").length,
        evSpots: allSpots.filter((s) => s.type === "ev").length,
      };

      // Get AI recommendation with drive time context
      console.log("Getting AI recommendation...");
      if (topSpots.length > 0) {
        try {
          const rec = await rankParking(
            query,
            topSpots,
            travelMinutes || driveTimeMinutes,
            parkingDensity,
            arrivalMinutes
          );
          if (rec && rec.best_index < topSpots.length) {
            const bestSpot = topSpots[rec.best_index];
            bestSpot.aiRecommended = true;
            bestSpot.aiReason = rec.reason;
            bestSpot.availabilityEstimate = rec.availability_estimate;
            
            // Also add availability estimates to other spots based on type/time
            topSpots.forEach((spot, i) => {
              if (i !== rec.best_index && !spot.availabilityEstimate) {
                // Simple heuristic based on spot type and time
                const hour = new Date().getHours();
                const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
                const isLunchTime = hour >= 11 && hour <= 13;
                
                if (spot.type === "free") {
                  spot.availabilityEstimate = isRushHour || isLunchTime ? "might be busy" : "likely available";
                } else if (spot.type === "paid") {
                  spot.availabilityEstimate = isRushHour ? "might be busy" : "likely available";
                } else {
                  spot.availabilityEstimate = "likely available";
                }
              }
            });
            
            setRecommendedId(bestSpot.id);
          }
        } catch (e) {
          console.warn("AI recommendation failed:", e);
        }
      }

      // Move recommended spot to top
      const sortedSpots = [...topSpots].sort((a, b) => {
        if (a.aiRecommended) return -1;
        if (b.aiRecommended) return 1;
        return 0;
      });

      setSpots(sortedSpots);
      console.log("Search complete!");
    } catch (e) {
      console.error("Search error:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [radius, userLocation, driveTimeMinutes]);

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
    if (destination) {
      handleSearch(destination, newRadius);
    }
  };

  const handleArrivalChange = (minutes: number | null) => {
    setArrivalMinutes(minutes);
    if (destination && spots.length > 0) {
      handleSearch(destination, radius);
    }
  };

  return (
    <div
      className="h-screen flex flex-col md:flex-row"
      style={{ background: "var(--background)" }}
    >
      <ResultsPanel
        spots={spots}
        loading={loading}
        recommendedId={recommendedId}
        onNavigate={handleNavigate}
        onSpotClick={handleSpotClick}
        filter={filter}
        onFilterChange={setFilter}
        onSearch={handleSearch}
        onLocationSelect={handleUserLocationSelect}
        searchLoading={loading}
        hasSearched={hasSearched}
        radius={radius}
        onRadiusChange={handleRadiusChange}
        arrivalMinutes={arrivalMinutes}
        onArrivalChange={handleArrivalChange}
        driveTimeMinutes={driveTimeMinutes}
        error={error}
        headerActions={<ThemeToggle />}
      />

      <div className="flex-1 h-[50vh] md:h-full relative">
        {isLocating && (
          <div 
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-3 py-2 rounded-lg text-xs font-medium"
            style={{
              background: "var(--control-bg)",
              color: "var(--text-secondary)",
              border: "1px solid var(--control-border)",
              backdropFilter: "blur(8px)",
            }}
          >
            Detecting your location...
          </div>
        )}
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
    </div>
  );
}
