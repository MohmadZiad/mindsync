"use client";
import { useEffect, useState } from "react";

type Lang = "en" | "ar";
const T = {
  en: { title: "Quick start", step1: "Add your first habit", step2: "Log your first entry", add: "Add Habit", log: "Quick Log", done: "Got it" },
  ar: { title: "بداية سريعة", step1: "أضف أول عادة", step2: "سجّل أول إدخال", add: "أضف عادة", log: "سجل سريع", done: "تمام" },
} as const;

export default function OnboardingCoach({ hasHabits, hasEntries, lang = "en" }: { hasHabits: boolean; hasEntries: boolean; lang?: Lang; }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const flag = localStorage.getItem("__ms.onboarded");
    if (!flag && (!hasHabits || !hasEntries)) setOpen(true);
  }, [hasHabits, hasEntries]);

  const t = T[lang as Lang];
  if (!open) return null;

  return (
    <div className="rounded-2xl p-4 border border-[var(--line)] bg-[var(--bg-1)] shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">✨</span>
        <div className="font-semibold">{t.title}</div>
      </div>
      <ol className="ps-0 space-y-2 text-sm">
        <li className="flex items-start gap-2"><span className="text-base leading-6">1.</span><div>{t.step1}</div></li>
        <li className="flex items-start gap-2"><span className="text-base leading-6">2.</span><div>{t.step2}</div></li>
      </ol>
      <div className="flex gap-2 mt-3">
        <a href="/dashboard?add=1" className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">{t.add}</a>
        <a href="/dashboard?quick=1" className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]">{t.log}</a>
        <button onClick={() => { localStorage.setItem("__ms.onboarded", "1"); setOpen(false); }} className="ms-auto text-sm underline opacity-80 hover:opacity-100">
          {t.done}
        </button>
      </div>
    </div>
  );
}
