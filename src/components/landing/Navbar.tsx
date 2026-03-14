"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, Menu, X } from "lucide-react";

const links = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav
        className={`mx-auto mt-4 max-w-6xl px-6 transition-all duration-500 lg:px-10 ${
          scrolled
            ? "mt-3 max-w-4xl rounded-2xl border border-ink/[0.06] bg-canvas/80 px-5 backdrop-blur-2xl"
            : ""
        }`}
      >
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              SpotAI
            </span>
          </Link>

          {/* Center links — desktop */}
          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.name}
                href={l.href}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {l.name}
              </a>
            ))}
          </div>

          {/* CTA — desktop */}
          <Link
            href="/map"
            className="group hidden items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-canvas transition-all hover:bg-accent-light hover:scale-[1.02] active:scale-[0.97] md:inline-flex"
          >
            Open Map
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="relative z-20 text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <Menu
              className={`h-5 w-5 transition-all duration-200 ${open ? "scale-0 opacity-0" : ""}`}
            />
            <X
              className={`absolute inset-0 m-auto h-5 w-5 transition-all duration-200 ${open ? "" : "scale-0 opacity-0"}`}
            />
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="space-y-4 border-t border-ink/[0.06] py-6">
                {links.map((l) => (
                  <a
                    key={l.name}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-base text-ink-muted transition-colors hover:text-ink"
                  >
                    {l.name}
                  </a>
                ))}
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-canvas"
                >
                  Open Map
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
