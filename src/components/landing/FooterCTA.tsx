"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, MapPin, Github } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function FooterCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <footer className="relative">
      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden py-28 lg:py-36">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-ink-resolved)]/[0.06] to-transparent" />

        {/* Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-[140px]" />
        </div>

        <div ref={ref} className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Ready?
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--color-ink-resolved)] sm:text-4xl lg:text-5xl">
              Stop circling.{" "}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                Start parking.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[var(--color-ink-muted-resolved)]">
              Try SpotAI now — enter any Vancouver destination and get an
              AI-ranked parking recommendation in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/map"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-accent-light hover:scale-[1.02] active:scale-[0.98]"
            >
              Find Parking Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink-resolved)]/10 bg-[var(--color-ink-resolved)]/[0.03] px-6 py-4 text-sm font-semibold text-[var(--color-ink-resolved)] transition-colors hover:bg-[var(--color-ink-resolved)]/[0.06]"
            >
              <Github className="h-4 w-4" />
              View Source
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[var(--color-ink-resolved)]/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-accent/20 bg-accent/10">
              <MapPin className="h-3 w-3 text-accent" />
            </div>
            <span className="font-display text-sm font-semibold text-[var(--color-ink-resolved)]">
              SpotAI
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-xs text-[var(--color-ink-muted-resolved)] transition-colors hover:text-[var(--color-ink-resolved)]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-xs text-[var(--color-ink-muted-resolved)] transition-colors hover:text-[var(--color-ink-resolved)]"
            >
              How it Works
            </a>
            <Link
              href="/map"
              className="text-xs text-accent transition-colors hover:text-accent-light"
            >
              Open Map
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
