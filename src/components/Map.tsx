"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ParkingSpot } from "@/types/parking";

const TILE_URL = "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";

const MARKER_COLORS = {
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
  onMarkerClick?: (spot: ParkingSpot) => void;
  destinationCoords?: [number, number] | null;
  filter: "all" | "free" | "paid" | "ev";
}

function createMarkerIcon(type: "free" | "paid" | "ev" | "unknown", isRecommended: boolean) {
  const color = isRecommended ? MARKER_COLORS.recommended : MARKER_COLORS[type] || MARKER_COLORS.unknown;
  const size = isRecommended ? 20 : 14;
  
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isRecommended ? `animation: pulse 1.5s ease-in-out infinite;` : ""}
      "></div>
      ${isRecommended ? `<style>@keyframes pulse {
        0%,100% { box-shadow: 0 0 0 0 ${color}80; }
        50% { box-shadow: 0 0 0 10px transparent; }
      }</style>` : ""}
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
        height: 32px;
        background: ${MARKER_COLORS.destination};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [8, 32],
  });
}

export default function Map({ center, zoom, spots, recommendedId, onMarkerClick, destinationCoords, filter }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle destination marker
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;

    if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }

    if (destinationCoords) {
      const icon = createDestinationIcon();
      destinationMarkerRef.current = L.marker(destinationCoords, { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 120px; text-align: center;">
            <strong style="color: ${MARKER_COLORS.destination};">Your Destination</strong>
          </div>
        `);
    }
  }, [destinationCoords]);

  // Handle parking markers with filter
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== destinationMarkerRef.current) {
        map.removeLayer(layer);
      }
    });

    const filteredSpots = spots.filter(s => filter === "all" || s.type === filter);

    filteredSpots.forEach((spot) => {
      const isRecommended = spot.id === recommendedId;
      const icon = createMarkerIcon(spot.type, isRecommended);
      
      const marker = L.marker([spot.lat, spot.lng], { icon })
        .addTo(map);

      // Show popup on hover
      marker.on("mouseover", function(this: L.Marker) {
        this.openPopup();
      });

      marker.bindPopup(`
        <div style="min-width: 180px;">
          <strong>${spot.name}</strong><br/>
          <span style="color: ${MARKER_COLORS[spot.type] || MARKER_COLORS.unknown}">●</span> ${spot.type.toUpperCase()}<br/>
          ${spot.rate ? `💰 ${spot.rate}<br/>` : ""}
          ${spot.timeLimit ? `⏱️ ${spot.timeLimit}<br/>` : ""}
          ${spot.walkTime ? `🚶 ${spot.walkTime}` : ""}
        </div>
      `);

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(spot));
      }
    });

    if (filteredSpots.length > 0 && destinationCoords) {
      const allPoints = [...filteredSpots.map(s => [s.lat, s.lng] as [number, number]), destinationCoords];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [spots, recommendedId, onMarkerClick, filter, destinationCoords]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
    />
  );
}
