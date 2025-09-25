import * as React from "react";
import { motion, useInView } from "framer-motion";

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
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  
      ? label
      : label
      ? lang === "ar"
        ? label.ar
        : label.en
      : lang === "ar"
      ? "إنجاز اليوم"
      : "Today’s Progress";

  const pad = size === "sm" ? "p-4" : size === "lg" ? "p-6" : "p-5";
  const barH = size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-3";

  const gradients = {
    brand: "linear-gradient(90deg, var(--brand), var(--brand-accent))",
    success: "linear-gradient(90deg, #10b981, #059669)",
    warning: "linear-gradient(90deg, #f59e0b, #d97706)",
    danger: "linear-gradient(90deg, #ef4444, #dc2626)",
  };
  
  const barBg = gradients[intent];
  
  const bgColors = {
    brand: "bg-[var(--brand)]/10",
    success: "bg-green-100 dark:bg-green-900/20",
    warning: "bg-yellow-100 dark:bg-yellow-900/20",
    danger: "bg-red-100 dark:bg-red-900/20",
  };

    intent === "success"
      ? "linear-gradient(90deg,#22c55e,#16a34a)"
      : intent === "warning"
      ? "linear-gradient(90deg,#f59e0b,#f97316)"
      : intent === "danger"
      ? "linear-gradient(90deg,#ef4444,#dc2626)"
      : "linear-gradient(90deg,#6D5EF1,#F15ECC)"; // brand

  const labelId = React.useId();

  return (
    <motion.section
      ref={ref}
      dir={dir}
      aria-labelledby={labelId}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`card-elevated ${bgColors[intent]} ${pad} ${
        className || ""
      }`}
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            ⚡
          </motion.div>
          <div>
            <div id={labelId} className="text-sm font-medium text-[var(--ink-2)]">
              {text}
            </div>
            {showCount && (
              <div className="text-xs text-[var(--ink-3)]">
                {done} / {total}
              </div>
            )}
          </div>
        </div>
        <motion.div 
          className="text-2xl font-bold text-[var(--brand)]"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {pct}%
        </motion.div>
      </header>

      {/* progressbar with a11y */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-describedby={labelId}
        className={`relative w-full rounded-full bg-[var(--bg-3)] overflow-hidden ${barH} shadow-inner`}
      >
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: barBg }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
        </motion.div>
      </div>

      {/* SR-only extra context */}
      <span className="sr-only">
        {lang === "ar" ? `أُنجز ${pct} بالمئة` : `Completed ${pct} percent`}
      </span>
    </motion.section>
  );
}
