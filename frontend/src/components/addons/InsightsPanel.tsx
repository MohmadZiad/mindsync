"use client";
import { useMemo, useState, useEffect } from "react";
import MiniSparkline from "./MiniSparkline";

type Entry = { id: string; habitId: string; createdAt: string };
type Habit = { id: string; name: string };

type Lang = "en" | "ar";
const T = {
  en: {
    title: "Insights",
    best: "Top habit",
    week: "Strongest weekday",
    details: "Details",
    hide: "Hide",
    show: "Insights",
    close: "Close",
  },
  ar: {
    title: "تحليلات",
    best: "أكثر عادة التزمت فيها",
    week: "أقوى يوم بالأسبوع",
    details: "تفاصيل",
    hide: "إخفاء",
    show: "تحليلات",
    close: "إغلاق",
  },
} as const;

const LS_COLLAPSED = "__ms.insights.collapsed";

export default function InsightsPanel({
  entries,
  habits,
  lang = "en",
}: {
  entries: Entry[];
  habits: Habit[];
  lang?: Lang;
}) {
  const t = T[lang as Lang];
  const [openModal, setOpenModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // read collapsed state safely on the client
  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_COLLAPSED);
      setCollapsed(v === "1");
    } catch {
      // ignore
    }
  }, []);

  const { topHabit, weekday, series } = useMemo(() => {
    const byHabit: Record<string, number> = {};
    // keep day indexes 0..6
    const byDay: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const byDate: Record<string, number> = {};

    for (const e of entries) {
      byHabit[e.habitId] = (byHabit[e.habitId] || 0) + 1;

      const d = new Date(e.createdAt);
      const dayIdx = d.getDay(); // 0..6
      byDay[dayIdx] = (byDay[dayIdx] || 0) + 1;

      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      byDate[key] = (byDate[key] || 0) + 1;
    }

    // top habit name (or dash)
    const topHabitId = Object.entries(byHabit)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    const topHabit = habits.find((h) => h.id === topHabitId)?.name || "—";

    const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

    // find best weekday index robustly
    const bestDayEntry = Object.entries(byDay)
      .map(([k, v]) => [Number(k), v] as [number, number])
      .sort((a, b) => b[1] - a[1])[0];
    const bestDayIndex = bestDayEntry ? bestDayEntry[0] : undefined;

    const weekday =
      bestDayIndex !== undefined
        ? (lang === "ar" ? daysAr : daysEn)[bestDayIndex]
        : "—";

    // time series sorted by date
    const series = Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return { topHabit, weekday, series };
  }, [entries, habits, lang]);

  const handleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(LS_COLLAPSED, next ? "1" : "0");
    } catch {
      // ignore
    }
  };

  // ======== Collapsed (Chip) ========
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-1)] px-3 py-2 text-sm flex items-center gap-2 hover:shadow-sm transition"
        title={t.title}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <span className="text-lg">✨</span>
        <span className="truncate">{t.show}</span>
      </button>
    );
  }

  // ======== Full card ========
  return (
    <>
      <div
        className="rounded-2xl p-4 border border-[var(--line)] bg-[var(--brand-card)] shadow-sm"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">{t.title}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenModal(true)}
              className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)] text-sm"
            >
              {t.details}
            </button>
            <button
              onClick={handleCollapse}
              className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)] text-sm"
            >
              {t.hide}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[var(--line)] p-3">
            <div className="text-xs opacity-70">{t.best}</div>
            <div className="text-lg font-semibold">{topHabit}</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] p-3">
            <div className="text-xs opacity-70">{t.week}</div>
            <div className="text-lg font-semibold">{weekday}</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] p-2">
            <MiniSparkline data={series} />
          </div>
        </div>
      </div>

      {/* Modal (details) */}
      {openModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenModal(false)}
          />
          <div
            className="relative w-[92%] max-w-[680px] rounded-2xl border border-[var(--line)] bg-[var(--bg-0)] p-6 shadow-2xl animate-[pop_.24s_ease]"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <div className="text-lg font-bold">✨ {t.title}</div>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <div className="rounded-xl border border-[var(--line)] p-3">
                <div className="text-xs opacity-70">{t.best}</div>
                <div className="text-lg font-semibold">{topHabit}</div>
              </div>
              <div className="rounded-xl border border-[var(--line)] p-3">
                <div className="text-xs opacity-70">{t.week}</div>
                <div className="text-lg font-semibold">{weekday}</div>
              </div>
              <div className="rounded-xl border border-[var(--line)] p-2">
                <MiniSparkline data={series} />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded-xl border bg-[var(--bg-1)]"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
