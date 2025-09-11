"use client";
import {
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import React from "react";

export type SeriesPoint = { date: string; count: number };
export type Lang = "en" | "ar";

const T = {
  en: { title: "Progress" },
  ar: { title: "التقدّم" },
} as const;

export default function ProgressLine({
  data,
  lang = "en",
  title,
}: {
  data: SeriesPoint[];
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
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="currentColor"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
