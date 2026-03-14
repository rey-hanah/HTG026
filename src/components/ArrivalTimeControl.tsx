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

export default function ArrivalTimeControl({
  arrivalMinutes,
  onArrivalChange,
}: ArrivalTimeProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2"
      style={{
        background: "var(--control-bg)",
        border: "1px solid var(--control-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Clock className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
      <span
        className="text-xs font-medium"
        style={{ color: "var(--text-tertiary)" }}
      >
        Arrive:
      </span>
      <div className="flex gap-1">
        {ARRIVAL_OPTIONS.map((opt) => (
          <button
            key={opt.value ?? "now"}
            onClick={() => onArrivalChange(opt.value)}
            className="px-2 py-1 text-xs font-medium rounded transition-colors"
            style={{
              background:
                arrivalMinutes === opt.value
                  ? "var(--filter-active-bg)"
                  : "var(--filter-bg)",
              color:
                arrivalMinutes === opt.value
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
