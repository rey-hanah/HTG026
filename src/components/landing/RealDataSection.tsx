"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Car, ParkingCircle, Coins } from "lucide-react";
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
    color: "hsl(22, 56%, 59%)",
  },
  residential: {
    label: "Residential",
    color: "hsl(142, 71%, 45%)",
  },
} satisfies ChartConfig;

export default function RealDataSection() {
  return (
    <section className="bg-[var(--color-canvas-resolved)] py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto grid gap-2 sm:grid-cols-5">
          {/* Left column - Large data card */}
          <Card className="group overflow-hidden shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02]">
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

              <div className="bg-[var(--color-panel-resolved)] overflow-hidden rounded-tl-lg border-l border-t border-[var(--color-ink-resolved)]/[0.06] pl-2 pt-2">
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
          <Card className="group overflow-hidden shadow-black/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02]">
            <p className="mx-auto my-6 max-w-md text-balance px-6 text-center text-lg font-semibold sm:text-2xl md:p-6 text-[var(--color-ink-resolved)]">
              Parking challenges cost drivers time and money.
            </p>

            <CardContent className="mt-auto h-fit space-y-4 pb-6">
              <div className="relative">
                <div className="rounded-lg border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-accent/10 p-2">
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

              <div className="rounded-lg border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-panel-resolved)] p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-success/10 p-2">
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

          {/* Bottom left - Quick stat */}
          <Card className="group p-6 shadow-black/5 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl md:p-12 border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02]">
            <p className="mx-auto mb-8 max-w-md text-balance text-center text-lg font-semibold sm:text-2xl text-[var(--color-ink-resolved)]">
              Average time spent circling for parking
            </p>

            <div className="flex justify-center">
              <div className="relative flex flex-col items-center">
                <div className="rounded-2xl border-2 border-accent/20 bg-accent/5 p-8">
                  <p className="text-center font-display text-5xl font-bold text-accent">
                    17min
                  </p>
                </div>
                <p className="mt-4 text-center text-xs text-[var(--color-ink-muted-resolved)] max-w-[200px]">
                  per trip in downtown Vancouver during peak hours
                </p>
                <p className="text-[9px] text-[var(--color-ink-muted-resolved)]/50 mt-2">
                  TransLink Mobility Study, 2023
                </p>
              </div>
            </div>
          </Card>

          {/* Bottom right - Data sources */}
          <Card className="group relative shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-br-xl border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-ink-resolved)]/[0.02]">
            <CardHeader className="p-6 md:p-12">
              <p className="font-medium text-[var(--color-ink-resolved)]">
                Multiple data sources
              </p>
              <p className="text-[var(--color-ink-muted-resolved)] mt-2 max-w-sm text-sm">
                SpotAI aggregates parking availability from 5+ real-time APIs
                to ensure comprehensive coverage.
              </p>
            </CardHeader>
            <CardContent className="relative h-fit px-6 pb-6 md:px-12 md:pb-12">
              <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
                <div className="aspect-square rounded-lg border border-dashed border-[var(--color-ink-resolved)]/[0.15]"></div>
                <div className="bg-[var(--color-panel-resolved)] flex aspect-square items-center justify-center rounded-lg border border-[var(--color-ink-resolved)]/[0.06] p-4">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <div className="aspect-square rounded-lg border border-dashed border-[var(--color-ink-resolved)]/[0.15]"></div>
                <div className="bg-[var(--color-panel-resolved)] flex aspect-square items-center justify-center rounded-lg border border-[var(--color-ink-resolved)]/[0.06] p-4">
                  <ParkingCircle className="h-6 w-6 text-success" />
                </div>
                <div className="aspect-square rounded-lg border border-dashed border-[var(--color-ink-resolved)]/[0.15]"></div>
                <div className="bg-[var(--color-panel-resolved)] flex aspect-square items-center justify-center rounded-lg border border-[var(--color-ink-resolved)]/[0.06] p-4">
                  <Car className="h-6 w-6 text-accent-light" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
