"use client";

import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { Search, Layers, Brain, Navigation } from "lucide-react";

const content = [
  {
    title: "Enter Your Destination",
    description:
      "Type any address or landmark in Vancouver. We geocode it instantly with Nominatim and center the map on your destination — ready to search for parking in the area.",
    content: (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-accent/20 to-success/20 p-6">
        <Search className="h-10 w-10 text-accent mb-3" />
        <div className="rounded-lg border border-[var(--color-ink-resolved)]/10 bg-[var(--color-canvas-resolved)]/80 px-4 py-2 text-sm text-[var(--color-ink-resolved)] backdrop-blur">
          Cafe Medina, Vancouver
        </div>
        <div className="mt-2 text-[10px] text-[var(--color-ink-muted-resolved)]">Geocoding...</div>
      </div>
    ),
  },
  {
    title: "We Search 5 APIs at Once",
    description:
      "Overpass, Vancouver Open Data, Open Charge Map, OSRM, and more — we query free street spots, paid lots, and EV chargers simultaneously so no option goes unnoticed.",
    content: (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-accent/30 to-accent-light/20 p-6 gap-2">
        <Layers className="h-10 w-10 text-accent-light mb-2" />
        {["Overpass", "Vancouver", "ChargeMap", "OSRM", "Nominatim"].map(
          (api) => (
            <div
              key={api}
              className="w-full rounded-md border border-[var(--color-ink-resolved)]/10 bg-[var(--color-canvas-resolved)]/60 px-3 py-1 text-[11px] text-[var(--color-ink-resolved)]/70 backdrop-blur flex items-center gap-2"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-success" />
              {api}
            </div>
          )
        )}
      </div>
    ),
  },
  {
    title: "Gemini AI Ranks Results",
    description:
      "Our AI considers time of day, walk distance, pricing, and availability patterns to recommend the single best option for your specific situation — not just the closest spot.",
    content: (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-success/20 to-accent/20 p-6">
        <Brain className="h-10 w-10 text-success mb-3" />
        <div className="w-full space-y-1.5">
          {[
            { name: "Cambie St", score: "98%", rec: true },
            { name: "Pacific Centre", score: "85%", rec: false },
            { name: "Robson EV", score: "72%", rec: false },
          ].map((spot) => (
            <div
              key={spot.name}
              className={`rounded-md border px-3 py-1.5 text-[11px] backdrop-blur flex items-center justify-between ${
                spot.rec
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-[var(--color-ink-resolved)]/10 bg-[var(--color-canvas-resolved)]/50 text-[var(--color-ink-resolved)]/60"
              }`}
            >
              <span>{spot.name}</span>
              <span className="font-semibold">{spot.score}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Navigate to Your Spot",
    description:
      "One tap opens walking directions in Google Maps. You save time, money, and emissions — every single trip. From search to parked in under a minute.",
    content: (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-accent-light/20 to-success/20 p-6">
        <Navigation className="h-10 w-10 text-accent mb-3" />
        <div className="rounded-full border border-accent/30 bg-accent/10 px-5 py-2 text-sm font-semibold text-accent">
          Open Google Maps
        </div>
        <p className="mt-3 text-center text-[10px] text-[var(--color-ink-muted-resolved)]">
          Walking directions to your AI-picked spot
        </p>
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            How It Works
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Four steps.{" "}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              Zero stress.
            </span>
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted-resolved)]">
            From search to parked in under a minute.
          </p>
        </div>

        <StickyScroll content={content} />
      </div>
    </section>
  );
}
