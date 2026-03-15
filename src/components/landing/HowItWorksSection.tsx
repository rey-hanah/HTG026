"use client";

import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import {
  Search,
  Layers,
  Brain,
  Navigation,
  MapPin,
  Sparkles,
  CheckCircle2,
  Zap,
  Globe,
  Database,
  Route,
  MapPinned,
} from "lucide-react";

/* ────────────────────────────────────────────────────
   STEP 1 — Enter Destination
   ──────────────────────────────────────────────────── */
function VisualStep1() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-[16px] border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-6 shadow-medium">
        <p className="mb-4 text-xs font-medium text-[var(--color-ink-muted-resolved)]">
          Where are you headed?
        </p>
        <div className="flex items-center gap-3 rounded-[12px] border border-accent/20 bg-accent/[0.04] px-4 py-3">
          <MapPin className="h-4 w-4 shrink-0 text-accent" />
          <span className="text-sm font-medium text-[var(--color-ink-resolved)]">
            Cafe Medina, Vancouver
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-[var(--color-ink-muted-resolved)]">
            Geocoding address...
          </span>
        </div>
        <div className="mt-3 h-px bg-[var(--color-ink-resolved)]/[0.06]" />
        <div className="mt-3 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          <span className="text-xs font-medium text-success">Location found</span>
        </div>
        {/* Coordinates */}
        <div className="mt-3 flex items-center gap-4 text-[10px] text-[var(--color-ink-muted-resolved)]">
          <span>49.2781° N</span>
          <span>123.1087° W</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   STEP 2 — 5 APIs
   ──────────────────────────────────────────────────── */
const apiSources = [
  { name: "Overpass API", icon: Globe, status: "done" as const, desc: "Street parking" },
  { name: "Vancouver Open Data", icon: Database, status: "done" as const, desc: "Meter data" },
  { name: "Open Charge Map", icon: Zap, status: "done" as const, desc: "EV chargers" },
  { name: "OSRM Routing", icon: Route, status: "loading" as const, desc: "Walk times" },
  { name: "Nominatim", icon: MapPinned, status: "loading" as const, desc: "Geocoding" },
];

function VisualStep2() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-[16px] border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-6 shadow-medium">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--color-ink-muted-resolved)]">
            Searching data sources
          </p>
          <Layers className="h-4 w-4 text-accent-light" />
        </div>

        <div className="space-y-2.5">
          {apiSources.map((api) => (
            <div
              key={api.name}
              className="flex items-center justify-between rounded-[10px] border border-[var(--color-ink-resolved)]/[0.05] bg-[var(--color-ink-resolved)]/[0.02] px-3.5 py-2.5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md ${
                    api.status === "done"
                      ? "bg-success/10"
                      : "bg-accent/10"
                  }`}
                >
                  <api.icon
                    className={`h-3 w-3 ${
                      api.status === "done" ? "text-success" : "text-accent"
                    }`}
                  />
                </div>
                <div>
                  <span className="text-xs font-medium text-[var(--color-ink-resolved)]">
                    {api.name}
                  </span>
                  <p className="text-[10px] text-[var(--color-ink-muted-resolved)]">
                    {api.desc}
                  </p>
                </div>
              </div>
              {api.status === "done" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-[var(--color-ink-muted-resolved)]">
            <span>Searching 5 sources...</span>
            <span className="font-medium text-accent">3/5</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-ink-resolved)]/[0.06]">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   STEP 3 — AI Ranks Results
   ──────────────────────────────────────────────────── */
const rankedSpots = [
  { name: "Cambie St — Free", score: "98%", rec: true, walk: "2 min" },
  { name: "Pacific Centre Lot", score: "85%", rec: false, walk: "5 min" },
  { name: "Robson EV Charger", score: "72%", rec: false, walk: "8 min" },
];

function VisualStep3() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-[16px] border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-6 shadow-medium">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--color-ink-muted-resolved)]">
            AI ranking
          </p>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-[10px] font-semibold text-accent">Gemini</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {rankedSpots.map((spot) => (
            <div
              key={spot.name}
              className={`flex items-center justify-between rounded-[10px] border px-3.5 py-3 ${
                spot.rec
                  ? "border-success/25 bg-success/[0.06]"
                  : "border-[var(--color-ink-resolved)]/[0.05] bg-[var(--color-ink-resolved)]/[0.02]"
              }`}
            >
              <div>
                <p
                  className={`text-xs font-semibold ${
                    spot.rec ? "text-success" : "text-[var(--color-ink-resolved)]"
                  }`}
                >
                  {spot.name}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--color-ink-muted-resolved)]">
                  {spot.walk} walk
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {spot.rec && (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-bold text-success">
                    BEST
                  </span>
                )}
                <span
                  className={`text-sm font-bold ${
                    spot.rec
                      ? "text-success"
                      : "text-[var(--color-ink-muted-resolved)]"
                  }`}
                >
                  {spot.score}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* AI reasoning footer */}
        <div className="mt-4 rounded-[8px] border border-accent/10 bg-accent/[0.03] px-3.5 py-2.5">
          <p className="text-[10px] leading-relaxed text-[var(--color-ink-muted-resolved)]">
            <span className="font-medium text-accent">Reasoning:</span> Free
            spot, 2 min walk, low competition at this time of day
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   STEP 4 — Navigate
   ──────────────────────────────────────────────────── */
function VisualStep4() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-[16px] border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-6 shadow-medium">
        {/* Mini map placeholder */}
        <div className="relative mb-5 h-32 w-full overflow-hidden rounded-[10px] border border-[var(--color-ink-resolved)]/[0.05] bg-[var(--color-ink-resolved)]/[0.03]">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 200 100"
          >
            <path
              d="M 30 80 Q 60 20, 100 50 T 170 25"
              stroke="var(--brand-accent)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="30" cy="80" r="5" fill="var(--brand-accent)" opacity="0.3" />
            <circle cx="30" cy="80" r="3" fill="var(--brand-accent)" />
            <circle cx="170" cy="25" r="5" fill="var(--brand-success)" opacity="0.3" />
            <circle cx="170" cy="25" r="3" fill="var(--brand-success)" />
          </svg>
        </div>

        {/* Winning spot info */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink-resolved)]">
              Cambie St Parking
            </p>
            <p className="mt-0.5 text-[10px] text-[var(--color-ink-muted-resolved)]">
              2 min walk &middot; Free
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold text-success">
              2 min
            </span>
          </div>
        </div>

        {/* Navigate button */}
        <button className="w-full rounded-[10px] bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light">
          <span className="flex items-center justify-center gap-2">
            <Navigation className="h-4 w-4" />
            Open in Google Maps
          </span>
        </button>

        {/* Saved stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Time saved", value: "8 min" },
            { label: "Cost", value: "Free" },
            { label: "Distance", value: "120m" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[8px] bg-[var(--color-ink-resolved)]/[0.02] px-2.5 py-2 text-center"
            >
              <p className="text-xs font-bold text-[var(--color-ink-resolved)]">
                {stat.value}
              </p>
              <p className="text-[9px] text-[var(--color-ink-muted-resolved)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   CONTENT ARRAY
   ──────────────────────────────────────────────────── */
const content = [
  {
    title: "Enter Your Destination",
    description:
      "Type any address or landmark in Vancouver. We geocode it instantly with Nominatim and center the map on your destination — ready to search for parking in the area.",
    content: <VisualStep1 />,
  },
  {
    title: "We Search 5 APIs at Once",
    description:
      "Overpass, Vancouver Open Data, Open Charge Map, OSRM, and more — we query free street spots, paid lots, and EV chargers simultaneously so no option goes unnoticed.",
    content: <VisualStep2 />,
  },
  {
    title: "Gemini AI Ranks Results",
    description:
      "Our AI considers time of day, walk distance, pricing, and availability patterns to recommend the single best option for your specific situation — not just the closest spot.",
    content: <VisualStep3 />,
  },
  {
    title: "Navigate to Your Spot",
    description:
      "One tap opens walking directions in Google Maps. You save time, money, and emissions — every single trip. From search to parked in under a minute.",
    content: <VisualStep4 />,
  },
];

/* ────────────────────────────────────────────────────
   SECTION COMPONENT
   ──────────────────────────────────────────────────── */
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
