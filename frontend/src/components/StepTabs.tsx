"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/ui/i18n";

export type Step = {
  id: string;
  title: string;
  content: React.ReactNode;
  ready?: boolean;
};

export default function StepTabs({ steps }: { steps: Step[] }) {
  const { t } = useI18n();
  const labels = { prev: t.prev, next: t.next };

  const router = useRouter();
  const params = useSearchParams();

  const urlId = params.get("step") || steps[0]?.id || "";
  const urlIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === urlId)
  );
  const [index, setIndex] = useState(urlIndex);
  useEffect(() => setIndex(urlIndex), [urlIndex]);

  const current = steps[index] ?? steps[0];
  const canGoNext = useMemo(
    () => steps[index]?.ready !== false,
    [steps, index]
  );

  const goUrl = (id: string) => {
    const q = new URLSearchParams(params.toString());
    q.set("step", id);
    router.replace(`?${q.toString()}`);
  };
  useEffect(() => {
    const id = steps[index]?.id;
    if (id) goUrl(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const dir =
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("dir") || "ltr"
      : "ltr";
  const isRTL = dir === "rtl";

  const goPrev = () => index > 0 && setIndex(index - 1);
  const goNext = () =>
    index < steps.length - 1 && canGoNext && setIndex(index + 1);

  // indicator + scroll
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });
  useEffect(() => {
    const el = tabRefs.current[index];
    const wrap = el?.closest(".tabs-wrap") as HTMLElement | null;
    if (!el || !wrap) return;
    const r = el.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    setIndicator({ width: r.width, left: r.left - wr.left + wrap.scrollLeft });
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index, steps.length]);

  return (
    <div className="w-full">
      <div className="relative">
        <ol className="tabs-wrap relative flex gap-2 overflow-x-auto scrollbar-none edge-fade py-1">
          {steps.map((s, i) => {
            const isActive = i === index;
            const disabled =
              i > index + 1 || (i > index && steps[index]?.ready === false);
            return (
              <li key={s.id} className="shrink-0">
                <button
                  ref={(el) => (tabRefs.current[i] = el)}
                  onClick={() => setIndex(i)}
                  role="tab"
                  aria-selected={isActive}
                  disabled={disabled}
                  className={`touch px-3 py-1.5 rounded-full border text-sm theme-smooth
                    ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                    }
                    ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                  {s.title}
                </button>
              </li>
            );
          })}
          <span
            className="pointer-events-none absolute bottom-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-[width,transform] duration-300"
            style={{
              width: indicator.width,
              transform: `translateX(${indicator.left}px)`,
            }}
          />
        </ol>
      </div>

      <div
        className="mt-3 rounded-2xl border bg-white dark:bg-gray-900 p-4 shadow-sm theme-smooth overflow-hidden"
        role="tabpanel"
        aria-labelledby={`tab-${current?.id}`}
      >
        {current?.content}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="btn btn--ghost touch disabled:opacity-50"
        >
          {labels.prev}
        </button>
        <button
          onClick={goNext}
          disabled={index === steps.length - 1 || !canGoNext}
          className="btn btn--primary touch disabled:opacity-50"
        >
          {labels.next}
        </button>
      </div>
    </div>
  );
}
