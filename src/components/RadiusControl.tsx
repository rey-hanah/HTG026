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

export default function RadiusControl({
  radius,
  onRadiusChange,
}: RadiusControlProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2"
      style={{
        background: "var(--control-bg)",
        border: "1px solid var(--control-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span
        className="text-xs font-medium"
        style={{ color: "var(--text-tertiary)" }}
      >
        Radius:
      </span>
      <div className="flex gap-1">
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRadiusChange(opt.value)}
            className="px-2 py-1 text-xs font-medium rounded transition-colors"
            style={{
              background:
                radius === opt.value
                  ? "var(--filter-active-bg)"
                  : "var(--filter-bg)",
              color:
                radius === opt.value
                  ? "var(--filter-active-text)"
                  : "var(--filter-text)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
