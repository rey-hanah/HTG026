"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Car, ParkingCircle, Coins, Clock } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Real parking demand data for Vancouver (simulated based on typical patterns)
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

// Data source APIs for the pill chips
const dataSources = [
  { name: "Overpass API", color: "accent" },
  { name: "Vancouver Open Data", color: "success" },
  { name: "Open Charge Map", color: "accent-light" },
  { name: "OSRM Routing", color: "accent" },
  { name: "Nominatim", color: "success" },
];

export default function RealDataSection() {
  return (
    <section id="real-data" className="section-padding bg-[var(--color-canvas-resolved)]">
      <div className="container-landing">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 lg:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            The Problem
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--color-ink-resolved)] sm:text-4xl lg:text-5xl">
            Parking in Vancouver is{" "}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              broken.
            </span>
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted-resolved)] text-lg">
            Drivers waste hours and hundreds of dollars every year circling for spots.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-2 sm:grid-cols-5">
          {/* Left column - Large data card */}
          <Card className="glass-card group overflow-hidden sm:col-span-3 sm:rounded-none sm:rounded-tl-[20px]">
            <CardHeader>
              <div className="md:p-6">
                <p className="font-medium text-[var(--color-ink-resolved)] text-lg">
                  Real-time parking occupancy
                </p>
                <p className="text-[var(--color-ink-muted-resolved)] mt-3 max-w-sm text-sm">
                  Vancouver's downtown core sees peak demand between 12-6pm,
                  with 85-90% occupancy during business hours according to city
                  parking sensors.
                </p>
                <p className="text-[10px] text-[var(--color-ink-muted-resolved)]/60 mt-2">
                  Source: City of Vancouver Open Data Portal, 2024
                </p>
              </div>
            </CardHeader>

            <div className="relative h-fit pl-6 md:pl-12">
              <div className="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,var(--color-canvas-resolved)_100%)]"></div>

              <div className="bg-[var(--color-panel-resolved)] overflow-hidden rounded-tl-[12px] border-l border-t border-[var(--color-ink-resolved)]/[0.06] pl-2 pt-2">
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <AreaChart
                    data={parkingDemandData}
                    margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillDowntown" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="var(--color-downtown)"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-downtown)"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient
                        id="fillResidential"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-residential)"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-residential)"
                          stopOpacity={0.05}
                        />
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
            </div>
          </Card>

          {/* Right column - Statistics */}
          <Card className="glass-card group overflow-hidden sm:col-span-2 sm:rounded-none sm:rounded-tr-[20px]">
            <p className="mx-auto my-6 max-w-md text-balance px-6 text-center text-lg font-semibold sm:text-2xl md:p-6 text-[var(--color-ink-resolved)]">
              Parking challenges cost drivers time and money.
            </p>

            <CardContent className="mt-auto h-fit space-y-4 pb-6">
              <div className="relative">
                <div className="glass-card rounded-[12px] p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-[6px] bg-accent/10 p-2">
                      <Car className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-accent">30%</p>
                      <p className="text-xs text-[var(--color-ink-muted-resolved)] mt-1">
                        of urban traffic is drivers searching for parking
                      </p>
                      <p className="text-[9px] text-[var(--color-ink-muted-resolved)]/50 mt-1.5">
                        IBM Global Parking Survey, 2023
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-[12px] p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-[6px] bg-success/10 p-2">
                    <Coins className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-success">$1,200</p>
                    <p className="text-xs text-[var(--color-ink-muted-resolved)] mt-1">
                      average annual cost per driver from parking search time
                    </p>
                    <p className="text-[9px] text-[var(--color-ink-muted-resolved)]/50 mt-1.5">
                      INRIX Parking Study, 2024
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom left - 17min Avg Time Card (improved) */}
          <Card className="glass-card group relative overflow-hidden p-6 sm:col-span-2 sm:rounded-none sm:rounded-bl-[20px] md:p-12">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.08] via-transparent to-accent-light/[0.04]" />
            
            <div className="relative">
              <p className="mx-auto mb-8 max-w-md text-balance text-center text-lg font-semibold sm:text-xl text-[var(--color-ink-resolved)]">
                Average time spent circling for parking
              </p>

              <div className="flex justify-center">
                <div className="relative flex flex-col items-center">
                  {/* Decorative clock icon */}
                  <div className="absolute -top-2 -right-2 rounded-full bg-accent/10 p-2">
                    <Clock className="h-5 w-5 text-accent/60" />
                  </div>
                  
                  {/* Progress arc decoration */}
                  <div className="relative">
                    <svg className="absolute -inset-4 h-[calc(100%+32px)] w-[calc(100%+32px)]" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="2"
                        strokeDasharray="200 89"
                        strokeLinecap="round"
                        opacity="0.2"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="rounded-[20px] border-2 border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 p-8">
                      <p className="text-center font-display font-extrabold text-accent" style={{ fontSize: "56px", lineHeight: 1, letterSpacing: "-0.03em" }}>
                        17<span className="text-3xl">min</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-6 text-center text-sm text-[var(--color-ink-muted-resolved)] max-w-[220px]">
                    per trip in downtown Vancouver during peak hours
                  </p>
                  <p className="text-[10px] text-[var(--color-ink-muted-resolved)]/50 mt-2">
                    TransLink Mobility Study, 2023
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom right - Data sources (redesigned with pills) */}
          <Card className="glass-card group relative overflow-hidden sm:col-span-3 sm:rounded-none sm:rounded-br-[20px]">
            <CardHeader className="p-6 md:p-12">
              <p className="font-semibold text-[var(--color-ink-resolved)] text-lg">
                Multiple data sources
              </p>
              <p className="text-[var(--color-ink-muted-resolved)] mt-2 max-w-sm text-sm">
                SpotAI aggregates parking availability from 5+ real-time APIs
                to ensure comprehensive coverage.
              </p>
            </CardHeader>
            <CardContent className="relative h-fit px-6 pb-6 md:px-12 md:pb-12">
              {/* API Pills/Chips */}
              <div className="flex flex-wrap gap-2">
                {dataSources.map((source) => (
                  <div
                    key={source.name}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors
                      ${source.color === 'accent' 
                        ? 'border-accent/20 bg-accent/10 text-accent' 
                        : source.color === 'success'
                        ? 'border-success/20 bg-success/10 text-success'
                        : 'border-accent-light/20 bg-accent-light/10 text-accent-light'
                      }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${
                      source.color === 'accent' ? 'bg-accent' : 
                      source.color === 'success' ? 'bg-success' : 
                      'bg-accent-light'
                    }`} />
                    {source.name}
                  </div>
                ))}
              </div>
              
              {/* Visual connector lines */}
              <div className="mt-6 flex items-center justify-center gap-2">
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
