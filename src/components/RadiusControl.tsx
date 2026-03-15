"use client";

import { Slider } from "@/components/ui/slider";

interface RadiusControlProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
}

const MIN_RADIUS = 200;
const MAX_RADIUS = 1500;

const MARKS = [
  { value: 300, label: "300m" },
  { value: 500, label: "500m" },
  { value: 750, label: "750m" },
  { value: 1000, label: "1km" },
  { value: 1500, label: "1.5km" },
];

function formatRadius(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

export default function RadiusControl({
  radius,
  onRadiusChange,
}: RadiusControlProps) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{
        background: "var(--control-bg)",
        border: "1px solid var(--control-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-tertiary)" }}
        >
          Search Radius
        </span>
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--primary)" }}
        >
          {formatRadius(radius)}
        </span>
      </div>
      
      <div className="relative">
        <Slider
          value={[radius]}
          onValueChange={(value) => {
            const values = Array.isArray(value) ? value : [value];
            onRadiusChange(values[0]);
          }}
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={50}
          className="w-full"
        />
        
        {/* Tick marks */}
        <div className="flex justify-between mt-2 px-1">
          {MARKS.map((mark) => (
            <button
              key={mark.value}
              onClick={() => onRadiusChange(mark.value)}
              className="text-[10px] transition-colors hover:opacity-80"
              style={{
                color: radius === mark.value 
                  ? "var(--primary)" 
                  : "var(--text-tertiary)",
                fontWeight: radius === mark.value ? 600 : 400,
              }}
            >
              {mark.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
