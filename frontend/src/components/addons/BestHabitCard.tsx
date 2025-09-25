"use client";
import MiniWeekSparkline from "@/components/addons/MiniWeekSparkline";

export type Lang = "en" | "ar";

const STR = {
  en: {
    bestHabit: "🏅 Best habit this week",
    streak: (n: number) => `🔥 ${n} ${n === 1 ? "day" : "days"} in a row`,
    locale: "en-US",
    dir: "ltr" as const,
  },
  ar: {
    bestHabit: "🏅 أفضل عادة هذا الأسبوع",
    streak: (n: number) => `🔥 ${n} ${n === 1 ? "يوم" : "أيام"} متواصلة`,
    locale: "ar-EG",
    dir: "rtl" as const,
  },
} as const;

export default function BestHabitCard({
  title,
  weekPoints,
  streak,
  lang = "en",
}: {
  title: string;
  weekPoints: number[];
  streak: number;
  lang?: Lang;
}) {
  const t = STR[lang];
  const nf = new Intl.NumberFormat(t.locale);

  return (
    <div
      dir={t.dir}
      className="rounded-2xl border border-[var(--line)] p-4 bg-[var(--bg-1)] shadow-soft card-hover"
      aria-label={t.bestHabit}
    >
      <div className="text-sm opacity-75 mb-1">{t.bestHabit}</div>

      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-sm opacity-70 whitespace-nowrap">
          {t.streak(Number(nf.format(streak).replace(/[^0-9]/g, "")) || streak)}
        </div>
      </div>

      <MiniWeekSparkline points={weekPoints} />
    </div>
  );
}
