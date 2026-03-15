"use client";

import { Clock, Car, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface ArrivalTimeProps {
  arrivalMinutes: number | null;
  onArrivalChange: (minutes: number | null) => void;
  driveTimeMinutes?: number | null;
}

type Mode = "depart" | "arrive";

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ArrivalTimeControl({
  arrivalMinutes,
  onArrivalChange,
  driveTimeMinutes,
}: ArrivalTimeProps) {
  const [mode, setMode] = useState<Mode>("depart");

  const now = new Date();
  const defaultDepart = toLocalDatetimeString(now);
  const defaultArrive = toLocalDatetimeString(
    new Date(now.getTime() + (driveTimeMinutes ?? 30) * 60000)
  );

  const [datetimeValue, setDatetimeValue] = useState<string>(
    mode === "depart" ? defaultDepart : defaultArrive
  );

  // Update default value when driveTimeMinutes changes
  useEffect(() => {
    if (mode === "arrive" && driveTimeMinutes) {
      const base = new Date();
      setDatetimeValue(
        toLocalDatetimeString(new Date(base.getTime() + driveTimeMinutes * 60000))
      );
    }
  }, [driveTimeMinutes, mode]);

  const handleModeChange = (m: Mode) => {
    setMode(m);
    const base = new Date();
    if (m === "depart") {
      setDatetimeValue(toLocalDatetimeString(base));
    } else {
      setDatetimeValue(
        toLocalDatetimeString(
          new Date(base.getTime() + (driveTimeMinutes ?? 30) * 60000)
        )
      );
    }
    onArrivalChange(null);
  };

  const handleDatetimeChange = (value: string) => {
    setDatetimeValue(value);
    const selected = new Date(value);
    const diffMin = Math.round((selected.getTime() - Date.now()) / 60000);
    onArrivalChange(diffMin > 0 ? diffMin : null);
  };

  // Calculate the estimated arrival/departure time based on drive time
  const selectedDate = new Date(datetimeValue);
  const estimatedArrival =
    mode === "depart" && driveTimeMinutes
      ? new Date(selectedDate.getTime() + driveTimeMinutes * 60000)
      : null;
  const estimatedDeparture =
    mode === "arrive" && driveTimeMinutes
      ? new Date(selectedDate.getTime() - driveTimeMinutes * 60000)
      : null;

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
        <Clock
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: "var(--text-tertiary)" }}
        />
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

      {/* Drive time estimate */}
      {driveTimeMinutes && (
        <div
          className="flex items-center gap-2 text-[11px] pt-0.5"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Car className="w-3 h-3 shrink-0" />
          <span>
            {driveTimeMinutes} min drive
          </span>
          {estimatedArrival && (
            <>
              <ArrowRight className="w-3 h-3 shrink-0" />
              <span>
                Arrive ~
                <span style={{ color: "var(--primary)" }} className="font-medium">
                  {formatTime(estimatedArrival)}
                </span>
              </span>
            </>
          )}
          {estimatedDeparture && (
            <>
              <ArrowRight className="w-3 h-3 shrink-0" />
              <span>
                Leave by ~
                <span style={{ color: "var(--primary)" }} className="font-medium">
                  {formatTime(estimatedDeparture)}
                </span>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
