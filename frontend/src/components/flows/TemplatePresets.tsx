"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { useI18n } from "@/components/ui/i18n";

type HabitCreateShape = {
  name: string;
  icon?: string | null;
  description?: string;
  category?: "health" | "study" | "work" | "faith" | "other";
  repeat?: "daily" | "perWeek" | "days" | "monthly";
  perWeek?: number;
  timeWindow?: "morning" | "noon" | "evening";
  mode?: "binary" | "quantified";
  amount?: number;
  unit?: "times" | "minutes" | "pages";
};

const HABIT_TEMPLATES: Array<Partial<HabitCreateShape> & { id: string }> = [
  {
    id: "water",
    name: "Water",
    icon: "💧",
    description: "Drink water",
    category: "health",
    repeat: "daily",
    timeWindow: "morning",
    mode: "quantified",
    amount: 8,
    unit: "times",
  },
  {
    id: "reading",
    name: "Reading",
    icon: "📚",
    description: "Read a few pages",
    category: "study",
    repeat: "daily",
    timeWindow: "evening",
    mode: "quantified",
    amount: 10,
    unit: "pages",
  },
  {
    id: "workout",
    name: "Workout",
    icon: "🏃‍♂️",
    description: "Short workout",
    category: "health",
    repeat: "perWeek",
    perWeek: 4,
    timeWindow: "noon",
    mode: "quantified",
    amount: 20,
    unit: "minutes",
  },
  {
    id: "prayer",
    name: "Prayer",
    icon: "🕌",
    description: "Daily prayer",
    category: "faith",
    repeat: "daily",
    timeWindow: "evening",
    mode: "binary",
  },
  {
    id: "focus",
    name: "Deep work",
    icon: "🧠",
    description: "Focused session",
    category: "work",
    repeat: "perWeek",
    perWeek: 5,
    timeWindow: "morning",
    mode: "quantified",
    amount: 45,
    unit: "minutes",
  },
];

export function HabitTemplates() {
  const { t, lang } = useI18n();
  const F = t.flows;
  const { setValue, getValues } = useFormContext<any>();

  function apply(tpl: (typeof HABIT_TEMPLATES)[number]) {
    const v = getValues();
    const patch = {
      name: v.name || tpl.name,
      icon: v.icon || tpl.icon || "",
      description: v.description || tpl.description || "",
      category: v.category || tpl.category || "other",
      repeat: v.repeat || tpl.repeat || "daily",
      perWeek: v.perWeek ?? tpl.perWeek ?? undefined,
      timeWindow: v.timeWindow || tpl.timeWindow || "evening",
      mode: v.mode || tpl.mode || "binary",
      amount: v.amount ?? tpl.amount ?? undefined,
      unit: v.unit || tpl.unit || "times",
    };
    (Object.keys(patch) as Array<keyof typeof patch>).forEach((k) => {
      setValue(k as any, (patch as any)[k], { shouldDirty: true, shouldTouch: true });
    });
  }

  const L = {
    title: lang === "ar" ? "قوالب سريعة" : "Quick templates",
    apply: lang === "ar" ? "تطبيق" : "Apply",
  };

  return (
    <div className="mt-2">
      <div className="text-xs mb-1 text-gray-500">{L.title}</div>
      <div className="flex flex-wrap gap-2">
        {HABIT_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
            onClick={() => apply(tpl)}
            title={F?.templatesApply || L.apply}
          >
            {tpl.icon} {tpl.name}
          </button>
        ))}
      </div>
    </div>
  );
}
