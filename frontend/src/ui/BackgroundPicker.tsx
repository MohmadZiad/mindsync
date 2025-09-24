"use client";
import { useEffect, useState } from "react";

export default function BackgroundPicker({
  lang = "en",
}: {
  lang?: "en" | "ar";
}) {
  const [bg, setBg] = useState<"aurora"|"mesh"|"plain">("aurora");

  useEffect(() => {
    const saved = localStorage.getItem("__bg") as any;
    const v = saved ?? "aurora";
    setBg(v);
    document.documentElement.setAttribute("data-bg", v);
  }, []);
  useEffect(() => {
    localStorage.setItem("__bg", bg);
    document.documentElement.setAttribute("data-bg", bg);
  }, [bg]);

  const t = {
    en: { label: "Background", aurora: "Aurora", mesh: "Mesh", plain: "Plain" },
    ar: { label: "الخلفية", aurora: "أورورا", mesh: "مش", plain: "عادي" },
  }[lang];

  return (
    <select
      className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]"
      value={bg}
      onChange={e => setBg(e.target.value as any)}
      title={t.label}
      aria-label={t.label}
    >
      <option value="aurora">{t.aurora}</option>
      <option value="mesh">{t.mesh}</option>
      <option value="plain">{t.plain}</option>
    </select>
  );
}
