"use client";

import { Clock } from "lucide-react";
import { useState } from "react";

interface ArrivalTimeProps {
  arrivalMinutes: number | null;
  onArrivalChange: (minutes: number | null) => void;
}

type Mode = "depart" | "arrive";

function toLocalDatetimeString(date: Date): string {
  // Returns a value compatible with <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ArrivalTimeControl({
  arrivalMinutes,
  onArrivalChange,
}: ArrivalTimeProps) {
  const [mode, setMode] = useState<Mode>("depart");

  // Default datetime = now (for "depart now") or now + 30 min (for "arrive by")
  const now = new Date();
  const defaultDepart = toLocalDatetimeString(now);
  const defaultArrive = toLocalDatetimeString(new Date(now.getTime() + 30 * 60000));

  const [datetimeValue, setDatetimeValue] = useState<string>(
    mode === "depart" ? defaultDepart : defaultArrive
  );

  const handleModeChange = (m: Mode) => {
    setMode(m);
    const base = new Date();
    setDatetimeValue(
      toLocalDatetimeString(
        m === "depart" ? base : new Date(base.getTime() + 30 * 60000)
      )
    );
    // "Now" / reset
    onArrivalChange(null);
  };

  const handleDatetimeChange = (value: string) => {
    setDatetimeValue(value);
    const selected = new Date(value);
    const diffMin = Math.round((selected.getTime() - Date.now()) / 60000);
    // Only pass positive offsets; if in the past treat as "now"
    onArrivalChange(diffMin > 0 ? diffMin : null);
  };

  return (
    <div
      className="rounded-lg px-3 py-2 space-y-2"
      style={{
        background: "var(--control-bg)",
        border: "1px solid var(--control-border)",
      }}
    >
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
        <div className="flex gap-1">
          {(["depart", "arrive"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className="px-2.5 py-1 text-xs font-medium rounded transition-colors"
              style={{
                background:
                  mode === m ? "var(--filter-active-bg)" : "var(--filter-bg)",
                color:
                  mode === m
                    ? "var(--filter-active-text)"
                    : "var(--filter-text)",
              }}
            >
              {m === "depart" ? "Depart at" : "Arrive by"}
            </button>
          ))}
        </div>
      </div>

      {/* Datetime picker */}
      <input
        type="datetime-local"
        value={datetimeValue}
        onChange={(e) => handleDatetimeChange(e.target.value)}
        min={toLocalDatetimeString(now)}
        className="w-full text-xs rounded px-2 py-1 focus:outline-none"
        style={{
          background: "var(--filter-bg)",
          color: "var(--text-primary)",
          border: "1px solid var(--control-border)",
          colorScheme: "dark",
        }}
      />
    </div>
  );
}
