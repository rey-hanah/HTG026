"use client";

import { ParkingSpot } from "@/types/parking";
import ParkingCard from "./ParkingCard";
import { Sparkles } from "lucide-react";

interface ResultsPanelProps {
  spots: ParkingSpot[];
  loading?: boolean;
  recommendedId?: string;
  onNavigate: (spot: ParkingSpot) => void;
  onSpotClick: (spot: ParkingSpot) => void;
  filter: "all" | "free" | "paid" | "ev";
  onFilterChange: (filter: "all" | "free" | "paid" | "ev") => void;
}

export default function ResultsPanel({
  spots,
  loading,
  recommendedId,
  onNavigate,
  onSpotClick,
  filter,
  onFilterChange,
}: ResultsPanelProps) {
  const filters: { value: "all" | "free" | "paid" | "ev"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
    { value: "ev", label: "EV" },
  ];

  const filteredSpots = spots.filter(s => filter === "all" || s.type === filter);
  const recommended = filteredSpots.find(s => s.id === recommendedId);
  const others = filteredSpots.filter(s => s.id !== recommendedId);

  if (loading) {
    return (
      <div className="w-full md:w-[380px] h-full bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[380px] h-full bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {recommended && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                AI Pick
              </span>
            </div>
            <ParkingCard
              spot={recommended}
              isRecommended
              onNavigate={() => onNavigate(recommended)}
              onClick={() => onSpotClick(recommended)}
            />
            <div className="border-t border-gray-200 my-4" />
          </>
        )}

        {others.map(spot => (
          <ParkingCard
            key={spot.id}
            spot={spot}
            onNavigate={() => onNavigate(spot)}
            onClick={() => onSpotClick(spot)}
          />
        ))}

        {filteredSpots.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No parking spots found. Try a different filter.
          </div>
        )}
      </div>
    </div>
  );
}
