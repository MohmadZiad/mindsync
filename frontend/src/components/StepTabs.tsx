// src/components/StepTabs.tsx
"use client";
import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type Step = {
  id: string;
  title: string;
  content: React.ReactNode;
  /** إذا false يمنع الانتقال للخطوة التالية */
  ready?: boolean;
};

export default function StepTabs({ steps }: { steps: Step[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const currentId = params.get("step") || steps[0].id;
  const index = Math.max(
    0,
    steps.findIndex((s) => s.id === currentId)
  );
  const current = steps[index] ?? steps[0];

  const canGoNext = useMemo(() => {
    const step = steps[index];
    return step?.ready !== false;
  }, [steps, index]);

  const goTo = (id: string) => {
    const q = new URLSearchParams(params.toString());
    q.set("step", id);
    router.replace(`?${q.toString()}`);
  };

  const goPrev = () => index > 0 && goTo(steps[index - 1].id);
  const goNext = () =>
    index < steps.length - 1 && canGoNext && goTo(steps[index + 1].id);

  return (
    <div className="w-full">
      <ol className="flex flex-wrap items-center gap-2 mb-4">
        {steps.map((s, i) => {
          const isActive = i === index;
          const isDone = i < index;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => goTo(s.id)}
                className={`flex items-center gap-2 rounded-md border px-3 py-1 text-sm
                  ${isActive ? "bg-white" : "bg-gray-50 hover:bg-white"}
                  ${isDone ? "opacity-80" : ""}`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    isActive ? "font-semibold" : ""
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`${isActive ? "font-semibold" : "text-gray-600"}`}
                >
                  {s.title}
                </span>
              </button>
              {i < steps.length - 1 && <span className="text-gray-400">—</span>}
            </li>
          );
        })}
      </ol>

      <div className="rounded-md border bg-white p-4">{current.content}</div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
        >
          السابق
        </button>
        <button
          onClick={goNext}
          disabled={index === steps.length - 1 || !canGoNext}
          className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
