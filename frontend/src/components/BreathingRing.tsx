"use client";
import React, { useMemo } from "react";

export default function BreathingRing({
  size = 320,
  label = "",
  variant = "soft",
  className = "",
}: {
  size?: number;
  label?: string;
  variant?: "soft" | "rings";
  className?: string;
}) {
  const { inset6, inset12, insetCore } = useMemo(() => {
    const i6 = Math.max(6, Math.round(size * 0.09375));
    const i12 = Math.max(12, Math.round(size * 0.1875));
    const core = Math.max(64, Math.round(size * 0.28));
    return { inset6: i6, inset12: i12, insetCore: core };
  }, [size]);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {variant === "soft" ? (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-400 blur-3xl opacity-40 ring-breath" />
          <div className="absolute inset-[18%] rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/30" />
        </>
      ) : (
        <>
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
