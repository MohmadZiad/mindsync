// src/components/flows/QuickLogPopover.tsx
"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/ui/i18n";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addEntry, fetchEntries } from "@/redux/slices/entrySlice";
import toast from "react-hot-toast";

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
  const [note, setNote] = useState("");
  const [qty, setQty] = useState<number | "">("");

  useEffect(() => {
    if (!open) {
      setHabitId("");
      setState("done");
      setNote("");
      setQty("");
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center">
      <div
        className="absolute inset-0 bg-black/30 z-[80]"
        onMouseDown={() => onOpenChange(false)}
      />
      <div
        className="relative z-[95] w-[min(92vw,600px)] rounded-2xl bg-white dark:bg-gray-950 border shadow-xl p-4"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold mb-3">{F.fabQuickLog}</div>

        <div className="grid gap-3">
          <label className="text-sm">
            {F.pickHabit}
            <select
              className="mt-1 w-full border rounded px-2 py-2"
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
                className={`px-3 py-2 border rounded ${
                  state === k ? "bg-gray-200 dark:bg-gray-800" : ""
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
            <label className="text-sm">
              {F.note}
              <input
                className="mt-1 w-full border rounded px-2 py-2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={lang === "ar" ? "سطر واحد" : "One line"}
              />
            </label>

            <label className="text-sm">
              {F.quantity}
              <input
                className="mt-1 w-full border rounded px-2 py-2"
                type="number"
                min={0}
                value={qty}
                onChange={(e) =>
                  setQty(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </label>
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            className="px-3 py-2 border rounded"
            onClick={() => onOpenChange(false)}
          >
            {F.cancel}
          </button>
          <button
            className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
            disabled={!habitId}
            onClick={save}
          >
            {F.saveLog}
          </button>
        </div>
      </div>
    </div>
  );
}
