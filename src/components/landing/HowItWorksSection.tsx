"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Layers, Brain, Navigation } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Enter Your Destination",
    description:
      "Type any address or landmark in Vancouver. We geocode it instantly with Nominatim and center the map on your destination — ready to search for parking in the area.",
    icon: Search,
    color: "accent",
  },
  {
    number: "02",
    title: "We Search 5 APIs at Once",
    description:
      "Overpass, Vancouver Open Data, Open Charge Map, OSRM, and more — we query free street spots, paid lots, and EV chargers simultaneously so no option goes unnoticed.",
    icon: Layers,
    color: "accent-light",
  },
  {
    number: "03",
    title: "Gemini AI Ranks Results",
    description:
      "Our AI considers time of day, walk distance, pricing, and availability patterns to recommend the single best option for your specific situation — not just the closest spot.",
    icon: Brain,
    color: "success",
  },
  {
    number: "04",
    title: "Navigate to Your Spot",
    description:
      "One tap opens walking directions in Google Maps. You save time, money, and emissions — every single trip. From search to parked in under a minute.",
    icon: Navigation,
    color: "accent",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const Icon = step.icon;
  const colorClass = step.color === "accent" 
    ? "text-accent bg-accent/10 border-accent/20" 
    : step.color === "accent-light"
    ? "text-accent-light bg-accent-light/10 border-accent-light/20"
    : "text-success bg-success/10 border-success/20";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid gap-6 md:grid-cols-[auto_1fr] md:gap-8"
    >
      {/* Timeline connector */}
      <div className="hidden md:flex flex-col items-center">
        {/* Number circle */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${colorClass}`}>
          <span className="text-sm font-bold">{step.number}</span>
        </div>
        {/* Vertical line */}
        {index < steps.length - 1 && (
          <div className="mt-4 h-full w-px bg-gradient-to-b from-[var(--color-ink-resolved)]/10 to-transparent" />
        )}
      </div>

      {/* Content card */}
      <div className="glass-card rounded-[20px] p-6 md:p-8">
        <div className="flex items-start gap-4">
          {/* Mobile number */}
          <div className={`flex md:hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border ${colorClass}`}>
            <span className="text-xs font-bold">{step.number}</span>
          </div>
          
          {/* Icon */}
          <div className={`hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h3 className="font-display text-xl font-bold text-[var(--color-ink-resolved)] md:text-2xl">
              {step.title}
            </h3>
            <p className="mt-3 text-[var(--color-ink-muted-resolved)] leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-landing">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-12 lg:mb-16">
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

        {/* Timeline */}
        <div className="mx-auto max-w-3xl space-y-6 md:space-y-0">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
