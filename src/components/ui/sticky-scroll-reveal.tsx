"use client";
import React, { useEffect, useRef, useState } from "react";
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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveCard(index);
          }
        },
        {
          rootMargin: "-35% 0px -35% 0px",
          threshold: 0.1,
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [content.length]);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: scrolling text steps */}
        <div className="relative">
          {content.map((item, index) => (
            <div
              key={item.title + index}
              ref={(el) => { stepRefs.current[index] = el; }}
              className={cn(
                "py-12 lg:py-16 first:pt-4 last:pb-4",
                index > 0 && "border-t border-[var(--color-ink-resolved)]/[0.06]"
              )}
            >
              <motion.div
                animate={{
                  opacity: activeCard === index ? 1 : 0.25,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Step number circle */}
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
          ))}
        </div>

        {/* Right: sticky visual panel (desktop only) */}
        <div className="hidden lg:block">
          <div className="sticky top-32">
            <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
              <div
                className={cn(
                  "relative w-full min-h-[480px] lg:min-h-[520px] overflow-hidden rounded-[24px]",
                  "bg-[var(--color-panel-light-resolved)] shadow-lg ring-1 ring-black/[0.04]",
                  "dark:ring-white/[0.04]",
                  "p-10 lg:p-12",
                  contentClassName
                )}
              >
                {/* Render all cards, toggle visibility */}
                {content.map((item, index) => (
                  <motion.div
                    key={item.title + index}
                    animate={{
                      opacity: activeCard === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center p-10 lg:p-12",
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
    </div>
  );
};
