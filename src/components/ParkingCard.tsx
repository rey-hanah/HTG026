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
  ExternalLink,
  Apple,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParkingCardProps {
  spot: ParkingSpot;
  isRecommended?: boolean;
  onNavigate: () => void;
  onAppleMapsNavigate?: () => void;
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

// Generate Google Street View Static API URL
function getStreetViewUrl(lat: number, lng: number): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    return `https://maps.googleapis.com/maps/api/streetview?size=400x200&location=${lat},${lng}&fov=90&heading=235&pitch=10&key=${apiKey}`;
  }
  // Fallback to OSM tile
  const zoom = 17;
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

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

function getAppleMapsUrl(lat: number, lng: number, name: string): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w&t=m`;
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

  // Compact popup card for map markers
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
          {/* Header with type and walk time */}
          <div className="flex items-center justify-between mb-2">
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
                <Footprints className="w-3 h-3" />
                {spot.walkTime}
              </span>
            )}
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
            <div className="flex items-center gap-1 text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>
              <MapPin className="w-3 h-3" />
              {formatDistance(spot.walkDistance)} away
            </div>
          )}

          {/* Details based on type */}
          <div className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            {spot.type === "paid" && spot.rate && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 shrink-0" style={{ color: "var(--badge-paid-text)" }} />
                <span>{spot.rate}</span>
              </div>
            )}
            
            {spot.type === "free" && spot.timeLimit && (
              <div className="flex items-center gap-2">
                <Timer className="w-3 h-3 shrink-0" style={{ color: "var(--badge-free-text)" }} />
                <span>{spot.timeLimit}</span>
              </div>
            )}
            
            {spot.type === "ev" && spot.chargers && (
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 shrink-0" style={{ color: "var(--badge-ev-text)" }} />
                <span>
                  {spot.chargers} charger{spot.chargers > 1 ? "s" : ""}
                  {spot.operator ? ` - ${spot.operator}` : ""}
                </span>
              </div>
            )}
          </div>

          {/* AI prediction */}
          {spot.availabilityEstimate && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" style={{ color: "var(--primary)" }} />
               <span
                className={cn(
                  "text-[10px] font-semibold",
                  spot.availabilityEstimate === "likely available"
                    ? "text-success"
                    : spot.availabilityEstimate === "might be busy"
                    ? "text-accent"
                    : "text-destructive"
                )}
              >
                {spot.availabilityEstimate === "likely available"
                  ? "Likely available"
                  : spot.availabilityEstimate === "might be busy"
                  ? "Might be busy"
                  : "Probably full"}
              </span>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-2 mt-3">
            <a
              href={getGoogleMapsUrl(spot.lat, spot.lng)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 py-1.5 rounded-md text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
              style={{
                background: "var(--btn-secondary-bg)",
                color: "var(--btn-secondary-text)",
                border: "1px solid var(--btn-secondary-border)",
              }}
            >
              <Navigation className="w-3 h-3" />
              Google
            </a>
            <a
              href={getAppleMapsUrl(spot.lat, spot.lng, spot.name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 py-1.5 rounded-md text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
              style={{
                background: "var(--btn-secondary-bg)",
                color: "var(--btn-secondary-text)",
                border: "1px solid var(--btn-secondary-border)",
              }}
            >
              <Apple className="w-3 h-3" />
              Apple
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Full sidebar card with hover-expand animation
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
            src={spot.streetViewUrl || getStreetViewUrl(spot.lat, spot.lng)}
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

          {/* Walk time bottom-right */}
          {spot.walkTime && (
            <div className="absolute bottom-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm">
                <Footprints className="w-3 h-3" />
                {spot.walkTime}
              </span>
            </div>
          )}

          {/* Distance bottom-left */}
          {spot.walkDistance && (
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm">
                <MapPin className="w-3 h-3" />
                {formatDistance(spot.walkDistance)}
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          {/* Name + address */}
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
                  {/* Paid parking rates */}
                  {spot.type === "paid" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--badge-paid-text)" }} />
                        <span style={{ color: "var(--text-primary)" }} className="font-medium">Rates</span>
                      </div>
                      <div className="pl-5 space-y-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {spot.rateDetails?.daytime && <p>{spot.rateDetails.daytime}</p>}
                        {spot.rateDetails?.evening && <p>{spot.rateDetails.evening}</p>}
                        {!spot.rateDetails && spot.rate && <p>{spot.rate}</p>}
                      </div>
                    </div>
                  )}

                  {/* Free parking time limits */}
                  {spot.type === "free" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Timer className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--badge-free-text)" }} />
                        <span style={{ color: "var(--text-primary)" }} className="font-medium">Time Limit</span>
                      </div>
                      <div className="pl-5 space-y-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {spot.timeLimitDetails?.daytime && <p>{spot.timeLimitDetails.daytime}</p>}
                        {spot.timeLimitDetails?.evening && <p>{spot.timeLimitDetails.evening}</p>}
                        {!spot.timeLimitDetails && spot.timeLimit && <p>{spot.timeLimit}</p>}
                      </div>
                    </div>
                  )}

                  {/* EV charger info */}
                  {spot.type === "ev" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--badge-ev-text)" }} />
                        <span style={{ color: "var(--text-primary)" }} className="font-medium">EV Charging</span>
                      </div>
                      <div className="pl-5 space-y-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <p>{spot.chargers || 1} charger{(spot.chargers || 1) > 1 ? "s" : ""} available</p>
                        {spot.operator && <p>Operated by {spot.operator}</p>}
                        {spot.rate && <p>{spot.rate}</p>}
                      </div>
                    </div>
                  )}

                  {/* AI availability prediction */}
                  {spot.availabilityEstimate && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--primary)" }} />
                       <span
                        className={cn(
                          "text-xs font-medium",
                          spot.availabilityEstimate === "likely available"
                            ? "text-success"
                            : spot.availabilityEstimate === "might be busy"
                            ? "text-accent"
                            : "text-destructive"
                        )}
                      >
                        {spot.availabilityEstimate === "likely available"
                          ? "Likely available"
                          : spot.availabilityEstimate === "might be busy"
                          ? "Might be busy"
                          : "Probably full"}
                      </span>
                    </div>
                  )}

                  {/* AI reason */}
                  {isRecommended && spot.aiReason && (
                    <p 
                      className="text-xs italic pl-0.5"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      "{spot.aiReason}"
                    </p>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex gap-2 pt-1">
                    <a
                      href={getGoogleMapsUrl(spot.lat, spot.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 hover:opacity-90"
                      style={{
                        background: "var(--btn-primary-bg)",
                        color: "var(--btn-primary-text)",
                      }}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Google Maps
                    </a>
                    <a
                      href={getAppleMapsUrl(spot.lat, spot.lng, spot.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 hover:opacity-90"
                      style={{
                        background: "var(--btn-secondary-bg)",
                        color: "var(--btn-secondary-text)",
                        border: "1px solid var(--btn-secondary-border)",
                      }}
                    >
                      <Apple className="w-3.5 h-3.5" />
                      Apple Maps
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
