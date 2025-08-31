// src/components/flows/QuickAddHabitPopover.tsx
"use client";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { addHabit, fetchHabits } from "@/redux/slices/habitSlice";
import { useI18n } from "@/components/ui/i18n";
import toast from "react-hot-toast";

export default function QuickAddHabitPopover({
  open,
  onOpenChange,
  onAdvanced,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdvanced?: () => void;
}) {
  const { t } = useI18n();
  const F = t.flows;
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [freq, setFreq] = useState<"daily" | "weekly">("daily");
  const [emoji, setEmoji] = useState<string>("✅");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      await dispatch(
        addHabit({
          name: name.trim(),
          description: desc || undefined,
          icon: emoji,
          frequency: freq,
        } as any)
      );
      await dispatch(fetchHabits());
      toast.success(F.created, { icon: "🎉" });
      if (onAdvanced) {
        toast((tt) => (
          <div className="flex items-center gap-3">
            <span>{F.created}</span>
            <button
              className="px-2 py-1 rounded bg-indigo-600 text-white text-xs"
              onClick={() => {
                toast.dismiss(tt.id);
                onAdvanced();
              }}
            >
              {F.advanced}
            </button>
          </div>
        ));
      }
      setName("");
      setDesc("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center" // <- أعلى من أي شيء
      aria-hidden={!open}
    >
      {/* استخدم onMouseDown حتى ما يتصادم مع أحداث داخل الديالوج */}
      <div
        className="absolute inset-0 bg-black/30 z-[80]"
        onMouseDown={() => onOpenChange(false)}
      />
      <div
        className="relative z-[95] w-[min(92vw,560px)] rounded-2xl bg-white dark:bg-gray-950 border shadow-xl p-4"
        role="dialog"
        aria-modal="true"
        // امنع انتشار جميع النقرات للمحتوى الداخلي
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold mb-3">{F.quickAddHabit}</div>

        <div className="grid gap-3">
          <label className="text-sm">
            {F.habitName}
            <input
              className="mt-1 w-full border rounded px-2 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <label className="text-sm">
            {F.description}
            <input
              className="mt-1 w-full border rounded px-2 py-2"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </label>

          <div className="flex gap-2 items-center">
            <label className="text-sm">
              {F.emoji}
              <input
                className="mt-1 w-24 border rounded px-2 py-2 text-center"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
              />
            </label>
            <label className="text-sm">
              {F.frequency}
              <select
                className="mt-1 border rounded px-2 py-2"
                value={freq}
                onChange={(e) => setFreq(e.target.value as any)}
              >
                <option value="daily">{F.daily}</option>
                <option value="weekly">{F.weekly}</option>
              </select>
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
            disabled={!name.trim() || loading}
            onClick={submit}
          >
            {loading ? "…" : F.create}
          </button>
        </div>
      </div>
    </div>
  );
}
