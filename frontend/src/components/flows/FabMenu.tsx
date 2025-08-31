"use client";
import React from "react";
import { useI18n } from "@/components/ui/i18n";

export default function FabMenu({
  onQuickHabit,
  onProHabit,
  onQuickLog,
  onProEntry,
}: {
  onQuickHabit: () => void;
  onProHabit: () => void;
  onQuickLog: () => void;
  onProEntry: () => void;
}) {
  const { t } = useI18n();
  const F = t.flows;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="fixed bottom-20 right-5 z-[70]">
        {open && (
          <div className="mb-2 grid gap-2 text-sm">
            <button
              onClick={onQuickHabit}
              className="rounded-xl bg-white px-4 py-2 shadow"
            >{`＋ ${F.fabAddHabit}`}</button>
            <button
              onClick={onProHabit}
              className="rounded-xl bg-white px-4 py-2 shadow"
            >
              ⚙️ {F.fabAddHabitPro}
            </button>
            <button
              onClick={onQuickLog}
              className="rounded-xl bg-white px-4 py-2 shadow"
            >
              📝 {F.fabQuickLog}
            </button>
            <button
              onClick={onProEntry}
              className="rounded-xl bg-white px-4 py-2 shadow"
            >
              🧾 {F.fabFullEntry}
            </button>
          </div>
        )}
        <button
          className="rounded-full bg-indigo-600 px-5 py-3 text-white shadow-xl"
          onClick={() => setOpen((v) => !v)}
          aria-label="Actions"
          title="Actions"
        >
          ＋
        </button>
      </div>
    </>
  );
}
