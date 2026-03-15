"use client";

import { ParkingSpot } from "@/types/parking";
import ParkingCard from "./ParkingCard";
import SearchBar from "./SearchBar";
import RadiusControl from "./RadiusControl";
import ArrivalTimeControl from "./ArrivalTimeControl";
import { Sparkles, PanelLeftClose, PanelLeft, Car, MapPin } from "lucide-react";
import Image from "next/image";
import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultsPanelProps {
  spots: ParkingSpot[];
  loading?: boolean;
  recommendedId?: string;
  onNavigate: (spot: ParkingSpot) => void;
  onSpotClick: (spot: ParkingSpot) => void;
  filter: "all" | "free" | "paid" | "ev";
  onFilterChange: (filter: "all" | "free" | "paid" | "ev") => void;
  /* Search controls */
  onSearch: (query: string) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  searchLoading?: boolean;
  hasSearched: boolean;
  /* Radius */
  radius: number;
  onRadiusChange: (radius: number) => void;
  /* Arrival time */
  arrivalMinutes: number | null;
  onArrivalChange: (minutes: number | null) => void;
  /* Drive time info */
  driveTimeMinutes: number | null;
  /* Error */
  error: string | null;
  /* Extra header actions (e.g. ThemeToggle) */
  headerActions?: ReactNode;
}

export default function ResultsPanel({
  spots,
  loading,
  recommendedId,
  onNavigate,
  onSpotClick,
  filter,
  onFilterChange,
  onSearch,
  onLocationSelect,
  searchLoading,
  hasSearched,
  radius,
  onRadiusChange,
  arrivalMinutes,
  onArrivalChange,
  driveTimeMinutes,
  error,
  headerActions,
}: ResultsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const filters: { value: "all" | "free" | "paid" | "ev"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
    { value: "ev", label: "EV" },
  ];

  const filteredSpots = spots.filter(
    (s) => filter === "all" || s.type === filter
  );
  const recommended = filteredSpots.find((s) => s.id === recommendedId);
  const others = filteredSpots.filter((s) => s.id !== recommendedId);

  // Collapsed sidebar: just a thin strip with toggle button
  if (collapsed) {
    return (
      <div
        className="hidden md:flex flex-col items-center py-4 w-12 shrink-0"
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
          title="Expand sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        {spots.length > 0 && (
          <div className="mt-4 flex flex-col items-center gap-1">
            <Car className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
            <span
              className="text-[10px] font-medium"
              style={{ color: "var(--text-tertiary)" }}
            >
              {filteredSpots.length}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="w-full md:w-[400px] h-full shrink-0 flex flex-col"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Brand header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <a
          href="/"
          className="flex items-center gap-1.5"
          style={{ color: "var(--primary)" }}
        >
          <Image src="/logo.svg" alt="SpotAI logo" width={20} height={20} className="w-5 h-5" />
          <span
            className="text-sm font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            SpotAI
          </span>
        </a>
        <div className="flex items-center gap-2">
          {headerActions}
          <button
            onClick={() => setCollapsed(true)}
            className="hidden md:block p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "var(--text-tertiary)" }}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search bar + controls section */}
      <div
        className="px-4 py-3"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <SearchBar
          onSearch={onSearch}
          onLocationSelect={onLocationSelect}
          loading={searchLoading}
        />

        {/* Controls shown after search */}
        {hasSearched && (
          <div className="mt-3 flex flex-col gap-2">
            <ArrivalTimeControl
              arrivalMinutes={arrivalMinutes}
              onArrivalChange={onArrivalChange}
              driveTimeMinutes={driveTimeMinutes}
            />
            <RadiusControl
              radius={radius}
              onRadiusChange={onRadiusChange}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className="mt-3 px-3 py-2 rounded-lg text-sm"
            style={{
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              color: "var(--error-text)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Filters + spot count */}
      <div
        className="px-4 py-3"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Spots
            </span>
            {filteredSpots.length > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                {filteredSpots.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background:
                  filter === f.value
                    ? "var(--filter-active-bg)"
                    : "var(--filter-bg)",
                color:
                  filter === f.value
                    ? "var(--filter-active-text)"
                    : "var(--filter-text)",
              }}
              onMouseEnter={(e) => {
                if (filter !== f.value)
                  e.currentTarget.style.background = "var(--filter-hover)";
              }}
              onMouseLeave={(e) => {
                if (filter !== f.value)
                  e.currentTarget.style.background = "var(--filter-bg)";
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable card list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-xl animate-pulse"
                style={{ background: "var(--skeleton-bg)" }}
              />
            ))}
          </div>
        )}

        {/* AI Recommended card first */}
        {!loading && (
          <AnimatePresence>
            {recommended && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--ai-text)" }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--ai-text)" }}
                  >
                    AI Recommended
                  </span>
                </div>
                <ParkingCard
                  spot={recommended}
                  isRecommended
                  onNavigate={() => onNavigate(recommended)}
                  onClick={() => onSpotClick(recommended)}
                />
                <div
                  className="my-4"
                  style={{ borderTop: "1px solid var(--sidebar-border)" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Other spots */}
        {!loading &&
          others.map((spot, i) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <ParkingCard
                spot={spot}
                onNavigate={() => onNavigate(spot)}
                onClick={() => onSpotClick(spot)}
              />
            </motion.div>
          ))}

        {!loading && filteredSpots.length === 0 && hasSearched && (
          <div className="text-center py-12">
            <Car
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--text-tertiary)" }}
            />
            <p className="text-sm" style={{ color: "var(--empty-text)" }}>
              No parking spots found. Try a different filter or location.
            </p>
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="text-center py-12">
            <MapPin
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--text-tertiary)" }}
            />
            <p className="text-sm" style={{ color: "var(--empty-text)" }}>
              Search for a destination to find nearby parking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
