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
};

interface MapProps {
  center: [number, number];
  zoom: number;
  spots: ParkingSpot[];
  recommendedId?: string;
  onMarkerClick?: (spot: ParkingSpot) => void;
}

function createMarkerIcon(type: string, isRecommended: boolean) {
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

export default function Map({ center, zoom, spots, recommendedId, onMarkerClick }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    spots.forEach((spot) => {
      const isRecommended = spot.id === recommendedId;
      const icon = createMarkerIcon(spot.type, isRecommended);
      
      const marker = L.marker([spot.lat, spot.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong>${spot.name}</strong><br/>
            <span style="color: ${MARKER_COLORS[spot.type] || MARKER_COLORS.unknown}">●</span> ${spot.type.toUpperCase()}<br/>
            ${spot.rate ? `${spot.rate}<br/>` : ""}
            ${spot.walkTime ? `🚶 ${spot.walkTime}` : ""}
          </div>
        `);

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(spot));
      }
    });

    if (spots.length > 0) {
      const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [spots, recommendedId, onMarkerClick]);

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
