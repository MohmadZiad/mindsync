"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type Props = PropsWithChildren<{
  size?: number;       // bubble diameter
  blur?: number;       // blur strength
  className?: string;  // optional wrapper classes
}>;

/**
 * Full-page soft spotlight background that follows the cursor.
 * RTL/LTR safe (uses x/y, not translateX/translateY).
 */
export default function SpotlightBG({
  children,
  size = 520,
  blur = 140,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  // raw pointer
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // smooth follow (3 depths for subtle parallax)
  const d1x = useSpring(px, { stiffness: 120, damping: 18, mass: 0.3 });
  const d1y = useSpring(py, { stiffness: 120, damping: 18, mass: 0.3 });

  const d2x = useSpring(px, { stiffness: 110, damping: 20, mass: 0.35 });
  const d2y = useSpring(py, { stiffness: 110, damping: 20, mass: 0.35 });

  const d3x = useSpring(px, { stiffness: 100, damping: 22, mass: 0.4 });
  const d3y = useSpring(py, { stiffness: 100, damping: 22, mass: 0.4 });

  // offsets (DON'T use translateX/Y; we derive new x/y values)
  const b1x = useTransform(d1x, (v) => v - 40);
  const b1y = useTransform(d1y, (v) => v - 20);

  const b2x = useTransform(d2x, (v) => v + 160);
  const b2y = useTransform(d2y, (v) => v + 120);

  const b3x = useTransform(d3x, (v) => v - 220);
  const b3y = useTransform(d3y, (v) => v + 220);

  // track pointer anywhere in the viewport
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // center as a sane initial position
    const r0 = el.getBoundingClientRect();
    px.set(r0.width / 2);
    py.set(Math.min(r0.height, 480) / 2);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px.set(e.clientX - r.left);
      py.set(e.clientY - r.top);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py]);

  const bubbleStyle = (hex: string) =>
    ({
      width: size,
      height: size,
      top: 0,
      left: 0,
      position: "absolute" as const,
      background: `radial-gradient(circle at center, ${hex} 0%, transparent 70%)`,
      filter: `blur(${blur}px)`,
      willChange: "transform",
    });

  return (
    <div ref={rootRef} className={`relative isolate overflow-hidden ${className}`}>
      {/* base wash (light) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(1200px 800px at 30% -10%, rgba(241,232,255,0.55) 0%, transparent 60%),
            radial-gradient(1000px 700px at 90% 20%, rgba(232,240,255,0.50) 0%, transparent 55%)
          `,
        }}
      />
      {/* base wash (dark) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden dark:block"
        style={{
          background: `
            radial-gradient(1000px 700px at 20% -10%, rgba(139,123,255,0.20) 0%, transparent 60%),
            radial-gradient(900px 600px at 85% 15%, rgba(96,165,250,0.18) 0%, transparent 55%)
          `,
        }}
      />

      {/* glow bubbles */}
      <div className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen">
        <motion.div
          className="rounded-full"
          style={{ ...bubbleStyle("#6D5EF1"), x: b1x, y: b1y }}
        />
        <motion.div
          className="rounded-full"
          style={{ ...bubbleStyle("#F15ECC"), x: b2x, y: b2y }}
        />
        <motion.div
          className="rounded-full"
          style={{ ...bubbleStyle("#60A5FA"), x: b3x, y: b3y }}
        />
      </div>

      {children}
    </div>
  );
}
