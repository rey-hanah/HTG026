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
  Footprints,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParkingCardProps {
  spot: ParkingSpot;
  isRecommended?: boolean;
  onNavigate: () => void;
  onClick?: () => void;
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
    label: "PARKING",
    icon: MapPin,
    colorVar: "var(--badge-unknown-text)",
    bgVar: "var(--badge-unknown-bg)",
  },
};

// OSM tile fallback image (no API key needed)
function getMapTileUrl(lat: number, lng: number): string {
  const zoom = 17;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      n
  );
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

function formatDistance(meters?: number): string {
  if (!meters) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

function getAppleMapsUrl(lat: number, lng: number): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w&t=m`;
}

// Apple logo as an inline SVG (official shape)
function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 814 1000"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.9-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.1-49.1 189.5-49.1 30.3 0 130.9 2.6 198.3 99.2z" />
      <path d="M549.8 148.7c26.9-32.2 45.3-76.8 45.3-121.3 0-6.1-.5-12.3-1.6-17.3-43 1.6-93.7 28.7-124.5 64.4-23.6 26.3-45.3 70.9-45.3 116.1 0 6.7 1.1 13.4 1.6 15.5 2.7.5 7 1.1 11.3 1.1 38.6 0 87.2-25.8 113.2-58.5z" />
    </svg>
  );
}

// Availability badge colours
function availabilityStyle(estimate?: ParkingSpot["availabilityEstimate"]) {
  if (estimate === "likely available") return "text-success";
  if (estimate === "might be busy") return "text-accent";
  return "text-destructive";
}

function availabilityLabel(estimate?: ParkingSpot["availabilityEstimate"]) {
  if (estimate === "likely available") return "Likely available";
  if (estimate === "might be busy") return "Might be busy";
  if (estimate === "probably full") return "Probably full";
  return "";
}

const detailVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: "0.75rem",
    transition: { duration: 0.25, ease: "easeOut" as const },
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

  // Navigation buttons (reused in both popup and full card)
  const NavButtons = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn("flex gap-2", compact ? "mt-3" : "pt-1")}>
      <a
        href={getGoogleMapsUrl(spot.lat, spot.lng)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex-1 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 hover:opacity-90",
          compact ? "py-1.5 text-[10px]" : "py-2 text-xs"
        )}
        style={{
          background: "var(--btn-primary-bg)",
          color: "var(--btn-primary-text)",
        }}
      >
        <Navigation className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        Google Maps
      </a>
      <a
        href={getAppleMapsUrl(spot.lat, spot.lng)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex-1 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 hover:opacity-90",
          compact ? "py-1.5 text-[10px]" : "py-2 text-xs"
        )}
        style={{
          background: "var(--btn-secondary-bg)",
          color: "var(--btn-secondary-text)",
          border: "1px solid var(--btn-secondary-border)",
        }}
      >
        <AppleLogo className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        Apple Maps
      </a>
    </div>
  );

  // ── Compact popup card for map markers ──────────────────────────────────
  if (isPopup) {
    return (
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "var(--card-bg)",
          border: isRecommended
            ? "2px solid var(--primary)"
            : "1px solid var(--card-border)",
          minWidth: 260,
        }}
      >
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: config.bgVar, color: config.colorVar }}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
            <div className="flex items-center gap-2">
              {spot.driveTime && (
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Car className="w-3 h-3" />
                  {spot.driveTime}
                </span>
              )}
              {spot.walkTime && (
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Footprints className="w-3 h-3" />
                  {spot.walkTime}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <h4
            className="text-sm font-semibold line-clamp-1 mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {spot.name}
          </h4>

          {/* Distance */}
          {spot.walkDistance && (
            <div
              className="flex items-center gap-1 text-xs mb-2"
              style={{ color: "var(--text-tertiary)" }}
            >
              <MapPin className="w-3 h-3" />
              {formatDistance(spot.walkDistance)} away
            </div>
          )}

          {/* Type-specific details */}
          <div
            className="space-y-1 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {spot.type === "paid" && (
              <>
                {spot.rateDetails?.daytime && (
                  <div className="flex items-start gap-2">
                    <DollarSign
                      className="w-3 h-3 shrink-0 mt-0.5"
                      style={{ color: "var(--badge-paid-text)" }}
                    />
                    <div>
                      <p>{spot.rateDetails.daytime}</p>
                      {spot.rateDetails.evening && (
                        <p>{spot.rateDetails.evening}</p>
                      )}
                    </div>
                  </div>
                )}
                {!spot.rateDetails && spot.rate && (
                  <div className="flex items-center gap-2">
                    <DollarSign
                      className="w-3 h-3 shrink-0"
                      style={{ color: "var(--badge-paid-text)" }}
                    />
                    <span>{spot.rate}</span>
                  </div>
                )}
              </>
            )}

            {spot.type === "free" && (
              <>
                {spot.timeLimitDetails?.daytime ? (
                  <div className="flex items-start gap-2">
                    <Timer
                      className="w-3 h-3 shrink-0 mt-0.5"
                      style={{ color: "var(--badge-free-text)" }}
                    />
                    <div>
                      <p>{spot.timeLimitDetails.daytime}</p>
                      {spot.timeLimitDetails.evening && (
                        <p>{spot.timeLimitDetails.evening}</p>
                      )}
                    </div>
                  </div>
                ) : spot.timeLimit ? (
                  <div className="flex items-center gap-2">
                    <Timer
                      className="w-3 h-3 shrink-0"
                      style={{ color: "var(--badge-free-text)" }}
                    />
                    <span>{spot.timeLimit}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Timer
                      className="w-3 h-3 shrink-0"
                      style={{ color: "var(--badge-free-text)" }}
                    />
                    <span>No posted time limit</span>
                  </div>
                )}
              </>
            )}

            {spot.type === "ev" && (
              <div className="flex items-center gap-2">
                <Zap
                  className="w-3 h-3 shrink-0"
                  style={{ color: "var(--badge-ev-text)" }}
                />
                <span>
                  {spot.chargers ?? 1} charger
                  {(spot.chargers ?? 1) > 1 ? "s" : ""}
                  {spot.operator ? ` · ${spot.operator}` : ""}
                  {spot.rate ? ` · ${spot.rate}` : ""}
                </span>
              </div>
            )}
          </div>

          {/* AI availability */}
          {spot.availabilityEstimate && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp
                className="w-3 h-3"
                style={{ color: "var(--primary)" }}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  availabilityStyle(spot.availabilityEstimate)
                )}
              >
                {availabilityLabel(spot.availabilityEstimate)}
              </span>
            </div>
          )}

          <NavButtons compact />
        </div>
      </div>
    );
  }

  // ── Full sidebar card with hover-expand ──────────────────────────────────
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full cursor-pointer"
      onClick={onClick}
    >
      <div
        className={cn(
          "overflow-hidden rounded-xl transition-all duration-300",
          isHovered ? "shadow-lg" : "shadow-sm"
        )}
        style={{
          background: "var(--card-bg)",
          border: isRecommended
            ? "2px solid var(--primary)"
            : "1px solid var(--card-border)",
        }}
      >
        {/* Card Image */}
        <div className="relative h-28 w-full overflow-hidden">
          <img
            src={getMapTileUrl(spot.lat, spot.lng)}
            alt={spot.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Type badge */}
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
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm"
                style={{ background: "var(--primary)", color: "#ffffff" }}
              >
                <Sparkles className="w-3 h-3" />
                AI PICK
              </span>
            </div>
          )}


        </div>

        <div className="p-3">
          {/* Name + drive time */}
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
            {/* Drive time from user location */}
            {spot.driveTime && (
              <span
                className="shrink-0 text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                style={{
                  background: "var(--control-bg)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--control-border)",
                }}
              >
                <Car className="w-3 h-3" />
                {spot.driveTime}
              </span>
            )}
          </div>

          {/* Expanded details on hover */}
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
                <div
                  className="pt-2 border-t space-y-2"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  {/* ── Walk distance & time ──────────────────────────── */}
                  {(spot.walkTime || spot.walkDistance) && (
                    <div className="flex items-center gap-3">
                      {spot.walkDistance && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--primary)" }} />
                          <span className="font-medium">{formatDistance(spot.walkDistance)}</span>
                        </div>
                      )}
                      {spot.walkTime && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <Footprints className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--primary)" }} />
                          <span className="font-medium">{spot.walkTime} walk</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Paid: rates ───────────────────────────────────── */}
                  {spot.type === "paid" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: "var(--badge-paid-text)" }}
                        />
                        <span
                          style={{ color: "var(--text-primary)" }}
                          className="font-medium"
                        >
                          Rates
                        </span>
                      </div>
                      <div
                        className="pl-5 space-y-0.5 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {spot.rateDetails?.daytime && (
                          <p>{spot.rateDetails.daytime}</p>
                        )}
                        {spot.rateDetails?.evening && (
                          <p>{spot.rateDetails.evening}</p>
                        )}
                        {spot.rateDetails?.weekend && (
                          <p>{spot.rateDetails.weekend}</p>
                        )}
                        {!spot.rateDetails && spot.rate && (
                          <p>{spot.rate}</p>
                        )}
                        {!spot.rateDetails && !spot.rate && (
                          <p>Check sign for rates</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Free: time limits ─────────────────────────────── */}
                  {spot.type === "free" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Timer
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: "var(--badge-free-text)" }}
                        />
                        <span
                          style={{ color: "var(--text-primary)" }}
                          className="font-medium"
                        >
                          Time Limit
                        </span>
                      </div>
                      <div
                        className="pl-5 space-y-0.5 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {spot.timeLimitDetails?.daytime && (
                          <p>{spot.timeLimitDetails.daytime}</p>
                        )}
                        {spot.timeLimitDetails?.evening && (
                          <p>{spot.timeLimitDetails.evening}</p>
                        )}
                        {spot.timeLimitDetails?.weekend && (
                          <p>{spot.timeLimitDetails.weekend}</p>
                        )}
                        {!spot.timeLimitDetails && spot.timeLimit && (
                          <p>{spot.timeLimit}</p>
                        )}
                        {!spot.timeLimitDetails && !spot.timeLimit && (
                          <p>No posted time limit</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── EV charging ───────────────────────────────────── */}
                  {spot.type === "ev" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Zap
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: "var(--badge-ev-text)" }}
                        />
                        <span
                          style={{ color: "var(--text-primary)" }}
                          className="font-medium"
                        >
                          EV Charging
                        </span>
                      </div>
                      <div
                        className="pl-5 space-y-0.5 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <p>
                          {spot.chargers ?? 1} charger
                          {(spot.chargers ?? 1) > 1 ? "s" : ""} available
                        </p>
                        {spot.operator && <p>Operated by {spot.operator}</p>}
                        {spot.rate && <p>{spot.rate}</p>}
                      </div>
                    </div>
                  )}

                  {/* ── AI availability prediction ────────────────────── */}
                  {spot.availabilityEstimate && (
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: "var(--primary)" }}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          availabilityStyle(spot.availabilityEstimate)
                        )}
                      >
                        {availabilityLabel(spot.availabilityEstimate)}
                      </span>
                    </div>
                  )}

                  {/* ── AI reason (recommended spot only) ─────────────── */}
                  {isRecommended && spot.aiReason && (
                    <p
                      className="text-xs italic pl-0.5"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      "{spot.aiReason}"
                    </p>
                  )}

                  {/* ── Open in Maps buttons ──────────────────────────── */}
                  <NavButtons />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
