"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const links = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
        className={`mx-auto mt-4 transition-all duration-500 ${
          scrolled
            ? "mt-3 max-w-4xl rounded-[20px] border border-[var(--color-ink-resolved)]/[0.06] bg-[var(--color-canvas-resolved)]/80 px-6 backdrop-blur-2xl"
            : "container-landing"
        }`}
      >
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-[var(--color-ink-resolved)]">
              SpotAI
            </span>
          </Link>

          {/* Center links — desktop */}
          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.name}
                href={l.href}
                className="text-sm text-[var(--color-ink-muted-resolved)] transition-colors hover:text-[var(--color-ink-resolved)]"
              >
                {l.name}
              </a>
            ))}
          </div>

          {/* Right actions — desktop */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-ink-resolved)]/[0.08] bg-[var(--color-ink-resolved)]/[0.03] text-[var(--color-ink-muted-resolved)] transition-colors hover:bg-[var(--color-ink-resolved)]/[0.06] hover:text-[var(--color-ink-resolved)]"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* CTA */}
            <Link
              href="/map"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-canvas transition-all hover:bg-accent-light hover:scale-[1.02] active:scale-[0.97]"
            >
              Open Map
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-ink-resolved)]/[0.08] bg-[var(--color-ink-resolved)]/[0.03] text-[var(--color-ink-muted-resolved)]"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="relative z-20 text-[var(--color-ink-resolved)]"
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
              <div className="space-y-4 border-t border-[var(--color-ink-resolved)]/[0.06] py-6">
                {links.map((l) => (
                  <a
                    key={l.name}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-base text-[var(--color-ink-muted-resolved)] transition-colors hover:text-[var(--color-ink-resolved)]"
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
