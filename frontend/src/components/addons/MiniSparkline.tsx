"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useId, useMemo, useState } from "react";

type Point = { date: string | Date; count: number };

type Props = {
  data: Point[];
  height?: number;
  /** "ar" للواجهة العربية, "en" للإنجليزية */
  lang?: "ar" | "en";
  /** إظهار التولتيب أو إخفاؤه */
  showTooltip?: boolean;
  /** سمك الخط */
  strokeWidth?: number;
  className?: string;
};

export default function MiniSparkline({
  data,
  height = 72,
  lang = "ar",
  showTooltip = true,
  strokeWidth = 2,
  className,
}: Props) {
  // gradient id unique
  const gid = useId();

  // locale formatting
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
      }),
    [locale]
  );

  // normalize data: ensure Date object (no heavy calc on each render)
  const rows = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        _d: typeof d.date === "string" ? new Date(d.date) : d.date,
      })),
    [data]
  );

  // reduced-motion (لطراوة الحركة)
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // ألوان متوافقة مع الثيم
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  const c1 = "#6D5EF1"; // purple
  const c2 = "#F15ECC"; // pink
  const gridStroke = isDark ? "rgba(148,163,184,.12)" : "rgba(15,23,42,.08)";

  // Tooltip مخصص وبسيط وملوّح
  const CustomTip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div
        className="rounded-lg border border-[var(--line)] bg-[var(--bg-1)] px-2 py-1 text-xs shadow"
        style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
      >
        <div className="opacity-70">{fmt.format(p._d)}</div>
        <div className="font-semibold">{p.count}</div>
      </div>
    );
  };

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer>
        <LineChart
          data={rows}
          margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
        >
          {/* خلفية خفيفة بدل Grid كاملة */}
          <rect x={0} y={0} width="100%" height="100%" fill="transparent" />
          <XAxis
            dataKey="_d"
            tickFormatter={(v) => fmt.format(v)}
            hide
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={["dataMin-1", "dataMax+1"]} />
          {showTooltip && <Tooltip content={<CustomTip />} />}
          {/* Gradient للخط */}
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c1} />
              <stop offset="100%" stopColor={c2} />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="count"
            dot={false}
            stroke={`url(${`#${gid}`})`}
            strokeWidth={strokeWidth}
            isAnimationActive={!reduceMotion}
            animationDuration={500}
            animationEasing="ease-out"
          />
          {/* خط أرضي خفيف يعطي عمق */}
          <Line
            type="monotone"
            dataKey="count"
            dot={false}
            stroke={gridStroke}
            strokeWidth={strokeWidth}
            strokeOpacity={0.25}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
