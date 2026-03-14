"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Search, X, MapPin } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  loading?: boolean;
}

export default function SearchBar({
  onSearch,
  onLocationSelect,
  loading,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const [locating, setLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address =
            data.display_name?.split(",")[0] || "My Location";
          setValue(address);

          if (onLocationSelect) {
            onLocationSelect(latitude, longitude);
          }
        } catch {
          setValue("My Location");
          if (onLocationSelect) {
            onLocationSelect(latitude, longitude);
          }
        }
        setLocating(false);
      },
      () => {
        alert(
          "Unable to get your location. Please enable location access."
        );
        setLocating(false);
      }
    );
  };

  return (
    <div className="relative w-full max-w-[560px]">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#d4915c]/20 to-[#eab07a]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div
          className="relative flex items-center rounded-xl transition-all duration-200"
          style={{
            background: "var(--search-bg)",
            border: "1px solid var(--search-border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            className="p-3 ml-2 transition-colors disabled:opacity-40"
            style={{ color: "var(--text-tertiary)" }}
            title="Use my location"
          >
            <MapPin
              className={`w-5 h-5 ${locating ? "animate-pulse" : ""}`}
            />
          </button>
          <Search
            className="w-5 h-5 shrink-0"
            style={{ color: "var(--text-tertiary)" }}
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Where are you going?"
            className="flex-1 min-w-0 h-14 px-3 py-2 bg-transparent text-base focus:outline-none"
            style={{
              color: "var(--text-primary)",
            }}
          />
          {value && (
            <button
              onClick={() => setValue("")}
              className="p-2 shrink-0 transition-colors"
              style={{ color: "var(--text-tertiary)" }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={loading || !value.trim()}
            className="h-10 px-4 mr-2 shrink-0 text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
            style={{
              background: "var(--btn-primary-bg)",
              color: "var(--btn-primary-text)",
            }}
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </div>
    </div>
  );
}
