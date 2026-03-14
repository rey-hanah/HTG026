"use client";

import { useState } from "react";
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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [driveTimeMinutes, setDriveTimeMinutes] = useState<number | null>(null);

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
  ) => {
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

      // Fetch all parking data in parallel with radius
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
        setError("No parking found nearby. Try a different location.");
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
      const topSpots = spotsWithDistance.slice(0, 8);

      // Batch fetch walk times in parallel
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

      // Sort by walk time
      topSpots.sort(
        (a, b) => (a.walkDistance || 999999) - (b.walkDistance || 999999)
      );

      setSpots(topSpots);

      // Calculate parking density from heatmap data
      const parkingDensity = {
        totalSpots: allSpots.length,
        freeSpots: allSpots.filter((s) => s.type === "free").length,
        paidSpots: allSpots.filter((s) => s.type === "paid").length,
        evSpots: allSpots.filter((s) => s.type === "ev").length,
      };

      // Get AI recommendation
      console.log("Getting AI recommendation...");
      if (topSpots.length > 0) {
        try {
          const rec = await rankParking(
            query,
            topSpots,
            driveTimeMinutes,
            parkingDensity
          );
          if (rec && rec.best_index < topSpots.length) {
            const bestSpot = topSpots[rec.best_index];
            bestSpot.aiRecommended = true;
            bestSpot.aiReason = rec.reason;
            bestSpot.availabilityEstimate = rec.availability_estimate;
            setRecommendedId(bestSpot.id);
            setSpots([...topSpots]);
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
      {/* Sidebar with all controls + results */}
      <ResultsPanel
        spots={spots}
        loading={loading}
        recommendedId={recommendedId}
        onNavigate={handleNavigate}
        onSpotClick={handleSpotClick}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Map */}
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
    </div>
  );
}
