"use client";

import { Clock } from "lucide-react";

interface ArrivalTimeProps {
  arrivalMinutes: number | null;
  onArrivalChange: (minutes: number | null) => void;
}

const ARRIVAL_OPTIONS = [
  { value: null, label: "Now" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hr" },
];

export default function ArrivalTimeControl({ arrivalMinutes, onArrivalChange }: ArrivalTimeProps) {
  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200">
      <Clock className="w-4 h-4 text-gray-500" />
      <span className="text-xs text-gray-500 font-medium">Arrive:</span>
      <div className="flex gap-1">
        {ARRIVAL_OPTIONS.map((opt) => (
          <button
            key={opt.value ?? "now"}
            onClick={() => onArrivalChange(opt.value)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              arrivalMinutes === opt.value
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
