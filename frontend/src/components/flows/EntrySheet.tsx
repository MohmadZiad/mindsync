"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSchemas } from "../hooks/schemas";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addEntry, fetchEntries } from "@/redux/slices/entrySlice";
import { SideSheet } from "@/components/primitives/SideSheet";
import toast from "react-hot-toast";
import { useI18n } from "@/components/ui/i18n";
import NoteModal, { type NotePayload } from "@/components/NoteModal";

type FormData = {
  habitId: string;
  status: "done" | "partial" | "skipped";
  quantity?: number;
  note?: string;
};

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
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(S.entrySchema),
    defaultValues: { status: "done" },
  });

  // === NEW: Note modal state (preview attachments locally) ===
  const [openNote, setOpenNote] = useState(false);
  const [attachments, setAttachments] = useState<{
    imageDataUrl?: string | null;
    drawingDataUrl?: string | null;
  }>({});

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      reset({ status: "done", habitId: "", quantity: undefined, note: "" });
      setOpenNote(false);
      setAttachments({});
    }
  }, [open, reset]);

  async function onCreate(v: FormData) {
    await dispatch(
      addEntry({
        habitId: v.habitId,
        mood: v.status === "done" ? "🎉" : v.status === "partial" ? "🙂" : "😐",
        reflection: v.note || undefined,
        quantity:
          typeof v.quantity === "number" && !Number.isNaN(v.quantity)
            ? v.quantity
            : undefined,
      } as any)
    );
    await dispatch(fetchEntries(undefined as any));
    toast.success(F.save);
    onOpenChange(false);
  }

  const footer = (
    <div className="flex justify-end">
      <button
        className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
        onClick={handleSubmit(onCreate)}
        disabled={isSubmitting}
      >
        {F.save}
      </button>
    </div>
  );

  const noteText = (watch("note") || "").trim();

  return (
    <SideSheet
      open={open}
      onOpenChange={onOpenChange}
      title={F.addEntryTitle}
      footer={footer}
    >
      <div className="space-y-3">
        {/* Habit */}
        <div>
          <label className="text-sm">{F.pickHabit}</label>
          <select
            {...register("habitId")}
            className="mt-1 w-full rounded border p-2 bg-[var(--bg-0)]"
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

        {/* Status + Quantity */}
        <div className="flex gap-2">
          <select
            {...register("status")}
            className="rounded border p-2 bg-[var(--bg-0)]"
          >
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
            className="flex-1 rounded border p-2 bg-[var(--bg-0)]"
          />
        </div>

        {/* === NEW: Note Modal trigger + preview === */}
        <div className="space-y-2">
          <label className="text-sm">{F.note}</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border px-3 py-2 bg-[var(--bg-1)]"
              onClick={() => setOpenNote(true)}
            >
              {F.note}
            </button>
            {/* one-line preview */}
            <div className="text-xs opacity-80 truncate flex-1">
              {noteText
                ? noteText.length > 60
                  ? noteText.slice(0, 57) + "…"
                  : noteText
                : lang === "ar"
                ? "اختياري — ملاحظة ✍️"
                : "Optional — Note ✍️"}
            </div>
          </div>

          {/* attachments tiny preview */}
          {(attachments.imageDataUrl || attachments.drawingDataUrl) && (
            <div className="flex gap-2">
              {attachments.imageDataUrl && (
                <img
                  src={attachments.imageDataUrl}
                  alt="img"
                  className="h-14 w-14 rounded-lg border object-cover"
                />
              )}
              {attachments.drawingDataUrl && (
                <img
                  src={attachments.drawingDataUrl}
                  alt="drawing"
                  className="h-14 w-14 rounded-lg border object-cover"
                />
              )}
            </div>
          )}
        </div>

        {/* Helpers (kept) */}
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

      {/* Note Modal */}
      {openNote && (
        <NoteModal
          lang={lang as any}
          defaultText={noteText}
          onCancel={() => setOpenNote(false)}
          onSave={(p: NotePayload) => {
            setValue("note", p.text || "");
            setAttachments({
              imageDataUrl: p.imageDataUrl || null,
              drawingDataUrl: p.drawingDataUrl || null,
            });
            setOpenNote(false);
          }}
        />
      )}
    </SideSheet>
  );
}
