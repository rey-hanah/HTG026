"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParkingSpot } from "@/types/parking";
import {
  MapPin,
  Clock,
  Zap,
  Car,
  DollarSign,
  Timer,
  Navigation,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParkingCardProps {
  spot: ParkingSpot;
  isRecommended?: boolean;
  onNavigate: () => void;
  onClick?: () => void;
  /** If true, renders the compact static version for map popups (no animation) */
  isPopup?: boolean;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; colorVar: string; bgVar: string }
> = {
  free: {
    label: "FREE",
    icon: Car,
    colorVar: "var(--badge-free-text)",
    bgVar: "var(--badge-free-bg)",
  },
  paid: {
    label: "PAID",
    icon: DollarSign,
    colorVar: "var(--badge-paid-text)",
    bgVar: "var(--badge-paid-bg)",
  },
  ev: {
    label: "EV",
    icon: Zap,
    colorVar: "var(--badge-ev-text)",
    bgVar: "var(--badge-ev-bg)",
  },
  unknown: {
    label: "UNKNOWN",
    icon: MapPin,
    colorVar: "var(--badge-unknown-text)",
    bgVar: "var(--badge-unknown-bg)",
  },
};

// Generate a static map tile image URL from the spot's real coordinates
// Uses OpenStreetMap tile server: tile URLs follow the pattern /zoom/x/y.png
function getStaticMapUrl(lat: number, lng: number, zoom = 16): string {
  // Convert lat/lng to tile coordinates
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

function formatDistance(meters?: number): string {
  if (!meters) return "";
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

const detailVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: "0.75rem",
    transition: { duration: 0.3, ease: "easeInOut" as const },
  },
};

export default function ParkingCard({
  spot,
  isRecommended,
  onNavigate,
  onClick,
  isPopup = false,
}: ParkingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = TYPE_CONFIG[spot.type] || TYPE_CONFIG.unknown;
  const Icon = config.icon;

  // Static popup card for map markers (no animation)
  if (isPopup) {
    return (
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "var(--card-bg)",
          border: `1px solid var(--card-border)`,
          minWidth: 220,
        }}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: config.bgVar, color: config.colorVar }}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
            {spot.walkTime && (
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <Clock className="w-3 h-3" />
                {spot.walkTime}
              </span>
            )}
          </div>
          <h4
            className="text-sm font-semibold line-clamp-1"
            style={{ color: "var(--text-primary)" }}
          >
            {spot.name}
          </h4>
          {spot.rate && (
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {spot.rate}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full sidebar card with hover-expand animation
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="w-full cursor-pointer"
      onClick={onClick}
    >
      <div
        className={cn(
          "overflow-hidden rounded-xl transition-shadow duration-300",
          isHovered ? "shadow-xl" : "shadow-sm"
        )}
        style={{
          background: isRecommended
            ? "var(--recommended-bg)"
            : "var(--card-bg)",
          border: isRecommended
            ? `2px solid var(--recommended-border)`
            : `1px solid var(--card-border)`,
        }}
      >
        {/* Card Image */}
        <div className="relative h-28 w-full overflow-hidden">
          <img
            src={getStaticMapUrl(spot.lat, spot.lng)}
            alt={spot.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Type badge overlaid on image */}
          <div className="absolute top-2 left-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm"
              style={{ background: config.bgVar, color: config.colorVar }}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
          </div>

          {/* AI recommended badge */}
          {isRecommended && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm" style={{ background: "rgba(212, 145, 92, 0.9)", color: "#ffffff" }}>
                <Sparkles className="w-3 h-3" />
                AI PICK
              </span>
            </div>
          )}

          {/* Walk time bottom-right */}
          {spot.walkTime && (
            <div className="absolute bottom-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm">
                <Clock className="w-3 h-3" />
                {spot.walkTime} walk
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          {/* Always visible: name + distance */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="text-sm font-semibold line-clamp-1"
                style={{ color: "var(--text-primary)" }}
              >
                {spot.name}
              </h3>
              {spot.address && (
                <p
                  className="text-xs line-clamp-1 mt-0.5"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {spot.address}
                </p>
              )}
            </div>
            {spot.walkDistance && (
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatDistance(spot.walkDistance)}
              </span>
            )}
          </div>

          {/* Animated detail section on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                key="details"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={detailVariants}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {spot.type === "paid" && spot.rate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                      <span>{spot.rate}</span>
                    </div>
                  )}

                  {spot.type === "free" && spot.timeLimit && (
                    <div className="flex items-center gap-2">
                      <Timer className="w-3 h-3 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                      <span>Max stay: {spot.timeLimit}</span>
                    </div>
                  )}

                  {spot.chargers && spot.type === "ev" && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                      <span>
                        {spot.chargers} charger{spot.chargers > 1 ? "s" : ""}
                        {spot.operator ? ` (${spot.operator})` : ""}
                      </span>
                    </div>
                  )}

                  {spot.source === "vancouver" && (
                    <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      Vancouver Open Data
                    </span>
                  )}
                </div>

                {/* AI recommendation reason */}
                {isRecommended && spot.aiReason && (
                  <div className="mt-2">
                    <p className="text-xs italic" style={{ color: "var(--ai-text)" }}>
                      &ldquo;{spot.aiReason}&rdquo;
                    </p>
                    {spot.availabilityEstimate && (
                      <span
                        className={cn(
                          "text-[10px] font-semibold mt-1 inline-block",
                          spot.availabilityEstimate === "likely available"
                            ? "text-green-500"
                            : spot.availabilityEstimate === "might be busy"
                            ? "text-amber-500"
                            : "text-red-500"
                        )}
                      >
                        {spot.availabilityEstimate === "likely available"
                          ? "Likely available"
                          : spot.availabilityEstimate === "might be busy"
                          ? "Might be busy"
                          : "Probably full"}
                      </span>
                    )}
                  </div>
                )}

                {/* Navigate button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate();
                  }}
                  className="w-full mt-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  style={{
                    background: "var(--btn-primary-bg)",
                    color: "var(--btn-primary-text)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--btn-primary-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "var(--btn-primary-bg)")
                  }
                >
                  <Navigation className="w-3 h-3" />
                  Open in Google Maps
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
