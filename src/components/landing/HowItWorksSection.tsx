"use client";

import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { Search, Layers, Brain, Navigation, MapPin, Sparkles, CheckCircle2 } from "lucide-react";

const content = [
  {
    title: "Enter Your Destination",
    description:
      "Type any address or landmark in Vancouver. We geocode it instantly with Nominatim and center the map on your destination — ready to search for parking in the area.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center">
        {/* Floating card */}
        <div className="w-full max-w-xs rounded-[16px] border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-5 shadow-medium">
          <p className="mb-4 text-xs font-medium text-[var(--color-ink-muted-resolved)]">Where are you headed?</p>
          <div className="flex items-center gap-3 rounded-[12px] border border-accent/20 bg-accent/[0.04] px-4 py-3">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            <span className="text-sm font-medium text-[var(--color-ink-resolved)]">Cafe Medina, Vancouver</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-[var(--color-ink-muted-resolved)]">Geocoding address...</span>
          </div>
          <div className="mt-3 h-px bg-[var(--color-ink-resolved)]/[0.06]" />
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            <span className="text-xs text-success font-medium">Location found</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "We Search 5 APIs at Once",
    description:
      "Overpass, Vancouver Open Data, Open Charge Map, OSRM, and more — we query free street spots, paid lots, and EV chargers simultaneously so no option goes unnoticed.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="w-full max-w-xs rounded-[16px] border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-5 shadow-medium">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-ink-muted-resolved)]">Data sources</p>
            <Layers className="h-4 w-4 text-accent-light" />
          </div>
          <div className="space-y-2">
            {[
              { name: "Overpass API", status: "done" },
              { name: "Vancouver Open Data", status: "done" },
              { name: "Open Charge Map", status: "done" },
              { name: "OSRM Routing", status: "loading" },
              { name: "Nominatim", status: "loading" },
            ].map((api) => (
              <div
                key={api.name}
                className="flex items-center justify-between rounded-[10px] border border-[var(--color-ink-resolved)]/[0.05] bg-[var(--color-ink-resolved)]/[0.02] px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full ${api.status === "done" ? "bg-success" : "bg-accent animate-pulse"}`} />
                  <span className="text-xs font-medium text-[var(--color-ink-resolved)]">{api.name}</span>
                </div>
                {api.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[10px] text-[var(--color-ink-muted-resolved)]">
            Querying 5 sources in parallel...
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Gemini AI Ranks Results",
    description:
      "Our AI considers time of day, walk distance, pricing, and availability patterns to recommend the single best option for your specific situation — not just the closest spot.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="w-full max-w-xs rounded-[16px] border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-5 shadow-medium">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-ink-muted-resolved)]">AI ranking</p>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-[10px] font-semibold text-accent">Gemini</span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { name: "Cambie St — Free", score: "98%", rec: true, walk: "2 min" },
              { name: "Pacific Centre Lot", score: "85%", rec: false, walk: "5 min" },
              { name: "Robson EV Charger", score: "72%", rec: false, walk: "8 min" },
            ].map((spot) => (
              <div
                key={spot.name}
                className={`flex items-center justify-between rounded-[10px] border px-3.5 py-3 ${
                  spot.rec
                    ? "border-success/25 bg-success/[0.06]"
                    : "border-[var(--color-ink-resolved)]/[0.05] bg-[var(--color-ink-resolved)]/[0.02]"
                }`}
              >
                <div>
                  <p className={`text-xs font-semibold ${spot.rec ? "text-success" : "text-[var(--color-ink-resolved)]"}`}>
                    {spot.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-ink-muted-resolved)] mt-0.5">{spot.walk} walk</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {spot.rec && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-bold text-success">BEST</span>}
                  <span className={`text-sm font-bold ${spot.rec ? "text-success" : "text-[var(--color-ink-muted-resolved)]"}`}>
                    {spot.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Navigate to Your Spot",
    description:
      "One tap opens walking directions in Google Maps. You save time, money, and emissions — every single trip. From search to parked in under a minute.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="w-full max-w-xs rounded-[16px] border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-5 shadow-medium">
          {/* Mini map placeholder */}
          <div className="mb-4 h-28 w-full rounded-[10px] bg-[var(--color-ink-resolved)]/[0.03] border border-[var(--color-ink-resolved)]/[0.05] flex items-center justify-center relative overflow-hidden">
            {/* Fake route line */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
              <path
                d="M 30 80 Q 60 20, 100 50 T 170 25"
                stroke="var(--color-accent)"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="30" cy="80" r="5" fill="var(--color-accent)" opacity="0.3" />
              <circle cx="30" cy="80" r="3" fill="var(--color-accent)" />
              <circle cx="170" cy="25" r="5" fill="var(--color-success)" opacity="0.3" />
              <circle cx="170" cy="25" r="3" fill="var(--color-success)" />
            </svg>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-[var(--color-ink-resolved)]">Cambie St Parking</p>
              <p className="text-[10px] text-[var(--color-ink-muted-resolved)] mt-0.5">2 min walk &middot; Free</p>
            </div>
            <div className="flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5 text-accent" />
            </div>
          </div>

          <button className="w-full rounded-[10px] bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-light">
            Open in Google Maps
          </button>
        </div>
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-landing">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-12 lg:mb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            How It Works
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold tracking-tight text-[var(--color-ink-resolved)] md:text-4xl lg:text-5xl">
            Four steps.{" "}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              Zero stress.
            </span>
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted-resolved)] text-lg">
            From search to parked in under a minute.
          </p>
        </div>

        <StickyScroll content={content} />
      </div>
    </section>
  );
}
