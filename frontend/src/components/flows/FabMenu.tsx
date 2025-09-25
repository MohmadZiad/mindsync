"use client";
import React from "react";
import { useI18n } from "@/components/ui/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

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
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mb-2 grid gap-2 text-sm"
            >
              <button onClick={onQuickHabit} className="menu-card">
                ＋ {F.fabAddHabit}
              </button>
              <button onClick={onProHabit} className="menu-card">
                ⚙️ {F.fabAddHabitPro}
              </button>
              <button onClick={onQuickLog} className="menu-card">
                📝 {F.fabQuickLog}
              </button>
              <button onClick={onProEntry} className="menu-card">
                🧾 {F.fabFullEntry}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          className="rounded-full bg-indigo-600 p-4 text-white shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          onClick={() => setOpen((v) => !v)}
          aria-label="Actions"
          title="Actions"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
