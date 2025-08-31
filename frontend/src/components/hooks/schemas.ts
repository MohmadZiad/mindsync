"use client";
import { z } from "zod";
import { useI18n } from "@/components/ui/i18n";

/* ========= واجهة مريحة داخل الكومبوننت ========= */
export function useSchemas() {
  const { t } = useI18n();
  const E = t.errors;

  const habitBasicsSchema = z.object({
    name: z
      .string()
      .min(2, t.lang === "ar" ? "اسم العادة قصير جداً" : "Name is too short"),
    icon: z.string().optional().nullable(),
    description: z.string().max(180).optional(),
    category: z
      .enum(["health", "study", "work", "faith", "other"])
      .default("other"),
  });

  const habitScheduleSchema = z.object({
    repeat: z.enum(["daily", "days", "perWeek", "monthly"]).default("daily"),
    days: z.array(z.number().min(0).max(6)).optional(),
    perWeek: z.number().min(1, E.min1).max(7).optional(),
    timeWindow: z.enum(["morning", "noon", "evening"]).optional(),
  });

  const habitTargetSchema = z.object({
    mode: z.enum(["binary", "quantified"]).default("binary"),
    amount: z.number().min(1, E.min1).max(10000).optional(),
    unit: z.enum(["times", "minutes", "pages"]).optional(),
  });

  const habitReminderSchema = z.object({
    reminders: z
      .array(
        z.object({
          hh: z.number().min(0).max(23),
          mm: z.number().min(0).max(59),
          days: z.array(z.number().min(0).max(6)).optional(),
        })
      )
      .optional(),
  });

  const habitCreateSchema = habitBasicsSchema
    .and(habitScheduleSchema)
    .and(habitTargetSchema)
    .and(habitReminderSchema);

  type HabitCreate = z.infer<typeof habitCreateSchema>;

  const entrySchema = z.object({
    habitId: z.string().min(1, E.required),
    status: z.enum(["done", "partial", "skipped"]).default("done"),
    quantity: z.number().min(0).max(10000).optional(),
    note: z.string().max(1000).optional(),
  });
  type EntryCreate = z.infer<typeof entrySchema>;

  return {
    habitBasicsSchema,
    habitScheduleSchema,
    habitTargetSchema,
    habitReminderSchema,
    habitCreateSchema,
    typeHabitCreate: null as unknown as HabitCreate, // مجرد type helper
    entrySchema,
    typeEntryCreate: null as unknown as EntryCreate,
  };
}

/* ========= إبقاء النسخ الساكنة القديمة لتجنّب الكسر ========= */
export const habitBasicsSchema = z.object({
  name: z.string().min(2, "اسم العادة قصير جداً"),
  icon: z.string().optional().nullable(),
  description: z.string().max(180).optional(),
  category: z
    .enum(["health", "study", "work", "faith", "other"])
    .default("other"),
});

export const habitScheduleSchema = z.object({
  repeat: z.enum(["daily", "days", "perWeek", "monthly"]).default("daily"),
  days: z.array(z.number().min(0).max(6)).optional(),
  perWeek: z.number().min(1).max(7).optional(),
  timeWindow: z.enum(["morning", "noon", "evening"]).optional(),
});

export const habitTargetSchema = z.object({
  mode: z.enum(["binary", "quantified"]).default("binary"),
  amount: z.number().min(1).max(10000).optional(),
  unit: z.enum(["times", "minutes", "pages"]).optional(),
});

export const habitReminderSchema = z.object({
  reminders: z
    .array(
      z.object({
        hh: z.number().min(0).max(23),
        mm: z.number().min(0).max(59),
        days: z.array(z.number().min(0).max(6)).optional(),
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
  quantity: z.number().min(0).max(10000).optional(),
  note: z.string().max(1000).optional(),
});
export type EntryCreate = z.infer<typeof entrySchema>;
