"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Step = {
  title: string;
  desc: string;
  emoji?: string;
};

/**
 * Scrollytelling component for "How it works"
 * - Sticky phone mockup at left
 * - Steps at right, highlight active one
 */
export default function HowItWorksScrolly({
  steps,
  className = "",
}: {
  steps: Step[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  // observe sections to set active index (تحسين العتبات)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const idx = Number((e.target as HTMLElement).dataset.index);
          setActive((prev) => (Number.isFinite(idx) ? idx : prev));
        });
      },
      { rootMargin: "0px 0px -25% 0px", threshold: 0.35 }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const activeStep = useMemo(() => steps[active] ?? steps[0], [steps, active]);

  return (
    <section className={`grid md:grid-cols-2 gap-8 ${className}`}>
      {/* Left: Sticky phone */}
      <div className="md:sticky md:top-24 self-start">
        <div className="relative mx-auto w-[320px] h-[640px] rounded-[40px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="p-6 h-full flex flex-col">
            <div className="text-4xl mb-2">{activeStep.emoji || "✨"}</div>
            <h4 className="text-lg font-semibold">{activeStep.title}</h4>
            <p className="text-slate-600 dark:text-slate-300">
              {activeStep.desc}
            </p>

            <div className="mt-auto flex gap-1" aria-hidden="true">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i === active
                      ? "bg-indigo-600"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Steps */}
      <div className="space-y-10">
        {steps.map((s, i) => (
          <div
            key={i}
            data-index={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`rounded-2xl border p-6 transition ${
              i === active
                ? "border-indigo-500 shadow-lg"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="text-2xl">{s.emoji}</div>
            <h3 className="text-2xl font-bold mt-2">{s.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 mt-2">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
