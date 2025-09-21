"use client";

import * as React from "react";

/* ========================================================================
   Types
   ======================================================================== */
type Testimonial = {
  name: string;
  quote: string;
};

type Props = {
  items: Testimonial[];
  dir?: "ltr" | "rtl";
  className?: string;
  /** Duration (seconds) for one full loop */
  durationSec?: number;
  /** Pause animation on hover (default true) */
  pauseOnHover?: boolean;
};

/* ========================================================================
   Component: TestimonialMarquee
   - Creates an infinite scrolling marquee with testimonial cards
   - Items are duplicated to ensure a seamless loop
   ======================================================================== */
export default function TestimonialMarquee({
  items,
  dir = "ltr",
  className = "",
  durationSec = 28,
  pauseOnHover = true,
}: Props) {
  // Duplicate the items so the marquee loop looks continuous
  const loop = React.useMemo(() => [...items, ...items], [items]);

  // Pass duration as a custom CSS property (used in animation keyframes)
  const marqueeStyle: React.CSSProperties = {
    ["--marquee-dur" as any]: `${durationSec}s`,
  };

  return (
    <div
      className={`marquee edge-fade ${className}`}
      data-dir={dir}
      style={marqueeStyle}
    >
      <div
        className={`marquee-inner ${pauseOnHover ? "" : "pointer-events-none"}`}
        aria-hidden={false}
      >
        <Row items={loop} dir={dir} ariaHidden={false} />
      </div>
    </div>
  );
}

/* ========================================================================
   Sub-component: Row
   - Renders one row of testimonial cards
   - Direction (LTR / RTL) is applied to text alignment
   ======================================================================== */
function Row({
  items,
  dir,
  ariaHidden,
}: {
  items: Testimonial[];
  dir: "ltr" | "rtl";
  ariaHidden?: boolean;
}) {
  return (
    <div
      className="inline-flex items-stretch gap-6 whitespace-nowrap"
      aria-hidden={ariaHidden}
    >
      {items.map((t, i) => (
        <figure
          key={`${t.name}-${i}`}
          className="card mx-1 inline-flex min-w-[320px] max-w-[560px] whitespace-normal rounded-2xl px-4 py-3 align-top shadow"
          style={{
            direction: dir,
            textAlign: dir === "rtl" ? "right" : "left",
          }}
        >
          <div className="flex items-start gap-3">
            {/* Placeholder avatar bubble (can be replaced with real avatar later) */}
            <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
            <figcaption className="text-left">
              <strong className="block">{t.name}</strong>
              <blockquote className="text-sm italic text-gray-600 dark:text-gray-300">
                “{t.quote}”
              </blockquote>
            </figcaption>
          </div>
        </figure>
      ))}
    </div>
  );
}
