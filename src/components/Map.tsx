"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ParkingSpot } from "@/types/parking";
import { useTheme } from "./ThemeProvider";

const TILE_DARK =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
const TILE_LIGHT =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";

const MARKER_COLORS: Record<string, string> = {
  free: "#22c55e",
  paid: "#f59e0b",
  ev: "#3b82f6",
  unknown: "#6b7280",
  recommended: "#a855f7",
  destination: "#ef4444",
};

interface MapProps {
  center: [number, number];
  zoom: number;
  spots: ParkingSpot[];
  recommendedId?: string;
  selectedSpotId?: string;
  onMarkerClick?: (spot: ParkingSpot) => void;
  destinationCoords?: [number, number] | null;
  filter: "all" | "free" | "paid" | "ev";
}

function createMarkerIcon(
  type: string,
  isRecommended: boolean,
  isSelected: boolean
) {
  const color = isRecommended
    ? MARKER_COLORS.recommended
    : MARKER_COLORS[type] || MARKER_COLORS.unknown;
  const size = isRecommended || isSelected ? 20 : 14;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: ${isSelected ? "3px" : "2.5px"} solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isRecommended ? `animation: pulse 1.5s ease-in-out infinite;` : ""}
        ${isSelected ? `transform: scale(1.2);` : ""}
      "></div>
      ${
        isRecommended
          ? `<style>@keyframes pulse {
        0%,100% { box-shadow: 0 0 0 0 ${color}80; }
        50% { box-shadow: 0 0 0 10px transparent; }
      }</style>`
          : ""
      }
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createDestinationIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 32px;
        height: 40px;
        position: relative;
      ">
        <div style="
          width: 28px;
          height: 28px;
          background: ${MARKER_COLORS.destination};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          position: absolute;
          top: 0;
          left: 2px;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
          "></div>
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
}

function getPopupStyle(isDark: boolean) {
  return {
    bg: isDark ? "#111520" : "#ffffff",
    text: isDark ? "#f0ece4" : "#111827",
    textMuted: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#1e2330" : "#e5e7eb",
  };
}

export default function Map({
  center,
  zoom,
  spots,
  recommendedId,
  selectedSpotId,
  onMarkerClick,
  destinationCoords,
  filter,
}: MapProps) {
  const { theme } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<globalThis.Map<string, L.Marker>>(
    new globalThis.Map()
  );
  const heatmapLayerRef = useRef<L.Layer | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    const tileUrl = theme === "dark" ? TILE_DARK : TILE_LIGHT;
    const tileLayer = L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Switch tile layer on theme change
  useEffect(() => {
    if (!mapRef.current || !mapReady || !tileLayerRef.current) return;

    const map = mapRef.current;
    const newUrl = theme === "dark" ? TILE_DARK : TILE_LIGHT;

    // Remove old tile layer and add new one
    map.removeLayer(tileLayerRef.current);
    const newTileLayer = L.tileLayer(newUrl, {
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    }).addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [theme, mapReady]);

  // Handle destination marker and center map on it
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;

    // Remove old destination marker
    if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }

    if (destinationCoords) {
      const icon = createDestinationIcon();
      const style = getPopupStyle(theme === "dark");
      destinationMarkerRef.current = L.marker(destinationCoords, {
        icon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(
          `
          <div style="min-width: 140px; text-align: center; padding: 4px;">
            <strong style="color: ${MARKER_COLORS.destination}; font-size: 14px;">Your Destination</strong>
          </div>
        `
        );

      // Center on destination immediately
      map.setView(destinationCoords, 16, { animate: true });
    }
  }, [destinationCoords, mapReady, theme]);

  // Handle parking markers with filter
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;
    const style = getPopupStyle(theme === "dark");

    // Clear old parking markers (not destination)
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current.clear();

    const filteredSpots = spots.filter(
      (s) => filter === "all" || s.type === filter
    );

    filteredSpots.forEach((spot) => {
      const isRecommended = spot.id === recommendedId;
      const isSelected = spot.id === selectedSpotId;
      const icon = createMarkerIcon(spot.type, isRecommended, isSelected);

      const marker = L.marker([spot.lat, spot.lng], {
        icon,
        zIndexOffset: isRecommended ? 500 : isSelected ? 400 : 0,
      }).addTo(map);

      // Show popup on hover
      marker.on("mouseover", () => {
        marker.openPopup();
      });

      marker.bindPopup(
        `
        <div style="min-width: 200px; padding: 4px; background: ${style.bg}; color: ${style.text};">
          <strong style="font-size: 14px;">${spot.name}</strong><br/>
          ${
            spot.address
              ? `<span style="color: ${style.textMuted}; font-size: 12px;">${spot.address}</span><br/>`
              : ""
          }
          <div style="margin-top: 6px;">
            <span style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              background: ${MARKER_COLORS[spot.type] || MARKER_COLORS.unknown}20;
              color: ${MARKER_COLORS[spot.type] || MARKER_COLORS.unknown};
            ">${spot.type.toUpperCase()}</span>
          </div>
          <div style="margin-top: 8px; font-size: 13px; color: ${style.text};">
            ${spot.rate ? `<div>💰 ${spot.rate}</div>` : ""}
            ${spot.timeLimit ? `<div>⏱️ ${spot.timeLimit}</div>` : ""}
            ${spot.walkTime ? `<div>🚶 ${spot.walkTime} walk</div>` : ""}
            ${
              spot.chargers
                ? `<div>🔌 ${spot.chargers} charger${
                    spot.chargers > 1 ? "s" : ""
                  }</div>`
                : ""
            }
          </div>
        </div>
      `
      );

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(spot));
      }

      markersRef.current.set(spot.id, marker);
    });

    // Fit bounds to include destination and nearby spots
    if (destinationCoords && filteredSpots.length > 0) {
      const closestSpots = filteredSpots.slice(0, 5);
      const allPoints: [number, number][] = [
        destinationCoords,
        ...closestSpots.map((s) => [s.lat, s.lng] as [number, number]),
      ];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
    }
  }, [
    spots,
    recommendedId,
    selectedSpotId,
    onMarkerClick,
    filter,
    destinationCoords,
    mapReady,
    theme,
  ]);

  // Handle explicit center/zoom changes (when user clicks a card)
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (selectedSpotId) {
      mapRef.current.flyTo(center, zoom, { duration: 0.5 });
    }
  }, [center, zoom, selectedSpotId, mapReady]);

  // Handle heatmap toggle
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;

    // Remove existing heatmap layer
    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (showHeatmap && spots.length > 0) {
      const heatmapLayer = L.layerGroup();

      spots.forEach((spot) => {
        const circle = L.circle([spot.lat, spot.lng], {
          radius: 80,
          fillColor:
            MARKER_COLORS[spot.type] || MARKER_COLORS.unknown,
          fillOpacity: 0.3,
          color: "transparent",
          weight: 0,
        });
        heatmapLayer.addLayer(circle);
      });

      heatmapLayer.addTo(map);
      heatmapLayerRef.current = heatmapLayer;
    }
  }, [showHeatmap, spots, mapReady]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
      {/* Heatmap toggle */}
      <button
        onClick={() => setShowHeatmap(!showHeatmap)}
        className="absolute top-4 right-4 z-[1000] px-3 py-2 rounded-lg text-xs font-medium transition-colors"
        style={{
          background: showHeatmap
            ? "var(--btn-primary-bg)"
            : "var(--control-bg)",
          color: showHeatmap
            ? "var(--btn-primary-text)"
            : "var(--text-secondary)",
          border: showHeatmap
            ? "none"
            : "1px solid var(--control-border)",
          backdropFilter: "blur(8px)",
        }}
      >
        {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
      </button>
    </div>
  );
}
