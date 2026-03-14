"use client";

import { Brain, Radio, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Feature = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI-Powered Rankings",
    description:
      "Gemini AI considers time of day, walk distance, pricing, and availability patterns to recommend the single best parking spot for you.",
  },
  {
    icon: Radio,
    title: "Real-Time Data",
    description:
      "Live queries across free street parking, paid lots, and EV chargers — updated every search so you never get stale results.",
  },
  {
    icon: Layers,
    title: "Multi-Source Coverage",
    description:
      "We search 5 APIs simultaneously — Overpass, Vancouver Open Data, Open Charge Map, OSRM, and more — so no spot goes unnoticed.",
  },
];

function CardDecorator({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-accent)25%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-accent)50%,transparent)]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      <div
        aria-hidden
        className="bg-[var(--color-canvas-resolved)] absolute inset-0 m-auto size-12 rounded-xl border border-[var(--color-border)]"
      />
      <div className="bg-[var(--color-canvas-resolved)] absolute z-1 inset-0 m-auto flex size-12 items-center justify-center rounded-xl border border-[var(--color-border)]">
        {children}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Why SpotAI
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Built for smarter{" "}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              parking.
            </span>
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted-resolved)]">
            Three core pillars that make SpotAI different from any maps app.
          </p>
        </div>

        {/* Cards grid */}
        <div className="mx-auto mt-16 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02] shadow-none"
            >
              <CardHeader className="pb-3">
                <CardDecorator>
                  <feature.icon
                    className="size-6 text-accent"
                    aria-hidden
                  />
                </CardDecorator>
                <CardTitle className="mt-6 text-center font-display text-lg font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm leading-relaxed text-[var(--color-ink-muted-resolved)]">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
