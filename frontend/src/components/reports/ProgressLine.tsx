"use client";
import {
  LineChart, Line, Tooltip, XAxis, YAxis,
  ResponsiveContainer, CartesianGrid
} from "recharts";

export type SeriesPoint = { date: string; count: number };
type Lang = "en" | "ar";

const T = {
  en: { title: "Progress" },
  ar: { title: "التقدّم" },
} as const;

export default function ProgressLine({
  data,
  lang = "en",
}: {
  data: SeriesPoint[];
  lang?: Lang;
}) {
  const t = T[lang];

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="border rounded-2xl p-3 bg-[var(--bg-1)]">
      <div className="mb-2 font-semibold">{t.title}</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="currentColor" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
