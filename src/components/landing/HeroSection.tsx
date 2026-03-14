"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Clock,
  Car,
  Zap,
  Sparkles,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const fade = (i: number) => ({
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease, delay: 0.15 + i * 0.12 },
  },
});

const stats = [
  { value: "17 hrs", label: "wasted yearly searching", icon: Clock },
  { value: "30%", label: "of city traffic is parking", icon: Car },
  { value: "$345", label: "annual cost per driver", icon: Zap },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "calc(100vh - 72px)" }}>
      {/* ── Atmosphere ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,145,92,0.06),transparent)]" />
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-accent/[0.03] blur-[160px]" />
        <div className="absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-accent/[0.02] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-ink-muted-resolved,.4) 1px,transparent 1px),linear-gradient(90deg,var(--color-ink-muted-resolved,.4) 1px,transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="container-landing relative z-10 flex min-h-[inherit] flex-col justify-center pb-24 pt-32 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[55%_45%] lg:gap-16">

          {/* ── Left: Copy (55%) ── */}
          <div className="space-y-8">
            <motion.div variants={fade(0)} initial="hidden" animate="visible">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                <Sparkles className="h-3 w-3" />
                AI-Powered Parking
              </span>
            </motion.div>

            <motion.h1
              variants={fade(1)}
              initial="hidden"
              animate="visible"
              className="font-display font-extrabold leading-[1.05] text-[var(--color-ink-resolved)]"
              style={{
                fontSize: "clamp(48px, 8vw, 72px)",
                letterSpacing: "-0.03em",
              }}
            >
              Find Parking
              <br />
              in Seconds,{" "}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                Not&nbsp;Minutes.
              </span>
            </motion.h1>

            <motion.p
              variants={fade(2)}
              initial="hidden"
              animate="visible"
              className="max-w-lg text-lg leading-relaxed text-[var(--color-ink-muted-resolved)]"
            >
              SpotAI searches every free street spot, paid lot, and EV charger
              near your destination&nbsp;— then uses AI to recommend the best one.
            </motion.p>

            <motion.div
              variants={fade(3)}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/map"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-accent-light hover:scale-[1.02] active:scale-[0.98]"
              >
                Find Parking Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-ink-resolved)]/10 bg-[var(--color-ink-resolved)]/[0.03] px-8 py-4 text-sm font-semibold text-[var(--color-ink-resolved)] backdrop-blur-sm transition-colors hover:bg-[var(--color-ink-resolved)]/[0.06] hover:border-[var(--color-ink-resolved)]/[0.15]"
              >
                See How it Works
              </a>
            </motion.div>
          </div>

          {/* ── Right: Interactive Map Card (45%) ── */}
          <motion.div
            variants={fade(2)}
            initial="hidden"
            animate="visible"
            className="flex justify-center lg:justify-end"
          >
            <MapCard />
          </motion.div>
        </div>

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1, ease }}
          className="mt-24 flex flex-wrap items-center justify-center gap-8 border-t border-[var(--color-ink-resolved)]/[0.06] pt-10 lg:gap-16"
        >
          {stats.map((s) => (
            <div key={s.label} className="glass-card flex items-center gap-3 rounded-lg px-4 py-3">
              <s.icon className="h-4 w-4 text-accent" />
              <div>
                <span className="text-xl font-bold text-[var(--color-ink-resolved)]">{s.value}</span>
                <span className="ml-2 text-sm text-[var(--color-ink-muted-resolved)]">{s.label}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MapCard — small by default, expands on click
   ───────────────────────────────────────────── */

const cardStats = [
  { label: "Walk", value: "2 min", cls: "text-success" },
  { label: "Spots", value: "12", cls: "text-accent-light" },
  { label: "AI Match", value: "98%", cls: "text-accent" },
];

function MapCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-80, 80], [6, -6]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-80, 80], [-6, 6]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  return (
    <div className="relative">
      <motion.div
        ref={containerRef}
        className="cursor-pointer select-none"
        style={{ perspective: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => setExpanded(!expanded)}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="glass-card relative overflow-hidden rounded-[20px]"
          animate={{
            width: expanded ? 380 : 300,
            height: expanded ? "auto" : 220,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        >
          {/* Hover glow */}
          <motion.div
            className="pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-accent/10 via-transparent to-accent/5"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-panel-resolved)]/20 via-transparent to-[var(--color-panel-resolved)]/40" />

          {/* ── Map visual area ── */}
          <div className="relative">
            <motion.div
              className="relative overflow-hidden"
              animate={{ height: expanded ? 180 : 120 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-[var(--color-panel-resolved)]" />

              {/* Grid pattern (collapsed) */}
              <AnimatePresence>
                {!expanded && (
                  <motion.div
                    className="absolute inset-0 opacity-[0.04]"
                    initial={{ opacity: 0.04 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="hero-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--color-ink-resolved)]" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#hero-grid)" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expanded: animated road map */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="absolute inset-0 bg-[var(--color-panel-light-resolved)]" />
                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                      <motion.line x1="0%" y1="35%" x2="100%" y2="35%" stroke="rgba(107,114,128,0.15)" strokeWidth="4"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
                      <motion.line x1="0%" y1="65%" x2="100%" y2="65%" stroke="rgba(107,114,128,0.15)" strokeWidth="4"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
                      <motion.line x1="30%" y1="0%" x2="30%" y2="100%" stroke="rgba(107,114,128,0.12)" strokeWidth="3"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.4 }} />
                      <motion.line x1="70%" y1="0%" x2="70%" y2="100%" stroke="rgba(107,114,128,0.12)" strokeWidth="3"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.5 }} />
                      {[20, 50, 80].map((y, i) => (
                        <motion.line key={`h-${i}`} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="rgba(107,114,128,0.06)" strokeWidth="1.5"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }} />
                      ))}
                      {[15, 45, 55, 85].map((x, i) => (
                        <motion.line key={`v-${i}`} x1={`${x}%`} y1="0%" x2={`${x}%`} y2="100%" stroke="rgba(107,114,128,0.06)" strokeWidth="1.5"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }} />
                      ))}
                    </svg>

                    {/* Building blocks */}
                    <motion.div className="absolute top-[40%] left-[10%] h-[20%] w-[15%] rounded-sm border border-gray-400/10 bg-gray-400/15"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
                    <motion.div className="absolute top-[15%] left-[35%] h-[15%] w-[12%] rounded-sm border border-gray-400/10 bg-gray-400/12"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.6 }} />
                    <motion.div className="absolute top-[70%] left-[75%] h-[18%] w-[18%] rounded-sm border border-gray-400/10 bg-gray-400/14"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.7 }} />
                    <motion.div className="absolute top-[20%] right-[10%] h-[25%] w-[10%] rounded-sm border border-gray-400/10 bg-gray-400/10"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.55 }} />

                    {/* Gradient fade at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--color-panel-resolved)] via-[var(--color-panel-resolved)]/60 to-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pin — always visible */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="relative"
                  animate={{ scale: expanded ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {expanded && (
                    <motion.span
                      className="absolute -inset-4 rounded-full bg-accent/15"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-accent/30 bg-accent/10 backdrop-blur-sm shadow-lg shadow-accent/10">
                    <MapPin className="h-4 w-4 text-accent" />
                  </span>
                </motion.div>
              </div>

              {/* Map icon + live badge (collapsed only) */}
              <AnimatePresence>
                {!expanded && (
                  <motion.div
                    className="absolute top-3 left-3 flex items-center gap-2"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" className="text-success">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                      <line x1="9" x2="9" y1="3" y2="18" />
                      <line x1="15" x2="15" y1="6" y2="21" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-ink-resolved)]/[0.05] px-2 py-0.5 backdrop-blur-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-[9px] font-medium uppercase tracking-wide text-[var(--color-ink-muted-resolved)]">Live</span>
                </div>
              </div>
            </motion.div>

            {/* ── Card info ── */}
            <div className="relative z-10 p-4">
              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span className="text-sm font-medium text-[var(--color-ink-resolved)]/80">Cafe Medina, Vancouver</span>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="my-3 h-px bg-[var(--color-ink-resolved)]/[0.06]" />

                    {/* Mini stats */}
                    <div className="grid grid-cols-3 gap-2">
                      {cardStats.map((s) => (
                        <div key={s.label} className="rounded-lg border border-[var(--color-ink-resolved)]/[0.04] bg-[var(--color-ink-resolved)]/[0.02] px-2.5 py-2 text-center">
                          <div className={`text-sm font-bold ${s.cls}`}>{s.value}</div>
                          <div className="text-[9px] uppercase tracking-wider text-[var(--color-ink-muted-resolved)]">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* AI snippet */}
                    <div className="mt-3 rounded-lg border border-success/10 bg-success/[0.03] px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Sparkles className="h-3 w-3 text-success" />
                        <span className="font-medium text-success">AI Recommended</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-ink-muted-resolved)]">
                        &ldquo;Street parking on Cambie St — free, 2 min walk, likely available at this hour.&rdquo;
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Animated underline */}
              <motion.div
                className="mt-2 h-px bg-gradient-to-r from-accent/40 via-accent/20 to-transparent"
                animate={{ scaleX: hovered || expanded ? 1 : 0.3, originX: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Click hint */}
      <motion.p
        className="mt-3 text-center text-[10px] text-[var(--color-ink-muted-resolved)]"
        initial={{ opacity: 0 }}
        animate={{
          opacity: hovered && !expanded ? 0.8 : 0,
          y: hovered && !expanded ? 0 : 4,
        }}
        transition={{ duration: 0.2 }}
      >
        Click to {expanded ? "collapse" : "expand"}
      </motion.p>

      {/* Ambient glow behind card */}
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-accent/[0.03] blur-[80px]" />
    </div>
  );
}
