"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/ui/i18n";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addEntry, fetchEntries } from "@/redux/slices/entrySlice";
import toast from "react-hot-toast";
import NoteModal, { type NotePayload } from "@/components/NoteModal";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickLogPopover({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t, lang } = useI18n();
  const F = t.flows;
  const dispatch = useAppDispatch();

  const habits = useAppSelector((s) => s.habits.items);
  const [habitId, setHabitId] = useState("");
  const [state, setState] = useState<"done" | "partial" | "skipped">("done");

  const [openNote, setOpenNote] = useState(false);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState<number | "">("");

  const [attachments, setAttachments] = useState<{
    imageDataUrl?: string | null;
    drawingDataUrl?: string | null;
  }>({});

  useEffect(() => {
    if (!open) {
      setHabitId("");
      setState("done");
      setNote("");
      setQty("");
      setOpenNote(false);
      setAttachments({});
    }
  }, [open]);

  const save = async () => {
    if (!habitId) return;
    await dispatch(
      addEntry({
        habitId,
        mood: state === "done" ? "🎉" : state === "partial" ? "🙂" : "😐",
        reflection: note || undefined,
        quantity: qty === "" ? undefined : Number(qty),
      } as any)
    );
    await dispatch(fetchEntries(undefined as any));
    toast.success(F.logged);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-center">
          <motion.div
            className="absolute inset-0 bg-black/30 z-[80]"
            onMouseDown={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-[95] w-[min(92vw,600px)] rounded-2xl bg-[var(--bg-0)] border border-[var(--line)] shadow-xl p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
          >
            <div className="text-lg font-semibold mb-3">{F.fabQuickLog}</div>

            <div className="grid gap-3">
              <label className="text-sm">
                {F.pickHabit}
                <select
                  className="input mt-1"
                  value={habitId}
                  onChange={(e) => setHabitId(e.target.value)}
                >
                  <option value="">{F.pickHabit}</option>
                  {habits.map((h: any) => (
                    <option key={h.id} value={h.id}>
                      {h.icon ? `${h.icon} ${h.name}` : h.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                {(["done", "partial", "skipped"] as const).map((k) => (
                  <button
                    key={k}
                    className={`chip ${
                      state === k ? "ring-2 ring-indigo-400" : ""
                    }`}
                    onClick={() => setState(k)}
                  >
                    {k === "done"
                      ? F.done
                      : k === "partial"
                      ? F.partial
                      : F.skipped}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-tertiary"
                    onClick={() => setOpenNote(true)}
                  >
                    {F.note}
                  </button>
                  <div className="text-xs opacity-80 truncate flex-1">
                    {note
                      ? note.length > 60
                        ? note.slice(0, 57) + "…"
                        : note
                      : lang === "ar"
                      ? "سطر واحد — ملاحظة ✍️"
                      : "One line — Note ✍️"}
                  </div>
                </div>

                <label className="text-sm">
                  {F.quantity}
                  <input
                    className="input mt-1"
                    type="number"
                    min={0}
                    value={qty}
                    onChange={(e) =>
                      setQty(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </label>
              </div>

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

            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="btn-secondary"
                onClick={() => onOpenChange(false)}
              >
                {F.cancel}
              </button>
              <button
                className="btn-primary disabled:opacity-50"
                disabled={!habitId}
                onClick={save}
              >
                {F.saveLog}
              </button>
            </div>
          </motion.div>

          {openNote && (
            <NoteModal
              lang={lang as any}
              defaultText={note}
              onCancel={() => setOpenNote(false)}
              onSave={(p: NotePayload) => {
                setNote(p.text || "");
                setAttachments({
                  imageDataUrl: p.imageDataUrl || null,
                  drawingDataUrl: p.drawingDataUrl || null,
                });
                setOpenNote(false);
              }}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
