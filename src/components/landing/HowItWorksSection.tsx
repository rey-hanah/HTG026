"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Layers, Brain, Navigation } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Enter Your Destination",
    description:
      "Type any address or landmark in Vancouver. We geocode it instantly with Nominatim and center the map.",
    color: "accent",
  },
  {
    num: "02",
    icon: Layers,
    title: "We Search 5 APIs at Once",
    description:
      "Overpass, Vancouver Open Data, Open Charge Map, and more — we query free street spots, paid lots, and EV chargers simultaneously.",
    color: "accent-light",
  },
  {
    num: "03",
    icon: Brain,
    title: "Gemini AI Ranks Results",
    description:
      "Our AI considers time of day, walk distance, pricing, and availability patterns to recommend the best option for you.",
    color: "success",
  },
  {
    num: "04",
    icon: Navigation,
    title: "Navigate to Your Spot",
    description:
      "One tap opens walking directions in Google Maps. You save time, money, and emissions — every single trip.",
    color: "accent",
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; num: string }> = {
  accent: {
    border: "border-accent/20",
    bg: "bg-accent/[0.06]",
    text: "text-accent",
    num: "text-accent/30",
  },
  "accent-light": {
    border: "border-accent-light/20",
    bg: "bg-accent-light/[0.06]",
    text: "text-accent-light",
    num: "text-accent-light/30",
  },
  success: {
    border: "border-success/20",
    bg: "bg-success/[0.06]",
    text: "text-success",
    num: "text-success/30",
  },
};

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="relative py-28 lg:py-36">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink/[0.06] to-transparent" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.02] blur-[160px]" />

      <div ref={ref} className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            How It Works
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Four steps.{" "}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              Zero stress.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            From search to parked in under a minute.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const c = colorMap[step.color];
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease, delay: 0.15 + i * 0.1 }}
                className="group relative"
              >
                {/* Connector line (not on last card) */}
                {i < steps.length - 1 && (
                  <div className="pointer-events-none absolute right-0 top-12 hidden h-px w-6 translate-x-full bg-ink/[0.08] lg:block" />
                )}

                <div
                  className={`relative rounded-2xl border ${c.border} bg-ink/[0.02] p-6 transition-colors hover:bg-ink/[0.04]`}
                >
                  {/* Step number watermark */}
                  <span
                    className={`absolute top-4 right-5 font-display text-4xl font-bold ${c.num}`}
                  >
                    {step.num}
                  </span>

                  {/* Icon */}
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${c.border} ${c.bg}`}
                  >
                    <step.icon className={`h-4.5 w-4.5 ${c.text}`} />
                  </div>

                  {/* Text */}
                  <h3 className="mt-5 text-base font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
