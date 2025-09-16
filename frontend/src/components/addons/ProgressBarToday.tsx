"use client";
import React, { useMemo } from "react";

type Lang = "en" | "ar";

type LabelType = string | { en: string; ar: string };

type Props =
  | {
      // خيار 1: نعطي نسبة جاهزة
      value: number;             // 0..100
      done?: never;
      total?: never;
      label?: LabelType;
      lang?: Lang;
    }
  | {
      // خيار 2: يحسب النسبة من done/total
      value?: never;
      done: number;
      total: number;
      label?: LabelType;
      lang?: Lang;
    };

export default function ProgressBarToday(props: Props) {
  const pct = useMemo(() => {
    if ("value" in props && typeof props.value === "number") {
      return Math.max(0, Math.min(100, Math.round(props.value)));
    }
    const done = props.done ?? 0;
    const total = props.total ?? 0;
    return total ? Math.round((done / total) * 100) : 0;
  }, [props]);

  const lang: Lang = props.lang ?? "en";

  const labelText = useMemo(() => {
    const fallback = lang === "ar" ? "إنجاز اليوم" : "Today’s progress";
    if (!props.label) return fallback;
    if (typeof props.label === "string") return props.label;
    return lang === "ar" ? props.label.ar : props.label.en;
  }, [props.label, lang]);

  const doneShown = "done" in props ? props.done ?? 0 : undefined;
  const totalShown = "total" in props ? props.total ?? 0 : undefined;

  return (
    <div className="rounded-2xl border border-[var(--line)] p-4 bg-[var(--bg-1)] shadow-soft" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm opacity-75">⚡ {labelText}</div>
        <div className="text-sm font-semibold">{pct}%</div>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--bg-2)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6D5EF1,#F15ECC)" }}
        />
      </div>
      {doneShown !== undefined && totalShown !== undefined && (
        <div className="mt-1 text-xs opacity-70">
          {doneShown} / {totalShown}
        </div>
      )}
    </div>
  );
}
