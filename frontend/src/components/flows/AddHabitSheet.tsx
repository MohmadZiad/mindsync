"use client";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSchemas } from "../hooks/schemas";
import { useAppDispatch } from "@/redux/hooks";
import { addHabit } from "@/redux/slices/habitSlice";
import { SideSheet } from "@/components/primitives/SideSheet";
import toast from "react-hot-toast";
import { useI18n } from "@/components/ui/i18n";

export default function AddHabitSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const F = t.flows;
  const dispatch = useAppDispatch();

  const S = useSchemas();
  const methods = useForm<any>({
    resolver: zodResolver(S.habitCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      category: "other",
      repeat: "daily",
      perWeek: 3,
      timeWindow: "evening",
      mode: "binary",
      amount: undefined,
      unit: "times",
      reminders: [],
    },
  });

  // autosave draft
  useEffect(() => {
    const key = "habit_draft";
    const sub = methods.watch((all) => {
      try {
        localStorage.setItem(key, JSON.stringify(all));
      } catch {}
    });
    const saved = localStorage.getItem(key);
    if (saved) methods.reset(JSON.parse(saved));
    return () => sub.unsubscribe();
  }, [methods]);

  const [step, setStep] = useState(0);
  const canNext = true;

  async function onCreate(v: any) {
    await dispatch(
      addHabit({
        name: v.name,
        description: v.description,
        icon: v.icon || null,
        frequency: v.repeat === "daily" ? "daily" : "weekly",
      } as any)
    );
    toast.success(F.created + " 🎉");
    onOpenChange(false);
  }

  const footer = (
    <div className="flex items-center justify-between">
      <button
        className="rounded border px-3 py-2"
        onClick={() => setStep((s) => Math.max(0, s - 1))}
        disabled={step === 0}
      >
        {t.prev}
      </button>
      {step < 3 ? (
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={() => setStep((s) => s + 1)}
          disabled={!canNext}
        >
          {t.next}
        </button>
      ) : (
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-white"
          onClick={methods.handleSubmit(onCreate)}
        >
          {F.create}
        </button>
      )}
    </div>
  );

  return (
    <SideSheet
      open={open}
      onOpenChange={onOpenChange}
      title={F.addHabitTitle}
      footer={footer}
    >
      <FormProvider {...methods}>
        <div className="mb-3 text-sm text-gray-500">
          {t.lang === "ar" ? "الخطوة" : "Step"} {step + 1} / 4
        </div>
        {step === 0 && <Basics />}
        {step === 1 && <Schedule />}
        {step === 2 && <Target />}
        {step === 3 && <Review />}
      </FormProvider>
    </SideSheet>
  );
}

function Row({ label, children }: any) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function Basics() {
  const { t, lang } = useI18n();
  const F = t.flows;
  const {
    register,
    formState: { errors },
  } = useFormContext<any>();
  return (
    <div className="space-y-3">
      <Row label={F.habitName}>
        <input
          {...register("name")}
          className="w-full rounded border p-2"
          placeholder={lang === "ar" ? "مثال: قراءة" : "e.g. Reading"}
        />
        {"name" in errors && (
          <div className="text-xs text-red-600">
            {String((errors as any).name?.message)}
          </div>
        )}
      </Row>

      <div className="flex gap-2">
        <Row label={F.emoji}>
          <input
            {...register("icon")}
            className="w-28 rounded border p-2"
            placeholder="📚"
          />
        </Row>

        <Row label={F.category}>
          <select {...register("category")} className="rounded border p-2">
            <option value="other">{lang === "ar" ? "أخرى" : "Other"}</option>
            <option value="health">{lang === "ar" ? "صحة" : "Health"}</option>
            <option value="study">{lang === "ar" ? "دراسة" : "Study"}</option>
            <option value="work">{lang === "ar" ? "عمل" : "Work"}</option>
            <option value="faith">{lang === "ar" ? "دين" : "Faith"}</option>
          </select>
        </Row>
      </div>

      <Row label={F.description}>
        <textarea
          {...register("description")}
          className="w-full rounded border p-2"
          rows={3}
        />
      </Row>

      {/* قوالب سريعة بسيطة */}
      <HabitTemplates />
    </div>
  );
}

function Schedule() {
  const { t, lang } = useI18n();
  const F = t.flows;
  const { register, watch } = useFormContext<any>();
  const repeat = watch("repeat");
  return (
    <div className="space-y-3">
      <Row label={F.frequency}>
        <select {...register("repeat")} className="rounded border p-2">
          <option value="daily">{F.daily}</option>
          <option value="perWeek">
            {lang === "ar" ? "مرات/أسبوع" : "Times/Week"}
          </option>
          <option value="days">
            {lang === "ar" ? "أيام محددة" : "Specific days"}
          </option>
          <option value="monthly">{lang === "ar" ? "شهري" : "Monthly"}</option>
        </select>
      </Row>

      {repeat === "perWeek" && (
        <Row label={lang === "ar" ? "مرات بالأسبوع" : "Times per week"}>
          <input
            type="number"
            min={1}
            max={7}
            {...register("perWeek", { valueAsNumber: true })}
            className="w-28 rounded border p-2"
          />
        </Row>
      )}

      <Row label={F.timePref}>
        <select {...register("timeWindow")} className="rounded border p-2">
          <option value="morning">{lang === "ar" ? "صباح" : "Morning"}</option>
          <option value="noon">{lang === "ar" ? "ظهر" : "Noon"}</option>
          <option value="evening">{lang === "ar" ? "مساء" : "Evening"}</option>
        </select>
      </Row>
    </div>
  );
}

function Target() {
  const { t, lang } = useI18n();
  const F = t.flows;
  const { register, watch } = useFormContext<any>();
  const mode = watch("mode");
  return (
    <div className="space-y-3">
      <Row label={F.targetType}>
        <select {...register("mode")} className="rounded border p-2">
          <option value="binary">{F.binary}</option>
          <option value="quantified">{F.quantified}</option>
        </select>
      </Row>

      {mode === "quantified" && (
        <div className="flex items-end gap-2">
          <Row label={F.amount}>
            <input
              type="number"
              min={1}
              {...register("amount", { valueAsNumber: true })}
              className="w-28 rounded border p-2"
            />
          </Row>
          <Row label={F.unit}>
            <select {...register("unit")} className="rounded border p-2">
              <option value="times">{F.times}</option>
              <option value="minutes">{F.minutes}</option>
              <option value="pages">{F.pages}</option>
            </select>
          </Row>
        </div>
      )}
    </div>
  );
}

function Review() {
  const { t, lang } = useI18n();
  const F = t.flows;
  const v = useFormContext<any>().getValues();
  return (
    <div className="space-y-2 text-sm">
      <div className="rounded border p-3 bg-gray-50">
        <div>
          <b>{lang === "ar" ? "الاسم" : "Name"}:</b> {v.icon} {v.name}
        </div>
        <div>
          <b>{F.category}:</b> {v.category}
        </div>
        <div>
          <b>{lang === "ar" ? "التكرار" : "Repeat"}:</b> {v.repeat}
        </div>
        {v.mode === "quantified" && (
          <div>
            <b>{lang === "ar" ? "الهدف" : "Target"}:</b> {v.amount} {v.unit}
          </div>
        )}
        {v.description && (
          <div>
            <b>{lang === "ar" ? "الوصف" : "Description"}:</b> {v.description}
          </div>
        )}
      </div>
      <div className="text-gray-500">
        {lang === "ar"
          ? "تقدر ترجع لأي خطوة وتعدل قبل الحفظ."
          : "You can go back and edit before saving."}
      </div>
    </div>
  );
}

function HabitTemplates() {
  const { lang } = useI18n();
  const { setValue, watch } = useFormContext<any>();
  const apply = (name: string, icon: string, cat: string, desc: string) => {
    const curr = watch();
    setValue("name", curr.name || name);
    setValue("icon", curr.icon || icon);
    setValue("category", curr.category || cat);
    if (!curr.description) setValue("description", desc);
  };
  return (
    <div className="mt-2">
      <div className="text-xs text-gray-500 mb-1">
        {lang === "ar" ? "قوالب سريعة" : "Quick templates"}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded-full border"
          onClick={() =>
            apply(
              "Water",
              "💧",
              "health",
              lang === "ar" ? "اشرب 6-8 كوب" : "Drink 6–8 cups"
            )
          }
        >
          Water 💧
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded-full border"
          onClick={() =>
            apply(
              "Reading",
              "📚",
              "study",
              lang === "ar" ? "20 دقيقة/يوم" : "20 min/day"
            )
          }
        >
          Reading 📚
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded-full border"
          onClick={() =>
            apply(
              "Workout",
              "🏋️",
              "health",
              lang === "ar" ? "تمرين خفيف" : "Light workout"
            )
          }
        >
          Workout 🏋️
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded-full border"
          onClick={() =>
            apply(
              "Prayer",
              "🙇‍♂️",
              "faith",
              lang === "ar" ? "صلاتك بوقتها" : "Prayer on time"
            )
          }
        >
          Prayer 🙇‍♂️
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded-full border"
          onClick={() =>
            apply(
              "Deep work",
              "🧠",
              "work",
              lang === "ar" ? "60 دقيقة تركيز" : "60 min focus"
            )
          }
        >
          Deep work 🧠
        </button>
      </div>
    </div>
  );
}
