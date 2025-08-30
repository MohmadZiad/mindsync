"use client";

import * as React from "react";

type Testimonial = {
  name: string;
  quote: string;
};

type Props = {
  items: Testimonial[];
  dir?: "ltr" | "rtl";
  className?: string;
  /** المدة بالثواني للّفة كاملة */
  durationSec?: number;
  /** إيقاف الحركة عند الـ hover (افتراضي true) */
  pauseOnHover?: boolean;
};

export default function TestimonialMarquee({
  items,
  dir = "ltr",
  className = "",
  durationSec = 28,
  pauseOnHover = true,
}: Props) {
  // نكرّر الآيتمز مرّتين للوب سلس
  const loop = React.useMemo(() => [...items, ...items], [items]);

  const marqueeStyle: React.CSSProperties = {
    // نمرّر المدة لـ CSS عبر custom prop
    // وبتكون مستخدمة في .marquee-inner بالـ CSS
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

/** صف واحد من الكروت */
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
