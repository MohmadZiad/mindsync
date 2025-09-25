"use client";
import { useId, useState } from "react";

export type Lang = "en" | "ar";

const STR = {
  en: { open: "Open", close: "Close" },
  ar: { open: "فتح", close: "إغلاق" },
} as const;

export default function AnimatedCard({
  lang = "en",
  title,
  subtitle,
  icon,
  children,
  defaultOpen = true,
  flip = false,       // لقلب البطاقة “يوغي”
  gradient = true,    // خلفية متدرجة خفيفة
}: {
  lang?: Lang;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  flip?: boolean;
  gradient?: boolean;
}) {
  const t = STR[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [open, setOpen] = useState(defaultOpen);
  const [isFlipped, setIsFlipped] = useState(false);
  const id = useId();

  return (
    <section
      dir={dir}
      className={[
        "group relative rounded-2xl border border-[var(--line)]",
        "bg-[var(--bg-1)] shadow-soft card-hover overflow-hidden",
        gradient ? "animated-card-gradient" : "",
      ].join(" ")}
      aria-labelledby={id}
    >
      <header className="flex items-center gap-3 p-4">
        <div className="text-xl shrink-0">{icon ?? "📦"}</div>
        <div className="flex-1 min-w-0">
          <h3 id={id} className="font-semibold truncate">{title}</h3>
          {subtitle ? (
            <p className="text-sm text-[var(--text-3)] truncate">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {flip && (
            <button
              onClick={() => setIsFlipped(v => !v)}
              className="chip"
              title="Flip"
              aria-label="Flip"
            >
              🔄
            </button>
          )}
          <button
            onClick={() => setOpen(v => !v)}
            className="chip"
            aria-expanded={open}
            aria-controls={id + "-panel"}
            title={open ? t.close : t.open}
          >
            {open ? "▾" : "▸"}
          </button>
        </div>
      </header>

      {/* panel */}
      <div
        id={id + "-panel"}
        className="transition-grid"
        style={{
          display: open ? "block" : "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
        }}
      >
        <div className={["overflow-hidden px-4 pb-4", flip ? "perspective-1000" : ""].join(" ")}>
          {flip ? (
            <div className={["flip-card", isFlipped ? "is-flipped" : ""].join(" ")}>
              <div className="flip-face flip-front">{children}</div>
              <div className="flip-face flip-back">
                <div className="text-sm opacity-80">
                  {lang === "ar" ? "تفاصيل إضافية أو ملخص سريع." : "Extra details or a quick summary."}
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </section>
  );
}
