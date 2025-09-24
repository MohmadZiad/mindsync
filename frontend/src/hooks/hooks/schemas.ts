"use client";
import { z } from "zod";
import { useI18n } from "@/components/ui/i18n";


const asNumber = (min?: number, max?: number) =>
  z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return undefined;
      const n = typeof v === "string" ? Number(v) : (v as number);
      return Number.isFinite(n) ? n : undefined;
    },
    z.union([z.number(), z.undefined()]).superRefine((val, ctx) => {
      if (val === undefined) return;
      if (min !== undefined && val < min) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `>= ${min}` });
      }
      if (max !== undefined && val > max) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `<= ${max}` });
      }
    })
  );

const stringMinTrim = (min: number, message?: string) =>
  z
    .string()
    .min(min, message)
    .transform((s) => s.trim());

const stringOptTrimmed = (max?: number) => {
  let base = z.string().optional();
  if (typeof max === "number")
    base = base.refine((v) => !v || v.length <= max, { message: `<= ${max}` });
  return base.transform((s) => (s?.trim() ? s.trim() : undefined));
};

const DaysEnum = z.enum(["daily", "days", "perWeek", "monthly"]);
const CategoryEnum = z.enum(["health", "study", "work", "faith", "other"]);
const TimeWindowEnum = z.enum(["morning", "noon", "evening"]);
const ModeEnum = z.enum(["binary", "quantified"]);
const UnitEnum = z.enum(["times", "minutes", "pages"]);


export function useSchemas() {
  const { t, lang } = useI18n();
  const E = t.errors;

  const habitBasicsSchema = z.object({
    name: stringMinTrim(
      2,
      lang === "ar" ? "اسم العادة قصير جداً" : "Name is too short"
    ),
    icon: z.string().nullable().optional(),
    description: stringOptTrimmed(180),
    category: CategoryEnum.default("other"),
  });

  /* ---------- Schedule ---------- */
  const habitScheduleSchema = z
    .object({
      repeat: DaysEnum.default("daily"),
      days: z.array(z.number().int().min(0).max(6)).optional(),
      perWeek: asNumber(1, 7),
      timeWindow: TimeWindowEnum.optional(),
    })
    .superRefine((v, ctx) => {
      if (v.repeat === "days" && (!v.days || v.days.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["days"],
          message:
            lang === "ar" ? "اختر على الأقل يوم واحد" : "Pick at least one day",
        });
      }
      if (
        v.repeat === "perWeek" &&
        (v.perWeek === undefined || v.perWeek < 1)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["perWeek"],
          message:
            lang === "ar" ? "حدد عدد المرات بالأسبوع" : "Set times per week",
        });
      }
    });

  /* ---------- Target ---------- */
  const habitTargetSchema = z
    .object({
      mode: ModeEnum.default("binary"),
      amount: asNumber(1, 10000),
      unit: UnitEnum.optional(),
    })
    .superRefine((v, ctx) => {
      if (v.mode === "quantified" && (v.amount === undefined || v.amount < 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message:
            E.min1 ||
            (lang === "ar" ? "اختر قيمة صحيحة" : "Enter a valid amount"),
        });
      }
      if (v.mode === "quantified" && !v.unit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["unit"],
          message: lang === "ar" ? "اختر وحدة" : "Pick a unit",
        });
      }
    });

  /* ---------- Reminders ---------- */
  const reminderItem = z.object({
    hh: asNumber(0, 23).transform(
      (v) => v ?? 0
    ) as unknown as z.ZodType<number>,
    mm: asNumber(0, 59).transform(
      (v) => v ?? 0
    ) as unknown as z.ZodType<number>,
    days: z.array(z.number().int().min(0).max(6)).optional(),
  });

  const habitReminderSchema = z.object({
    reminders: z
      .array(reminderItem)
      .optional()
      .transform((arr) => {
        if (!arr) return arr;
        const seen = new Set<string>();
        return arr.filter((r) => {
          const key = `${r.hh}:${r.mm}:${(r.days || []).join(",")}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }),
  });

  /* ---------- Create (full) ---------- */
  const habitCreateSchema = habitBasicsSchema
    .and(habitScheduleSchema)
    .and(habitTargetSchema)
    .and(habitReminderSchema);
  type HabitCreate = z.infer<typeof habitCreateSchema>;

  /* ---------- Entries ---------- */
  const entrySchema = z.object({
    habitId: z
      .string()
      .min(1, E.required || (lang === "ar" ? "مطلوب" : "Required")),
    status: z.enum(["done", "partial", "skipped"]).default("done"),
    quantity: asNumber(0, 10000),
    note: stringOptTrimmed(1000),
  });
  type EntryCreate = z.infer<typeof entrySchema>;

  /* ---------- UI Metadata جاهز للـ Tooltip/Help ---------- */
  const fieldMeta = {
    name: {
      label: t.flows.habitName,
      placeholder: lang === "ar" ? "مثال: قراءة" : "e.g. Reading",
      tip:
        lang === "ar"
          ? "سمّ العادة بصيغة فعل واضح مثل: قراءة 20 صفحة"
          : "Use an action name like: Read 20 pages",
    },
    icon: {
      label: t.flows.emoji,
      tip:
        lang === "ar"
          ? "ايموجي بسيط يسهّل تذكّر العادة"
          : "A simple emoji helps recognition",
    },
    perWeek: {
      label: lang === "ar" ? "مرات بالأسبوع" : "Times per week",
      tip: lang === "ar" ? "من 1 إلى 7 مرات" : "Between 1 and 7 times",
    },
    amount: {
      label: t.flows.amount,
      tip:
        lang === "ar"
          ? "أدخل قيمة عددية (مثلاً 20 دقيقة)"
          : "Enter a numeric value (e.g., 20 minutes)",
    },
    unit: {
      label: t.flows.unit,
      tip:
        lang === "ar"
          ? "اختر وحدة تناسب هدفك"
          : "Pick a unit that matches your target",
    },
    reminders: {
      label: lang === "ar" ? "تذكيرات" : "Reminders",
      tip:
        lang === "ar"
          ? "يمكنك إضافة أكثر من وقت وتحديد أيام معيّنة"
          : "You can add multiple times and specific days",
    },
  } as const;

  /* ---------- Default values موحّدة للفورم ---------- */
  const habitDefaultValues: HabitCreate = {
    name: "",
    description: "",
    icon: "",
    category: "other",
    repeat: "daily",
    days: [],
    perWeek: 3,
    timeWindow: "evening",
    mode: "binary",
    amount: undefined,
    unit: undefined,
    reminders: [],
  } as HabitCreate;

  const entryDefaultValues: EntryCreate = {
    habitId: "",
    status: "done",
    quantity: undefined,
    note: "",
  } as EntryCreate;

  return {
    habitBasicsSchema,
    habitScheduleSchema,
    habitTargetSchema,
    habitReminderSchema,
    habitCreateSchema,
    typeHabitCreate: null as unknown as HabitCreate,
    entrySchema,
    typeEntryCreate: null as unknown as EntryCreate,
    fieldMeta,
    habitDefaultValues,
    entryDefaultValues,
  };
}

/* ========= النسخ الساكنة القديمة (للتوافق الخلفي) ========= */
export const habitBasicsSchema = z.object({
  name: z.string().min(2, "اسم العادة قصير جداً"),
  icon: z.string().optional().nullable(),
  description: z.string().max(180).optional(),
  category: CategoryEnum.default("other"),
});

export const habitScheduleSchema = z.object({
  repeat: DaysEnum.default("daily"),
  days: z.array(z.number().int().min(0).max(6)).optional(),
  perWeek: asNumber(1, 7),
  timeWindow: TimeWindowEnum.optional(),
});

export const habitTargetSchema = z.object({
  mode: ModeEnum.default("binary"),
  amount: asNumber(1, 10000),
  unit: UnitEnum.optional(),
});

export const habitReminderSchema = z.object({
  reminders: z
    .array(
      z.object({
        hh: asNumber(0, 23) as unknown as z.ZodType<number>,
        mm: asNumber(0, 59) as unknown as z.ZodType<number>,
        days: z.array(z.number().int().min(0).max(6)).optional(),
      })
    )
    .optional(),
});

export const habitCreateSchema = habitBasicsSchema
  .and(habitScheduleSchema)
  .and(habitTargetSchema)
  .and(habitReminderSchema);
export type HabitCreate = z.infer<typeof habitCreateSchema>;

export const entrySchema = z.object({
  habitId: z.string().min(1),
  status: z.enum(["done", "partial", "skipped"]).default("done"),
  quantity: asNumber(0, 10000),
  note: z.string().max(1000).optional(),
});
export type EntryCreate = z.infer<typeof entrySchema>;
