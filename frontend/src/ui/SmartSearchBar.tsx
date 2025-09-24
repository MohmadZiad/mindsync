"use client";
import { useMemo, useState } from "react";

export type Lang = "en" | "ar";
type HabitLike = { id: string; name: string; icon?: string|null; frequency?: "daily"|"weekly" };
type ReportLike = { id: string; title: string };

const STR = {
  en: {
    ph: "Search…",
    habits: "Habits",
    reports: "Reports",
    daily: "Daily",
    weekly: "Weekly",
  },
  ar: {
    ph: "ابحث…",
    habits: "العادات",
    reports: "التقارير",
    daily: "يومي",
    weekly: "أسبوعي",
  },
} as const;

export default function SmartSearchBar({
  lang = "en",
  habits = [],
  reports = [],
  onPickHabit,
  onPickReport,
}: {
  lang?: Lang;
  habits: HabitLike[];
  reports: ReportLike[];
  onPickHabit?: (id: string) => void;
  onPickReport?: (id: string) => void;
}) {
  const t = STR[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [q, setQ] = useState("");
  const res = useMemo(() => {
    if (!q.trim()) return { habits: [], reports: [] };
    const needle = q.toLowerCase();
    return {
      habits: habits
        .filter(h => (h.name + " " + (h.icon || "")).toLowerCase().includes(needle))
        .slice(0, 5),
      reports: reports
        .filter(r => r.title.toLowerCase().includes(needle))
        .slice(0, 5),
    };
  }, [q, habits, reports]);

  return (
    <div dir={dir} className="relative">
      <input
        className="input w-full"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder={t.ph}
      />
      {(res.habits.length + res.reports.length > 0) && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg-1)] shadow-soft p-2">
          {res.habits.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs opacity-60">{t.habits}</div>
              <ul className="mb-1">
                {res.habits.map(h => (
                  <li key={h.id}>
                    <button
                      className="menu-card w-full text-left"
                      onClick={() => onPickHabit?.(h.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{h.icon ?? "📌"}</span>
                        <span className="truncate">{h.name}</span>
                        <span className="ms-auto text-xs opacity-70">
                          {h.frequency === "weekly" ? t.weekly : t.daily}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {res.reports.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs opacity-60">{t.reports}</div>
              <ul>
                {res.reports.map(r => (
                  <li key={r.id}>
                    <button
                      className="menu-card w-full text-left"
                      onClick={() => onPickReport?.(r.id)}
                    >
                      {r.title}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
