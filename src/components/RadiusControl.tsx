"use client";

interface RadiusControlProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
}

const RADIUS_OPTIONS = [
  { value: 300, label: "300m" },
  { value: 500, label: "500m" },
  { value: 750, label: "750m" },
  { value: 1000, label: "1km" },
];

export default function RadiusControl({ radius, onRadiusChange }: RadiusControlProps) {
  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200">
      <span className="text-xs text-gray-500 font-medium">Radius:</span>
      <div className="flex gap-1">
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRadiusChange(opt.value)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              radius === opt.value
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
