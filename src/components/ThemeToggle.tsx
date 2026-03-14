"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
      style={{
        background: "var(--control-bg)",
        border: "1px solid var(--control-border)",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
      ) : (
        <Moon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
      )}
    </button>
  );
}
