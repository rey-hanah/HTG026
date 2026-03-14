"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Clock, Car, DollarSign, Leaf, Brain, MapPin } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    icon: Clock,
    stat: "17 hrs",
    title: "Time Wasted Yearly",
    description:
      "The average US driver spends 17 hours per year searching for parking — up to 107 in cities like NYC.",
    accent: "accent",
  },
  {
    icon: Car,
    stat: "30%",
    title: "Urban Traffic from Cruising",
    description:
      "Up to 30% of city traffic is just drivers circling for a spot, clogging streets and wasting fuel.",
    accent: "accent-light",
  },
  {
    icon: DollarSign,
    stat: "$345",
    title: "Annual Cost per Driver",
    description:
      "Between fuel, time, and fines, the average driver loses $345 every year to the parking hunt.",
    accent: "accent",
  },
  {
    icon: Leaf,
    stat: "730 tons",
    title: "CO₂ per District",
    description:
      "A single LA district produces 730 tons of CO₂ annually from drivers cruising for parking alone.",
    accent: "success",
  },
  {
    icon: Brain,
    stat: "AI-Powered",
    title: "Smart Recommendations",
    description:
      "Gemini AI analyzes time of day, location type, and walk distance to recommend the best spot for you.",
    accent: "accent-light",
  },
  {
    icon: MapPin,
    stat: "5 APIs",
    title: "Comprehensive Coverage",
    description:
      "We search free street parking, paid lots, and EV chargers simultaneously across multiple data sources.",
    accent: "accent",
  },
];

const accentMap: Record<string, string> = {
  accent: "text-accent border-accent/20 bg-accent/[0.06]",
  "accent-light": "text-accent-light border-accent-light/20 bg-accent-light/[0.06]",
  success: "text-success border-success/20 bg-success/[0.06]",
};

const statColor: Record<string, string> = {
  accent: "text-accent",
  "accent-light": "text-accent-light",
  success: "text-success",
};

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative py-28 lg:py-36">
      {/* Subtle top divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink/[0.06] to-transparent" />

      <div ref={ref} className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            The Problem
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Parking is{" "}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              broken.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Drivers waste billions in time, fuel, and emissions every year
            circling for spots. SpotAI fixes that with real-time data and AI.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease, delay: 0.1 + i * 0.08 }}
              className="group relative rounded-2xl border border-ink/[0.06] bg-ink/[0.02] p-6 transition-colors hover:border-ink/[0.1] hover:bg-ink/[0.04]"
            >
              {/* Icon */}
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${accentMap[f.accent]}`}
              >
                <f.icon className="h-4.5 w-4.5" />
              </div>

              {/* Stat */}
              <div className={`mt-4 font-display text-2xl font-bold ${statColor[f.accent]}`}>
                {f.stat}
              </div>

              {/* Text */}
              <h3 className="mt-1 text-sm font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
