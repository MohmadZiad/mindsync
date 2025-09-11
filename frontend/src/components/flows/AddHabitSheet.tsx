"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSchemas } from "../hooks/schemas";
import { useAppDispatch } from "@/redux/hooks";
import { addHabit } from "@/redux/slices/habitSlice";
import { SideSheet } from "@/components/primitives/SideSheet";
import toast from "react-hot-toast";
import { useI18n } from "@/components/ui/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { HabitTemplates } from "./TemplatePresets";

type HabitCreateForm = {
  name: string;
  description?: string;
  icon?: string;
  category: "health" | "study" | "work" | "faith" | "other";
  repeat: "daily" | "perWeek" | "days" | "monthly";
  perWeek?: number;
  timeWindow: "morning" | "noon" | "evening";
  mode: "binary" | "quantified";
  amount?: number;
  unit: "times" | "minutes" | "pages";
  reminders: Array<{ at: string }>;
};

function Row({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-[var(--text-2)]">{label}</span>
      {children}
    </label>
  );
}

export default function AddHabitSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t, lang } = useI18n();
  const F = t.flows;
  const dispatch = useAppDispatch();

  const S = useSchemas();
  const methods = useForm<HabitCreateForm>({
    resolver: zodResolver(S.habitCreateSchema as any),
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
    mode: "onChange",
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
  const stepsTotal = 4;

  const canNext = methods.formState.isValid || step < 2; // اسمح بالتنقل المبكر، مع فحص نهائي قبل الإنشاء

  const goPrev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const goNext = useCallback(
    () => setStep((s) => Math.min(stepsTotal - 1, s + 1)),
    [stepsTotal]
  );

  async function onCreate(v: HabitCreateForm) {
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

  // keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "Enter" && !e.shiftKey) {
        if (step < stepsTotal - 1) {
          e.preventDefault();
          goNext();
        } else {
          e.preventDefault();
          methods.handleSubmit(onCreate)();
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, methods, onCreate, onOpenChange, step, stepsTotal]);

  const footer = (
    <div className="flex items-center justify-between">
      <button
        className="btn-secondary"
        onClick={goPrev}
        disabled={step === 0}
        aria-disabled={step === 0}
      >
        <ChevronLeft className="inline h-4 w-4" /> {t.prev}
      </button>

      <div className="flex items-center gap-3 text-xs text-[var(--text-3)]">
        {lang === "ar" ? "الخطوة" : "Step"} {step + 1}/{stepsTotal}
        <div className="h-1.5 w-40 rounded-full bg-[var(--bg-2)] overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((step + 1) / stepsTotal) * 100}%` }}
          />
        </div>
      </div>

      {step < stepsTotal - 1 ? (
        <button className="btn-primary" onClick={goNext} disabled={!canNext}>
          {t.next} <ChevronRight className="inline h-4 w-4" />
        </button>
      ) : (
        <button
          className="btn-primary"
          onClick={methods.handleSubmit(onCreate)}
        >
          <Check className="inline h-4 w-4" /> {F.create}
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
        <div className="relative">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <Basics />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <Schedule />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <Target />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <Review />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FormProvider>
    </SideSheet>
  );
}

function Basics() {
  const { t, lang } = useI18n();
  const F = t.flows;
  const {
    register,
    formState: { errors },
  } = useFormContext<HabitCreateForm>();
  return (
    <div className="space-y-3">
      <Row label={F.habitName}>
        <input
          {...register("name")}
          className="input"
          placeholder={lang === "ar" ? "مثال: قراءة" : "e.g. Reading"}
          autoFocus
          aria-invalid={!!errors.name}
        />
        {"name" in errors && (
          <div className="hint-error">
            {String((errors as any).name?.message)}
          </div>
        )}
      </Row>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Row label={F.emoji}>
          <input
            {...register("icon")}
            className="input text-center w-28"
            placeholder="📚"
          />
        </Row>

        <Row label={F.category}>
          <select {...register("category")} className="input">
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
          className="input"
          rows={3}
          placeholder="…"
        />
      </Row>

      {/* Templates */}
      <HabitTemplates />
    </div>
  );
}

function Schedule() {
  const { t, lang } = useI18n();
  const F = t.flows;
  const { register, watch } = useFormContext<HabitCreateForm>();
  const repeat = watch("repeat");
  return (
    <div className="space-y-3">
      <Row label={F.frequency}>
        <select {...register("repeat")} className="input">
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
            className="input w-28"
          />
        </Row>
      )}

      <Row label={F.timePref}>
        <select {...register("timeWindow")} className="input">
          <option value="morning">{lang === "ar" ? "صباح" : "Morning"}</option>
          <option value="noon">{lang === "ar" ? "ظهر" : "Noon"}</option>
          <option value="evening">{lang === "ar" ? "مساء" : "Evening"}</option>
        </select>
      </Row>
    </div>
  );
}

function Target() {
  const { t } = useI18n();
  const F = t.flows;
  const { register, watch } = useFormContext<HabitCreateForm>();
  const mode = watch("mode");
  return (
    <div className="space-y-3">
      <Row label={F.targetType}>
        <select {...register("mode")} className="input">
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
              className="input w-28"
            />
          </Row>
          <Row label={F.unit}>
            <select {...register("unit")} className="input">
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
  const v = useFormContext<HabitCreateForm>().getValues();
  return (
    <div className="space-y-2 text-sm">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-3">
        <div>
          <b>{lang === "ar" ? "الاسم" : "Name"}:</b> {v.icon} {v.name || "—"}
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
      <div className="text-[var(--text-3)]">
        {lang === "ar"
          ? "تقدر ترجع لأي خطوة وتعدل قبل الحفظ."
          : "You can go back and edit before saving."}
      </div>
    </div>
  );
}
