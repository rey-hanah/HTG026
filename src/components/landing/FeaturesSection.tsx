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
      "Tell us where you're going and when. Gemini reads your constraints — budget, EV, time limit — and picks one spot. With a reason.",
  },
  {
    icon: Radio,
    title: "Real-Time Data",
    description:
      "Every search queries live city data. No cached results, no stale meters, no surprises when you arrive.",
  },
  {
    icon: Layers,
    title: "Multi-Source Coverage",
    description:
      "Google Maps shows you Impark. We also show you the free street spot two blocks east, the EV charger around the corner, and how long each takes to walk to.",
  },
];

function CardDecorator({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-accent)25%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-accent)50%,transparent)]">
      {/* Grid pattern */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      {/* Gradient fade from all four directions */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,var(--color-canvas-resolved)_100%)]"
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
    <section id="features" className="section-padding">
      <div className="container-landing">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-12 lg:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Why SpotAI
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold tracking-tight text-[var(--color-ink-resolved)] md:text-4xl lg:text-5xl">
            Everything Google Maps{" "}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              skips.
            </span>
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted-resolved)] text-lg">
            Three things SpotAI does that your maps app doesn't.
          </p>
        </div>

        {/* Cards grid */}
        <div className="mx-auto grid gap-6 md:grid-cols-3 lg:gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="glass-card group relative overflow-hidden rounded-[20px] shadow-none"
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
