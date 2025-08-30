"use client";
/**
 * BreathingRing — إصدار ناعم (هالة) أو حلقات قديمة
 * variant: "soft" | "rings"
 */
export default function BreathingRing({
  size = 320,
  label = "",
  variant = "soft",
}: {
  size?: number;
  label?: string;
  variant?: "soft" | "rings";
}) {
  const inset6 = Math.max(6, Math.round(size * 0.09375));
  const inset12 = Math.max(12, Math.round(size * 0.1875));
  const insetCore = Math.max(64, Math.round(size * 0.28));

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {variant === "soft" ? (
        <>
          {/* هالة ناعمة + تنفّس */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-400 blur-3xl opacity-40 ring-breath" />
          <div className="absolute inset-[18%] rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/30" />
        </>
      ) : (
        <>
          {/* النسخة القديمة (حلقات) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400 via-fuchsia-500 to-indigo-500 blur-2xl opacity-60 ring-breath" />
          <div
            className="absolute rounded-full border-2 border-sky-300/60 dark:border-sky-400/30 ring-breath"
            style={{ inset: inset6 }}
          />
          <div
            className="absolute rounded-full border-2 border-fuchsia-300/50 dark:border-fuchsia-400/20 ring-breath"
            style={{ inset: inset12 }}
          />
          <div
            className="absolute rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/20"
            style={{ inset: insetCore }}
          />
        </>
      )}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-700 dark:text-slate-200">
          {label}
        </div>
      )}
    </div>
  );
}
