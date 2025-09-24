import * as React from "react";

type Lang = "en" | "ar";
type Label = string | { en: string; ar: string };

export interface ProgressBarTodayProps {
  done: number;
  total: number;
  label?: Label; // defaults by lang
  lang?: Lang; // affects default label + direction
  showCount?: boolean; // show "done / total"
  size?: "sm" | "md" | "lg";
  intent?: "brand" | "success" | "warning" | "danger";
  className?: string;
}

export default function ProgressBarToday({
  done,
  total,
  label,
  lang = "ar",
  showCount = true,
  size = "md",
  intent = "brand",
  className,
}: ProgressBarTodayProps) {
  const pct = React.useMemo(() => {
    if (!total || total < 0) return 0;
    const p = Math.round((Math.max(0, done) / Math.max(1, total)) * 100);
    return Math.min(100, Math.max(0, p));
  }, [done, total]);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const text =
    typeof label === "string"
      ? label
      : label
      ? lang === "ar"
        ? label.ar
        : label.en
      : lang === "ar"
      ? "إنجاز اليوم"
      : "Today’s Progress";

  const pad = size === "sm" ? "p-3" : size === "lg" ? "p-6" : "p-4";
  const barH = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  const barBg =
    intent === "success"
      ? "linear-gradient(90deg,#22c55e,#16a34a)"
      : intent === "warning"
      ? "linear-gradient(90deg,#f59e0b,#f97316)"
      : intent === "danger"
      ? "linear-gradient(90deg,#ef4444,#dc2626)"
      : "linear-gradient(90deg,#6D5EF1,#F15ECC)"; // brand

  const labelId = React.useId();

  return (
    <section
      dir={dir}
      aria-labelledby={labelId}
      className={`rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] shadow-soft ${pad} ${
        className || ""
      }`}
    >
      <header className="mb-2 flex items-center justify-between">
        <div id={labelId} className="text-sm text-[var(--ink-2)]">
          ⚡ {text}
        </div>
        <div className="text-sm font-semibold">{pct}%</div>
      </header>

      {/* progressbar with a11y */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-describedby={labelId}
        className={`w-full rounded-full bg-[var(--bg-2)] overflow-hidden ${barH}`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out will-change-[width]"
          style={{ width: `${pct}%`, background: barBg }}
        />
      </div>

      {showCount && (
        <div className="mt-1 text-xs text-[var(--ink-2)] opacity-75">
          {done} / {total}
        </div>
      )}

      {/* SR-only extra context */}
      <span className="sr-only">
        {lang === "ar" ? `أُنجز ${pct} بالمئة` : `Completed ${pct} percent`}
      </span>
    </section>
  );
}
