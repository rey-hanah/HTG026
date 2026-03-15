"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, MapPin, Github, ExternalLink } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

// Footer navigation links
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Real Data", href: "#real-data" },
];

const externalLinks = [
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "Vancouver Open Data", href: "https://opendata.vancouver.ca", icon: ExternalLink },
  { label: "Open Charge Map", href: "https://openchargemap.org", icon: ExternalLink },
];

export default function FooterCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <footer className="relative">
      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-ink-resolved)]/[0.06] to-transparent" />

        {/* Card-like treatment with accent tint */}
        <div className="container-landing">
          <div
            ref={ref}
            className="glass-card relative mx-auto max-w-4xl rounded-[20px] px-8 py-12 text-center md:px-12 md:py-16"
            style={{ background: "linear-gradient(135deg, rgba(var(--accent-rgb), 0.04) 0%, rgba(var(--accent-rgb), 0.02) 100%)" }}
          >
            {/* Subtle glow behind */}
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[100px]" />
            </div>

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
        </div>
      </section>

      {/* ── 3-Column Footer ── */}
      <div className="border-t border-[var(--color-ink-resolved)]/[0.06]">
        <div className="container-landing py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-3 md:gap-12">
            {/* Column 1: Logo + Tagline */}
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-accent/20 bg-accent/10">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <span className="font-display text-lg font-semibold text-[var(--color-ink-resolved)]">
                  SpotAI
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-ink-muted-resolved)]">
                AI-powered parking search for Vancouver. Find street spots, paid lots, and EV chargers in seconds.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-muted-resolved)]">
                Navigation
              </h4>
              <ul className="mt-4 space-y-3">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--color-ink-resolved)]/80 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link
                    href="/map"
                    className="text-sm font-medium text-accent transition-colors hover:text-accent-light"
                  >
                    Open Map
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: External Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-muted-resolved)]">
                Resources
              </h4>
              <ul className="mt-4 space-y-3">
                {externalLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-resolved)]/80 transition-colors hover:text-accent"
                    >
                      <link.icon className="h-3.5 w-3.5" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-ink-resolved)]/[0.06] pt-8 sm:flex-row">
            <p className="text-xs text-[var(--color-ink-muted-resolved)]">
              Built for Vancouver drivers, at a hackathon, in one night.
            </p>
            <p className="text-xs text-[var(--color-ink-muted-resolved)]">
              Powered by Vancouver Open Data, OpenStreetMap, and Gemini AI.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
