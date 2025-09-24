"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";

/* تتبّع الماوس بنعومة */
function usePointer(ref: React.RefObject<HTMLDivElement>) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 90, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 90, damping: 18, mass: 0.4 });

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(r.width / 2); y.set(r.height / 2);

    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      x.set(e.clientX - b.left); y.set(e.clientY - b.top);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [ref]);

  return { sx, sy };
}

function Halo({ sx, sy, size = 560, a = 0.12 }: {
  sx: MotionValue<number>; sy: MotionValue<number>; size?: number; a?: number;
}) {
  const x = useTransform(sx, v => v - size / 2);
  const y = useTransform(sy, v => v - size / 2);
  return (
    <motion.div
      aria-hidden
      className="absolute rounded-full pointer-events-none"
      style={{
        x, y, width: size, height: size,
        background: `radial-gradient(circle,
          rgba(255,255,255,${Math.min(a + .05, .2)}) 0%,
          rgba(255,255,255,${a}) 30%,
          rgba(109,94,241,${a * .45}) 55%,
          transparent 75%)`,
        filter: "blur(28px)",
        mixBlendMode: "soft-light" as const,
      }}
    />
  );
}

/* ---------------- Serene Aurora ---------------- */
export function BGSerene() {
  const ref = useRef<HTMLDivElement>(null);
  const { sx, sy } = usePointer(ref);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {/* base white */}
      <div className="absolute inset-0 bg-white" />
      {/* ضباب بنفسجي/أزرق ناعم */}
      <div
        className="absolute inset-0 motion-safe:animate-[drift1_28s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(1200px 800px at 75% 30%, rgba(109,94,241,0.18) 0%, rgba(109,94,241,0.10) 35%, transparent 70%)",
          filter: "blur(24px)", opacity: .7
        }}
      />
      <div
        className="absolute inset-0 mix-blend-lighten motion-safe:animate-[drift2_36s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(1100px 700px at 20% 60%, rgba(241,94,204,0.10) 0%, transparent 60%), radial-gradient(1000px 650px at 65% 80%, rgba(96,165,250,0.10) 0%, transparent 60%)",
          filter: "blur(26px)", opacity: .55
        }}
      />
      {/* هالة تتبع الماوس */}
      <Halo sx={sx} sy={sy} />
    </div>
  );
}

/* ---------------- Neon Play ---------------- */
export function BGNeo() {
  const ref = useRef<HTMLDivElement>(null);
  const { sx, sy } = usePointer(ref);
  const x = useTransform(sx, v => v - 200);
  const y = useTransform(sy, v => v - 200);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      {/* طبقة نيون دائرية */}
      <motion.div
        className="absolute rounded-full mix-blend-screen pointer-events-none"
        style={{
          x, y, width: 400, height: 400,
          background:
            "conic-gradient(from 0deg, rgba(109,94,241,0.28), rgba(241,94,204,0.24), rgba(96,165,250,0.22), transparent 70%)",
          filter: "blur(26px)"
        }}
      />
      {/* خطوط ليزر رقيقة */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(110deg, rgba(109,94,241,0.14) 0 10px, transparent 10px 24px)",
          animation: "lasersMove 8s linear infinite"
        }}
      />
    </div>
  );
}
