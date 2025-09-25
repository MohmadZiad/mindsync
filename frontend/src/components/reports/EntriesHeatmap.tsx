"use client";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import React from "react";

export type Lang = "en" | "ar";

const T = {
  en: { title: "Activity Heatmap" },
  ar: { title: "مخطط الأنشطة" },
} as const;

export default function EntriesHeatmap({
  values,
  startDate,
  endDate,
  lang = "en",
  title,
}: {
  values: { date: string; count: number }[];
  startDate: Date;
  endDate: Date;
  lang?: Lang;
  title?: React.ReactNode; 
}) {
  const t = T[lang];
  const heading = title ?? t.title;

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="border rounded-2xl p-3 bg-[var(--bg-1)]"
    >
      <div className="mb-2 font-semibold">{heading}</div>

      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        classForValue={(v) =>
          !v || v.count === 0
            ? "color-empty"
            : `color-github-${Math.min(4, v.count)}`
        }
        gutterSize={3}
        showWeekdayLabels={true}
      />

      <style jsx global>{`
        .color-empty { fill: #e5e7eb; }
        .color-github-1 { fill: #c7d2fe; }
        .color-github-2 { fill: #a5b4fc; }
        .color-github-3 { fill: #818cf8; }
        .color-github-4 { fill: #6366f1; }
      `}</style>
    </div>
  );
}
