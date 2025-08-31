"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSchemas } from "../hooks/schemas";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addEntry, fetchEntries } from "@/redux/slices/entrySlice";
import { SideSheet } from "@/components/primitives/SideSheet";
import toast from "react-hot-toast";
import { useI18n } from "@/components/ui/i18n";

export default function EntrySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t, lang } = useI18n();
  const F = t.flows;
  const S = useSchemas();

  const habits = useAppSelector((s) => s.habits.items);
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(S.entrySchema),
    defaultValues: { status: "done" },
  });

  async function onCreate(v: any) {
    await dispatch(
      addEntry({
        habitId: v.habitId,
        mood: v.status === "done" ? "🎉" : v.status === "partial" ? "🙂" : "😐",
        reflection: v.note || undefined,
        quantity: v.quantity,
      } as any)
    );
    await dispatch(fetchEntries(undefined as any));
    toast.success(F.save);
    onOpenChange(false);
  }

  const footer = (
    <div className="flex justify-end">
      <button
        className="rounded bg-indigo-600 px-4 py-2 text-white"
        onClick={handleSubmit(onCreate)}
        disabled={isSubmitting}
      >
        {F.save}
      </button>
    </div>
  );

  return (
    <SideSheet
      open={open}
      onOpenChange={onOpenChange}
      title={F.addEntryTitle}
      footer={footer}
    >
      <div className="space-y-3">
        <div>
          <label className="text-sm">{F.pickHabit}</label>
          <select
            {...register("habitId")}
            className="mt-1 w-full rounded border p-2"
          >
            <option value="">{F.pickHabit}</option>
            {habits.map((h: any) => (
              <option key={h.id} value={h.id}>
                {h.icon ? `${h.icon} ` : ""}
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <select {...register("status")} className="rounded border p-2">
            <option value="done">{F.done}</option>
            <option value="partial">{F.partial}</option>
            <option value="skipped">{F.skipped}</option>
          </select>

          <input
            type="number"
            placeholder={
              lang === "ar" ? "كمية (اختياري)" : "Quantity (optional)"
            }
            {...register("quantity", { valueAsNumber: true })}
            className="flex-1 rounded border p-2"
          />
        </div>

        <div>
          <label className="text-sm">{F.note}</label>
          <textarea
            rows={5}
            {...register("note")}
            className="mt-1 w-full rounded border p-2"
            placeholder={
              lang === "ar"
                ? "شو زبط؟ شو ما زبط؟ خطوة بكرة؟"
                : "What worked? What didn’t? Next step?"
            }
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() => {
              const base = (watch("note") || "").trim();
              const tpl =
                lang === "ar"
                  ? `✓ إنجاز: ...\n✗ ما زبط: ...\n→ خطوة بكرة: ...`
                  : `✓ Win: ...\n✗ Didn't work: ...\n→ Next step: ...`;
              setValue("note", base ? base + "\n\n" + tpl : tpl);
            }}
          >
            {lang === "ar" ? "قالب سريع" : "Quick template"}
          </button>

          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() => {
              const n = watch("note")?.trim() || "";
              if (!n) return;
              const summary = n.length > 160 ? n.slice(0, 157) + "…" : n;
              setValue("note", summary);
            }}
          >
            {lang === "ar" ? "AI تلخيص (تجريبي)" : "AI Summarize (beta)"}
          </button>
        </div>
      </div>
    </SideSheet>
  );
}
