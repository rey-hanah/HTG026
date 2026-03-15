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
  free: "#7fa888",
  paid: "#d4915c",
  ev: "#8fb89a",
  unknown: "#6b7280",
  recommended: "#d4915c",
  destination: "#bf784d",
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
  const borderWidth = isRecommended ? "3px" : isSelected ? "3px" : "2.5px";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: ${borderWidth} solid white;
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
    bg: isDark ? "#1a1f2e" : "#ffffff",
    text: isDark ? "#f0ece4" : "#111827",
    textMuted: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#2d3548" : "#e5e7eb",
  };
}

function formatDistance(meters?: number): string {
  if (!meters) return "";
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

function getAppleMapsUrl(lat: number, lng: number): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w&t=m`;
}

function createPopupContent(spot: ParkingSpot, style: ReturnType<typeof getPopupStyle>, isRecommended: boolean): string {
  const typeColors: Record<string, { bg: string; text: string }> = {
    free: { bg: "#dcfce7", text: "#166534" },
    paid: { bg: "#fef3c7", text: "#92400e" },
    ev: { bg: "#dbeafe", text: "#1e40af" },
    unknown: { bg: "#f3f4f6", text: "#374151" },
  };
  
  const typeStyle = typeColors[spot.type] || typeColors.unknown;
  const recommendedBorder = isRecommended ? `border: 2px solid #d4915c;` : `border: 1px solid ${style.border};`;
  
  let detailsHtml = "";
  
  // Type-specific details
  if (spot.type === "paid" && spot.rate) {
    detailsHtml += `
      <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${typeStyle.text}" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        <span style="font-size: 11px; color: ${style.text};">${spot.rate}</span>
      </div>
    `;
  }
  
  if (spot.type === "free" && spot.timeLimit) {
    detailsHtml += `
      <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${typeStyle.text}" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span style="font-size: 11px; color: ${style.text};">${spot.timeLimit}</span>
      </div>
    `;
  }
  
  if (spot.type === "ev" && spot.chargers) {
    detailsHtml += `
      <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${typeStyle.text}" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <span style="font-size: 11px; color: ${style.text};">${spot.chargers} charger${spot.chargers > 1 ? "s" : ""}${spot.operator ? ` - ${spot.operator}` : ""}</span>
      </div>
    `;
  }
  
  // Walk time and distance
  if (spot.walkTime || spot.walkDistance) {
    detailsHtml += `
      <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px solid ${style.border};">
        ${spot.walkDistance ? `
          <div style="display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${style.textMuted}" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span style="font-size: 11px; color: ${style.textMuted};">${formatDistance(spot.walkDistance)}</span>
          </div>
        ` : ""}
        ${spot.walkTime ? `
          <div style="display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${style.textMuted}" stroke-width="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            <span style="font-size: 11px; color: ${style.textMuted};">${spot.walkTime}</span>
          </div>
        ` : ""}
      </div>
    `;
  }
  
  // AI availability
  if (spot.availabilityEstimate) {
    const availColors = {
      "likely available": "#22c55e",
      "might be busy": "#f59e0b",
      "probably full": "#ef4444",
    };
    const availText = {
      "likely available": "Likely available",
      "might be busy": "Might be busy",
      "probably full": "Probably full",
    };
    detailsHtml += `
      <div style="display: flex; align-items: center; gap: 4px; margin-top: 6px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${availColors[spot.availabilityEstimate]}" stroke-width="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
        <span style="font-size: 10px; font-weight: 600; color: ${availColors[spot.availabilityEstimate]};">${availText[spot.availabilityEstimate]}</span>
      </div>
    `;
  }
  
  return `
    <div style="min-width: 240px; padding: 8px; background: ${style.bg}; color: ${style.text}; border-radius: 8px; ${recommendedBorder}">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          background: ${typeStyle.bg};
          color: ${typeStyle.text};
        ">${spot.type.toUpperCase()}</span>
        ${isRecommended ? `
          <span style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            background: #d4915c;
            color: white;
          ">AI PICK</span>
        ` : ""}
      </div>
      
      <h4 style="font-size: 13px; font-weight: 600; margin: 0 0 4px 0; color: ${style.text};">${spot.name}</h4>
      ${spot.address ? `<p style="font-size: 11px; color: ${style.textMuted}; margin: 0;">${spot.address}</p>` : ""}
      
      ${detailsHtml}
      
      <div style="display: flex; gap: 6px; margin-top: 10px;">
        <a href="${getGoogleMapsUrl(spot.lat, spot.lng)}" target="_blank" rel="noopener" style="
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 500;
          background: #d4915c;
          color: white;
          text-decoration: none;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          Google
        </a>
        <a href="${getAppleMapsUrl(spot.lat, spot.lng)}" target="_blank" rel="noopener" style="
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 500;
          background: transparent;
          color: ${style.text};
          text-decoration: none;
          border: 1px solid ${style.border};
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83"/>
            <path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </a>
      </div>
    </div>
  `;
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
  const routeLayerRef = useRef<L.Layer | null>(null);
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

    map.removeLayer(tileLayerRef.current);
    const newTileLayer = L.tileLayer(newUrl, {
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    }).addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [theme, mapReady]);

  // Handle destination marker
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;

    if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }

    if (destinationCoords) {
      const icon = createDestinationIcon();
      destinationMarkerRef.current = L.marker(destinationCoords, {
        icon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(
          `<div style="min-width: 120px; text-align: center; padding: 4px;">
            <strong style="color: ${MARKER_COLORS.destination}; font-size: 13px;">Your Destination</strong>
          </div>`
        );

      map.setView(destinationCoords, 16, { animate: true });
    }
  }, [destinationCoords, mapReady, theme]);

  // Handle parking markers
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;
    const style = getPopupStyle(theme === "dark");

    // Clear old markers
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

      marker.on("mouseover", () => {
        marker.openPopup();
      });

      marker.bindPopup(createPopupContent(spot, style, isRecommended), {
        maxWidth: 280,
        className: "custom-popup",
      });

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(spot));
      }

      markersRef.current.set(spot.id, marker);
    });

    // Fit bounds
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

  // Handle center/zoom changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (selectedSpotId) {
      mapRef.current.flyTo(center, zoom, { duration: 0.5 });
    }
  }, [center, zoom, selectedSpotId, mapReady]);

  // Handle heatmap
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;

    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (showHeatmap && spots.length > 0) {
      const heatmapLayer = L.layerGroup();

      spots.forEach((spot) => {
        const circle = L.circle([spot.lat, spot.lng], {
          radius: 80,
          fillColor: MARKER_COLORS[spot.type] || MARKER_COLORS.unknown,
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

  // Draw walking route
  useEffect(() => {
    if (!mapRef.current || !mapReady || !destinationCoords) return;

    const map = mapRef.current;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const selectedSpot = spots.find((s) => s.id === selectedSpotId);
    if (selectedSpot && selectedSpot.walkGeometry) {
      const routeLayer = L.layerGroup();

      if (selectedSpot.walkGeometry.coordinates) {
        const coords = selectedSpot.walkGeometry.coordinates.map(
          (c: number[]) => [c[1], c[0]] as [number, number]
        );

        const polyline = L.polyline(coords, {
          color: "#d4915c",
          weight: 4,
          opacity: 0.8,
          dashArray: "8, 8",
        });
        routeLayer.addLayer(polyline);

        routeLayer.addTo(map);
        routeLayerRef.current = routeLayer;
      }
    }
  }, [selectedSpotId, spots, destinationCoords, mapReady]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
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
          border: showHeatmap ? "none" : "1px solid var(--control-border)",
          backdropFilter: "blur(8px)",
        }}
      >
        {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
      </button>
      
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: ${theme === "dark" ? "#1a1f2e" : "#ffffff"};
        }
      `}</style>
    </div>
  );
}
