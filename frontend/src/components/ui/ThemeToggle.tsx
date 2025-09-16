"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle({
  label = { en: "Theme", ar: "المظهر" },
  lang = "en",
}: {
  label?: { en: string; ar: string };
  lang?: "en" | "ar";
}) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("__theme");
    const prefers =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  useEffect(() => {
    localStorage.setItem("__theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <button
      dir={dir}
      onClick={() => setDark(v => !v)}
      className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]"
      aria-label={lang === "ar" ? label.ar : label.en}
      title={lang === "ar" ? label.ar : label.en}
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
