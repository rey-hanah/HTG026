"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
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
          // Trigger when step enters center 40% of viewport
          rootMargin: "-30% 0px -30% 0px",
          threshold: 0.1,
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [content.length]);

  return (
    <div ref={sectionRef} className="relative">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left: scrolling text steps */}
        <div className="relative">
          {content.map((item, index) => (
            <div
              key={item.title + index}
              ref={(el) => { stepRefs.current[index] = el; }}
              className="py-20 first:pt-8 last:pb-8 lg:py-28 lg:first:pt-4 lg:last:pb-4"
            >
              <motion.div
                animate={{
                  opacity: activeCard === index ? 1 : 0.25,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Step {index + 1}
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--color-ink-resolved)] md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--color-ink-muted-resolved)] md:text-lg">
                  {item.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Right: sticky visual panel */}
        <div className="hidden lg:flex lg:items-start">
          <div className="sticky top-28 w-full">
            <div
              className={cn(
                "relative overflow-hidden rounded-[24px] bg-accent/[0.06] border border-accent/10",
                "aspect-[4/3] w-full",
                contentClassName
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center p-8"
                >
                  {content[activeCard].content ?? null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: show active card inline below each step */}
      <div className="lg:hidden">
        <div
          className={cn(
            "overflow-hidden rounded-[20px] bg-accent/[0.06] border border-accent/10",
            "aspect-[4/3] w-full",
            contentClassName
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCard}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-full items-center justify-center p-6"
            >
              {content[activeCard].content ?? null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
