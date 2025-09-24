"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { useTheme } from "next-themes";

type Lang = "en" | "ar";

type Props = {
  lang?: Lang;
  /** Optional: controlled value ("light" | "dark") */
  currentTheme?: "light" | "dark";
  /** Optional: controlled setter */
  onChangeTheme?: (t: "light" | "dark") => void;
  /** Button classes override */
  className?: string;
  /** Optional custom labels */
  label?: { en: string; ar: string };
  /** Optional localStorage key when falling back (default: "__theme") */
  storageKey?: string;
};

export default function ThemeToggle({
  lang = "en",
  currentTheme,
  onChangeTheme,
  className,
  label = { en: "Theme", ar: "المظهر" },
  storageKey = "__theme",
}: Props) {
  // Prefer next-themes when available
  const nt = safeUseTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Resolve the theme we should show on the button
  const resolvedFromNextThemes = mounted
    ? (nt?.resolvedTheme as "light" | "dark" | undefined)
    : undefined;
  const resolvedControlled = mounted ? currentTheme : undefined;
  const effectiveTheme: "light" | "dark" =
    resolvedControlled ??
    resolvedFromNextThemes ??
    (mounted ? readFallback(storageKey) : "light");

  // Decide how to update theme
  const setTheme = (t: "light" | "dark") => {
    if (onChangeTheme) {
      onChangeTheme(t); // controlled path
      return;
    }
    if (nt?.setTheme) {
      nt.setTheme(t); // next-themes path
      return;
    }
    // Fallback: manual toggle (no dependency on next-themes)
    writeFallback(storageKey, t);
  };

  const isDark = effectiveTheme === "dark";
  const btnLabel =
    lang === "ar" ? (isDark ? "داكن" : "فاتح") : isDark ? "Dark" : "Light";
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <button
      dir={dir}
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={lang === "ar" ? label.ar : label.en}
      title={lang === "ar" ? label.ar : label.en}
      className={
        className ??
        "px-3 py-1.5 rounded-xl border bg-[var(--bg-1)] text-sm hover:bg-[var(--bg-2)]"
      }
    >
      {isDark ? "🌙 " : "☀️ "}
      {btnLabel}
    </button>
  );
}

/* ---------- helpers ---------- */

// Safe hook usage if next-themes context exists
function safeUseTheme(): {
  resolvedTheme?: string;
  setTheme?: (t: string) => void;
} | null {
  try {
    // If <ThemeProvider> exists, this works
    // Otherwise next-themes will throw (we swallow & fallback)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { resolvedTheme, setTheme } = useTheme();
    return { resolvedTheme, setTheme };
  } catch {
    return null;
  }
}

// Fallback read/write that keeps DOM + localStorage in sync
function readFallback(key: string): "light" | "dark" {
  try {
    const saved = localStorage.getItem(key);
    const prefers =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefers;
    document.documentElement.classList.toggle("dark", isDark);
    return isDark ? "dark" : "light";
  } catch {
    return "light";
  }
}

function writeFallback(key: string, t: "light" | "dark") {
  try {
    localStorage.setItem(key, t);
    document.documentElement.classList.toggle("dark", t === "dark");
  } catch {
    // ignore
  }
}
