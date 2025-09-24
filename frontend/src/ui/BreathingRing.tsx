"use client";
import React, { useMemo } from "react";

export default function BreathingRing({
  size = 320,
  label = "",
  variant = "soft",
  className = "",
}: {
  /** Diameter in px */
  size?: number;
  /** Optional text centered inside the ring */
  label?: string;
  /** "soft" = diffuse glow, "rings" = multiple stroked rings */
  variant?: "soft" | "rings";
  className?: string;
}) {
  // Pre-calc insets proportional to size (keeps look consistent at any size)
  const { inset6, inset12, insetCore } = useMemo(() => {
    const i6 = Math.max(6, Math.round(size * 0.09375)); // ≈ size * 3/32
    const i12 = Math.max(12, Math.round(size * 0.1875)); // ≈ size * 6/32
    const core = Math.max(64, Math.round(size * 0.28)); // inner “disk”
    return { inset6: i6, inset12: i12, insetCore: core };
  }, [size]);

  /**
   * NOTE:
   * - يعتمد على CSS variables:
   *    --mood       (base color)
   *    --mood-rgb   (R,G,B for opacity mixes)
   * - هاي القيم بنغيرها من الـ body classes: mood-calm / mood-focus / mood-energy / mood-soft
   */

  // Helper color mixes (done in CSS via color-mix for better blending across themes)
  const ring1 = "color-mix(in oklab, var(--mood) 70%, white 30%)";
  const ring2 = "color-mix(in oklab, var(--mood) 55%, white 45%)";
  const mid = "color-mix(in oklab, var(--mood) 80%, white 20%)";
  const light = "color-mix(in oklab, var(--mood) 22%, white 78%)";
  const moodRGBA = "rgba(var(--mood-rgb), .55)";
  const moodRGBAOuter = "rgba(var(--mood-rgb), .20)";

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {variant === "soft" ? (
        <>
          {/* Outer soft halo (replaces the hard-coded purple) */}
          <div
            className="absolute inset-0 rounded-full ring-breath"
            style={{
              background: `radial-gradient(circle at 50% 60%, ${mid} 0%, transparent 70%)`,
              filter: "blur(40px)",
              opacity: 0.9,
            }}
          />

          {/* Even wider faint wash for nicer falloff */}
          <div
            className="absolute -inset-6 rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 55%, ${moodRGBA} 0%, transparent 72%)`,
              filter: "blur(60px)",
              opacity: 0.6,
            }}
          />

          {/* Subtle inner disk */}
          <div
            className="absolute rounded-full backdrop-blur-md border"
            style={{
              inset: Math.round(size * 0.18), // ≈ 18%
              background: `radial-gradient(circle at 50% 45%, ${light} 0%, transparent 65%)`,
              borderColor: "rgba(255,255,255,.35)",
            }}
          />
        </>
      ) : (
        <>
          {/* Ambient glow for the ring mode */}
          <div
            className="absolute inset-0 rounded-full ring-breath"
            style={{
              background: `radial-gradient(circle at 50% 55%, ${moodRGBAOuter} 0%, transparent 70%)`,
              filter: "blur(28px)",
              opacity: 0.85,
            }}
          />

          {/* Ring 1 */}
          <div
            className="absolute rounded-full border-2 ring-breath"
            style={{
              inset: inset6,
              borderColor: ring1,
              boxShadow: `0 0 40px 6px ${moodRGBAOuter}`,
            }}
          />

          {/* Ring 2 */}
          <div
            className="absolute rounded-full border-2 ring-breath"
            style={{
              inset: inset12,
              borderColor: ring2,
              boxShadow: `0 0 24px 4px ${moodRGBAOuter}`,
            }}
          />

          {/* Center disk */}
          <div
            className="absolute rounded-full backdrop-blur-md border"
            style={{
              inset: insetCore,
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,.55) 0%, rgba(255,255,255,.20) 60%, transparent 100%)",
              borderColor: "rgba(255,255,255,.28)",
            }}
          />
        </>
      )}

      {/* Optional center label */}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-700 dark:text-slate-200">
          {label}
        </div>
      )}
    </div>
  );
}
