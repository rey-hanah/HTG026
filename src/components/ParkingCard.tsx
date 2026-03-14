"use client";

import { ParkingSpot } from "@/types/parking";
import { MapPin, Clock, Zap, Car } from "lucide-react";

interface ParkingCardProps {
  spot: ParkingSpot;
  isRecommended?: boolean;
  onNavigate: () => void;
  onClick?: () => void;
}

const TYPE_CONFIG = {
  free: { label: "Free", bg: "bg-green-100", text: "text-green-700", icon: Car },
  paid: { label: "Paid", bg: "bg-amber-100", text: "text-amber-700", icon: MapPin },
  ev: { label: "EV", bg: "bg-blue-100", text: "text-blue-700", icon: Zap },
  unknown: { label: "?", bg: "bg-gray-100", text: "text-gray-600", icon: MapPin },
};

export default function ParkingCard({ spot, isRecommended, onNavigate, onClick }: ParkingCardProps) {
  const config = TYPE_CONFIG[spot.type] || TYPE_CONFIG.unknown;
  const Icon = config.icon;

  return (
    <div 
      onClick={onClick}
      className={`
        p-4 rounded-xl border transition-all cursor-pointer
        ${isRecommended 
          ? "bg-purple-50 border-purple-400 border-2" 
          : "bg-white border-gray-200 hover:border-gray-300"
        }
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
        {spot.walkTime && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {spot.walkTime} walk
          </span>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{spot.name}</h3>
      
      <div className="flex gap-3 text-sm text-gray-600 mb-3">
        {spot.rate && <span className="font-medium">{spot.rate}</span>}
        {spot.timeLimit && <span>• {spot.timeLimit}</span>}
        {spot.chargers && <span>• {spot.chargers} chargers</span>}
      </div>

      {isRecommended && spot.aiReason && (
        <p className="text-sm text-purple-700 mb-3 italic">"{spot.aiReason}"</p>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onNavigate(); }}
        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
      >
        Navigate
      </button>
    </div>
  );
}
