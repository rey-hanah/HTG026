"use client";

import { Area, AreaChart, CartesianGrid } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { MapPin, Clock, Sparkles, Car } from "lucide-react";

// ── Chart data: parking searches by hour ──
const chartData = [
  { hour: "6am", searches: 120 },
  { hour: "8am", searches: 580 },
  { hour: "10am", searches: 420 },
  { hour: "12pm", searches: 670 },
  { hour: "2pm", searches: 510 },
  { hour: "4pm", searches: 720 },
  { hour: "6pm", searches: 890 },
  { hour: "8pm", searches: 540 },
  { hour: "10pm", searches: 310 },
];

const chartConfig = {
  searches: {
    label: "Parking Searches",
    color: "var(--color-accent)",
  },
} satisfies ChartConfig;

// ── Dotted map (Vancouver area) ──
function VancouverDotMap() {
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
      {/* Simple SVG dot map representing Vancouver area */}
      <svg viewBox="0 0 200 120" className="h-full w-full opacity-40" fill="none">
        {/* Grid of dots */}
        {Array.from({ length: 15 }).map((_, row) =>
          Array.from({ length: 25 }).map((_, col) => {
            const x = col * 8 + 4;
            const y = row * 8 + 4;
            // Create a rough coastline shape
            const isLand =
              y > 20 &&
              y < 100 &&
              x > 20 &&
              x < 180 &&
              !(x < 60 && y < 40) &&
              !(x > 150 && y > 80);
            if (!isLand) return null;
            return (
              <circle
                key={`${row}-${col}`}
                cx={x}
                cy={y}
                r="1.2"
                className="fill-[var(--color-ink-muted-resolved)]/50"
              />
            );
          })
        )}
        {/* Highlighted points for parking hotspots */}
        <circle cx="100" cy="55" r="3" className="fill-accent" opacity="0.8" />
        <circle cx="100" cy="55" r="6" className="fill-accent" opacity="0.2" />
        <circle cx="80" cy="65" r="2.5" className="fill-success" opacity="0.7" />
        <circle cx="80" cy="65" r="5" className="fill-success" opacity="0.15" />
        <circle cx="120" cy="48" r="2" className="fill-accent-light" opacity="0.6" />
        <circle cx="120" cy="48" r="4.5" className="fill-accent-light" opacity="0.15" />
      </svg>

      {/* Label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <span className="text-[10px] font-medium text-[var(--color-ink-muted-resolved)]">Vancouver</span>
      </div>
    </div>
  );
}

// ── Chat / AI preview card ──
function AiPreviewCard() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-4">
      {/* User message */}
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-accent/10 px-3 py-2">
        <p className="text-xs text-[var(--color-ink-resolved)]">
          Find parking near Cafe Medina
        </p>
      </div>
      {/* AI response */}
      <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-success/15 bg-success/[0.05] px-3 py-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="h-3 w-3 text-success" />
          <span className="text-[10px] font-semibold text-success">SpotAI</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--color-ink-muted-resolved)]">
          Found 12 spots. Best: street parking on Cambie St — free, 2 min walk, likely available.
        </p>
      </div>
    </div>
  );
}

// ── Stat block ──
function StatBlock({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex h-full flex-col justify-center p-4 text-center">
      <div className="font-display text-4xl font-bold text-accent">{value}</div>
      <div className="mt-1 text-sm font-medium text-[var(--color-ink-resolved)]">{label}</div>
      <div className="mt-0.5 text-xs text-[var(--color-ink-muted-resolved)]">{detail}</div>
    </div>
  );
}

export default function DataSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Real Data
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            The numbers behind{" "}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              smarter parking.
            </span>
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted-resolved)]">
            Live API data, AI processing, and city-wide coverage.
          </p>
        </div>

        {/* Bento grid */}
        <div className="mx-auto mt-16 grid gap-4 md:grid-cols-6">
          {/* ── Row 1 ── */}

          {/* Dotted map — 3 cols */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02] md:col-span-3 h-64">
            <VancouverDotMap />
          </div>

          {/* AI chat preview — 3 cols */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02] md:col-span-3 h-64">
            <AiPreviewCard />
          </div>

          {/* ── Row 2 ── */}

          {/* Uptime / Coverage stat — 2 cols */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02] md:col-span-2 h-48">
            <StatBlock value="5" label="Live APIs" detail="Queried simultaneously" />
          </div>

          {/* Chart — 4 cols */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02] md:col-span-4 h-48">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 px-4 pt-3">
                <Car className="h-3.5 w-3.5 text-[var(--color-ink-muted-resolved)]" />
                <span className="text-xs font-medium text-[var(--color-ink-muted-resolved)]">
                  Parking search demand by hour
                </span>
              </div>
              <div className="flex-1 px-2 pb-2">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      className="stroke-ink/[0.06]"
                    />
                    <Area
                      type="monotone"
                      dataKey="searches"
                      stroke="var(--color-accent)"
                      fill="var(--color-accent)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
          </div>

          {/* ── Row 3 — three small stat cards ── */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02] md:col-span-2 h-40">
            <div className="flex h-full flex-col items-center justify-center p-4">
              <MapPin className="h-5 w-5 text-accent mb-2" />
              <div className="font-display text-2xl font-bold text-[var(--color-ink-resolved)]">500+</div>
              <div className="text-xs text-[var(--color-ink-muted-resolved)]">Parking spots indexed</div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02] md:col-span-2 h-40">
            <div className="flex h-full flex-col items-center justify-center p-4">
              <Clock className="h-5 w-5 text-success mb-2" />
              <div className="font-display text-2xl font-bold text-[var(--color-ink-resolved)]">&lt;3s</div>
              <div className="text-xs text-[var(--color-ink-muted-resolved)]">Average search time</div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02] md:col-span-2 h-40">
            <div className="flex h-full flex-col items-center justify-center p-4">
              <Sparkles className="h-5 w-5 text-accent-light mb-2" />
              <div className="font-display text-2xl font-bold text-[var(--color-ink-resolved)]">98%</div>
              <div className="text-xs text-[var(--color-ink-muted-resolved)]">AI confidence score</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
