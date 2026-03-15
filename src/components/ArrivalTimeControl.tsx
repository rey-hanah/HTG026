"use client";

import { Clock, Car } from "lucide-react";

interface ArrivalTimeProps {
  arrivalMinutes: number | null;
  onArrivalChange: (minutes: number | null) => void;
  driveTimeMinutes?: number | null;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ArrivalTimeControl({
  driveTimeMinutes,
}: ArrivalTimeProps) {
  if (!driveTimeMinutes) return null;

  const now = new Date();
  const departAt = new Date(now.getTime() + 2 * 60000); // leave ~2 min buffer
  const arriveBy = new Date(now.getTime() + driveTimeMinutes * 60000);

  return (
    <div
      className="rounded-lg px-3 py-2 flex items-center gap-3"
      style={{
        background: "var(--control-bg)",
        border: "1px solid var(--control-border)",
      }}
    >
      <Clock
        className="w-3.5 h-3.5 shrink-0"
        style={{ color: "var(--text-tertiary)" }}
      />
      <div className="flex items-center gap-3 text-xs">
        <div>
          <span style={{ color: "var(--text-tertiary)" }}>Depart </span>
          <span
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {formatTime(departAt)}
          </span>
        </div>
        <Car className="w-3 h-3" style={{ color: "var(--text-tertiary)" }} />
        <div>
          <span style={{ color: "var(--text-tertiary)" }}>Arrive </span>
          <span
            className="font-semibold"
            style={{ color: "var(--primary)" }}
          >
            ~{formatTime(arriveBy)}
          </span>
        </div>
      </div>
    </div>
  );
}
