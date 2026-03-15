"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
    mobileContent?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    stepRefs.current.forEach((el, index) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // distance from element's vertical center to viewport center
      const elCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveCard(closestIndex);
  }, []);

  useEffect(() => {
    // Run once on mount to set correct initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div ref={containerRef} className="relative">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: scrolling text steps */}
        <div className="relative">
          {content.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === content.length - 1;

            return (
              <div
                key={item.title + index}
                ref={(el) => { stepRefs.current[index] = el; }}
                className={cn(
                  "flex flex-col justify-center",
                  // Generous vertical spacing so each step can be the "closest to center"
                  // while scrolling through — min-h ensures enough scroll travel
                  "py-20 lg:py-24 lg:min-h-[60vh]",
                  // First step gets top padding to push it into viewport center on arrival
                  isFirst && "lg:pt-[20vh]",
                  // Last step gets bottom padding so it stays centerable
                  isLast && "lg:pb-[30vh]",
                  // Subtle divider between steps
                  !isFirst && "border-t border-[var(--color-ink-resolved)]/[0.06]"
                )}
              >
                <motion.div
                  animate={{ opacity: activeCard === index ? 1 : 0.2 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {/* Step number */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                      {index + 1}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                      Step {index + 1}
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-[var(--color-ink-resolved)] md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--color-ink-muted-resolved)] md:text-lg">
                    {item.description}
                  </p>
                </motion.div>

                {/* Mobile: inline visual per step */}
                {(item.mobileContent || item.content) && (
                  <div className="mt-8 lg:hidden">
                    <div
                      className={cn(
                        "overflow-hidden rounded-[20px] bg-[var(--color-panel-light-resolved)] p-6 ring-1 ring-black/[0.04]",
                        "dark:ring-white/[0.04]",
                        contentClassName
                      )}
                    >
                      <div className="flex min-h-[280px] items-center justify-center">
                        {item.mobileContent ?? item.content ?? null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: sticky visual panel (desktop only) */}
        <div className="hidden lg:block">
          <div className="sticky top-0 flex h-screen items-center justify-center">
            <div
              className={cn(
                "relative w-full min-h-[480px] max-h-[600px] overflow-hidden rounded-[24px]",
                "bg-[var(--color-panel-light-resolved)] shadow-lg ring-1 ring-black/[0.04]",
                "dark:ring-white/[0.04]",
                contentClassName
              )}
            >
              {/* All cards stacked, crossfade via opacity */}
              {content.map((item, index) => (
                <motion.div
                  key={item.title + index}
                  animate={{ opacity: activeCard === index ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center p-8 lg:p-10",
                    activeCard !== index && "pointer-events-none"
                  )}
                >
                  {item.content ?? null}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
