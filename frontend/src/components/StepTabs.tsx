"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Step = {
  id: string;
  title: string;
  content: React.ReactNode;
  /** If explicitly false, the step is disabled (unclickable) */
  ready?: boolean;
};

/**
 * Pure client-side tabs/steps:
 * - Navigation is done with local state only (no URL hashes / router.push).
 * - Prev/Next are <button>s (no <a href> / <Link>) to guarantee no refresh.
 * - Accessible (ARIA roles for tabs/tabpanel, focus management).
 */
export default function StepTabs({ steps }: { steps: Step[] }) {
  const safeSteps = useMemo(() => steps.filter(Boolean), [steps]);
  const [idx, setIdx] = useState(0);

  // Keep selected index valid when steps change or become not-ready
  useEffect(() => {
    if (idx >= safeSteps.length) setIdx(0);
    if (safeSteps[idx]?.ready === false) {
      const firstReady = safeSteps.findIndex((s) => s.ready !== false);
      setIdx(firstReady === -1 ? 0 : firstReady);
    }
  }, [safeSteps, idx]);

  // Focus currently active tab (better keyboard / screen reader experience)
  const tabsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const btn =
      tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")?.[idx];
    btn?.focus({ preventScroll: true });
  }, [idx]);

  const goto = (n: number) => {
    if (n < 0 || n >= safeSteps.length) return;
    if (safeSteps[n]?.ready === false) return;
    setIdx(n);
  };

  const prev = () => goto(idx - 1);
  const next = () => goto(idx + 1);

  return (
    <section className="w-full">
      {/* Tabs header */}
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Steps"
        className="flex flex-wrap gap-3 mb-4"
      >
        {safeSteps.map((s, i) => {
          const active = i === idx;
          const disabled = s.ready === false;
          return (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`panel-${s.id}`}
              id={`tab-${s.id}`}
              disabled={disabled}
              onClick={() => goto(i)}
              className={[
                "px-4 py-2 rounded-full border transition",
                active
                  ? "bg-indigo-500 text-white border-indigo-500 shadow"
                  : "bg-transparent border-[var(--line)] hover:bg-[var(--bg-1)]",
                disabled ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {s.title}
            </button>
          );
        })}
      </div>

      {/* Current panel */}
      {safeSteps[idx] && (
        <div
          role="tabpanel"
          id={`panel-${safeSteps[idx].id}`}
          aria-labelledby={`tab-${safeSteps[idx].id}`}
          className="rounded-2xl border border-[var(--line)] bg-[var(--bg-0)]/40 p-3 md:p-4"
        >
          {safeSteps[idx].content}
        </div>
      )}

      {/* Prev / Next — buttons only (no href or Link) */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={idx === 0}
          className="px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--bg-1)] disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={next}
          disabled={idx >= safeSteps.length - 1}
          className="px-4 py-2 rounded-full bg-indigo-500 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}
