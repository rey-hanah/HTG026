"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Car, ParkingCircle, Coins, Clock } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const parkingDemandData = [
  { time: "6am", downtown: 15, residential: 45 },
  { time: "8am", downtown: 82, residential: 38 },
  { time: "10am", downtown: 75, residential: 32 },
  { time: "12pm", downtown: 88, residential: 28 },
  { time: "2pm", downtown: 79, residential: 31 },
  { time: "4pm", downtown: 91, residential: 52 },
  { time: "6pm", downtown: 68, residential: 71 },
  { time: "8pm", downtown: 45, residential: 85 },
  { time: "10pm", downtown: 28, residential: 76 },
];

const chartConfig = {
  downtown: {
    label: "Downtown",
    color: "var(--color-accent)",
  },
  residential: {
    label: "Residential",
    color: "var(--color-success)",
  },
} satisfies ChartConfig;

const dataSources = [
  { name: "Overpass API", color: "accent" as const },
  { name: "Vancouver Open Data", color: "success" as const },
  { name: "Open Charge Map", color: "accent-light" as const },
  { name: "OSRM Routing", color: "accent" as const },
  { name: "Nominatim", color: "success" as const },
];

export default function RealDataSection() {
  return (
    <section id="real-data" className="section-padding bg-[var(--color-canvas-resolved)]">
      <div className="container-landing">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 lg:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Built on Real Data
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--color-ink-resolved)] sm:text-4xl lg:text-5xl">
            The parking problem,{" "}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              quantified.
            </span>
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted-resolved)] text-lg">
            Vancouver drivers lose 17 minutes and $1,200 a year to parking. We built SpotAI to fix that.
          </p>
        </div>

        {/* Bento grid — 2 rows, responsive */}
        <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-2">

          {/* ─── Top left: Occupancy chart ─── */}
          <Card className="glass-card group overflow-hidden rounded-[20px]">
            <CardHeader className="p-6 pb-0 md:p-8 md:pb-0">
              <p className="font-medium text-[var(--color-ink-resolved)] text-lg">
                Real-time parking occupancy
              </p>
              <p className="text-[var(--color-ink-muted-resolved)] mt-2 max-w-sm text-sm leading-relaxed">
                Downtown Vancouver hits 85-90% occupancy between 12-6pm.
                Finding a spot during peak hours is a gamble.
              </p>
              <p className="text-[10px] text-[var(--color-ink-muted-resolved)]/60 mt-2">
                Source: City of Vancouver Open Data Portal, 2024
              </p>
            </CardHeader>

            <div className="relative h-fit px-6 pt-4 pb-2 md:px-8">
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <AreaChart
                  data={parkingDemandData}
                  margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                >
                  <defs>
                    <linearGradient id="fillDowntown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-downtown)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-downtown)" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="fillResidential" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-residential)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-residential)" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-[var(--color-ink-resolved)]/[0.06]"
                  />
                  <XAxis
                    dataKey="time"
                    className="text-[10px] fill-[var(--color-ink-muted-resolved)]"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-[10px] fill-[var(--color-ink-muted-resolved)]"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent className="bg-[var(--color-panel-resolved)] border-[var(--color-ink-resolved)]/[0.06]" />
                    }
                  />
                  <Area
                    strokeWidth={2}
                    dataKey="residential"
                    type="monotone"
                    fill="url(#fillResidential)"
                    fillOpacity={1}
                    stroke="var(--color-residential)"
                  />
                  <Area
                    strokeWidth={2}
                    dataKey="downtown"
                    type="monotone"
                    fill="url(#fillDowntown)"
                    fillOpacity={1}
                    stroke="var(--color-downtown)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </Card>

          {/* ─── Top right: Stats stack ─── */}
          <div className="flex flex-col gap-3">
            {/* 17 min card */}
            <Card className="glass-card group relative flex-1 overflow-hidden rounded-[20px] p-6 md:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-transparent to-transparent" />
              <div className="relative flex items-center gap-6">
                {/* Circle with number */}
                <div className="relative shrink-0">
                  <svg className="h-24 w-24" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="var(--brand-accent)"
                      strokeWidth="3"
                      strokeDasharray="185 79"
                      strokeLinecap="round"
                      opacity="0.2"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-3xl font-extrabold tracking-tight text-accent">
                      17<span className="text-lg">m</span>
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-ink-resolved)]">
                    Average time circling
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted-resolved)]">
                    Per trip in downtown Vancouver during peak hours
                  </p>
                  <p className="text-[9px] text-[var(--color-ink-muted-resolved)]/50 mt-2">
                    TransLink Mobility Study, 2023
                  </p>
                </div>
              </div>
            </Card>

            {/* 30% card */}
            <Card className="glass-card group overflow-hidden rounded-[20px] p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
                  <Car className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">30%</p>
                  <p className="text-sm text-[var(--color-ink-muted-resolved)] mt-0.5">
                    of urban traffic is drivers searching for parking
                  </p>
                  <p className="text-[9px] text-[var(--color-ink-muted-resolved)]/50 mt-1">
                    IBM Global Parking Survey, 2023
                  </p>
                </div>
              </div>
            </Card>

            {/* $1,200 card */}
            <Card className="glass-card group overflow-hidden rounded-[20px] p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-success/10">
                  <Coins className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">$1,200</p>
                  <p className="text-sm text-[var(--color-ink-muted-resolved)] mt-0.5">
                    average annual cost per driver from parking search time
                  </p>
                  <p className="text-[9px] text-[var(--color-ink-muted-resolved)]/50 mt-1">
                    INRIX Parking Study, 2024
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* ─── Bottom full-width: Data sources ─── */}
          <Card className="glass-card group relative overflow-hidden rounded-[20px] md:col-span-2">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-sm">
                  <p className="font-semibold text-[var(--color-ink-resolved)] text-lg">
                    5 data sources. One search.
                  </p>
                  <p className="text-[var(--color-ink-muted-resolved)] mt-2 text-sm leading-relaxed">
                    SpotAI aggregates parking availability from 5 real-time APIs
                    to ensure nothing is missed.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {dataSources.map((source) => (
                    <div
                      key={source.name}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium
                        ${source.color === "accent"
                          ? "border-accent/20 bg-accent/10 text-accent"
                          : source.color === "success"
                          ? "border-success/20 bg-success/10 text-success"
                          : "border-accent-light/20 bg-accent-light/10 text-accent-light"
                        }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          source.color === "accent"
                            ? "bg-accent"
                            : source.color === "success"
                            ? "bg-success"
                            : "bg-accent-light"
                        }`}
                      />
                      {source.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector */}
              <div className="mt-6 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-ink-resolved)]/10 to-transparent" />
                <div className="flex items-center gap-2 rounded-full border border-[var(--color-ink-resolved)]/10 bg-[var(--color-panel-resolved)] px-4 py-1.5">
                  <ParkingCircle className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-[var(--color-ink-resolved)]">SpotAI Engine</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-ink-resolved)]/10 to-transparent" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
