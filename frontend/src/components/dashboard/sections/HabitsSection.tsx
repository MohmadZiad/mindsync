"use client";
import dynamic from "next/dynamic";
import type { Streak } from "@/services/streaks";
import type { Lang } from "@/components/DashboardMain";

const HabitFormExtra = dynamic(() => import("@/components/HabitFormExtra"));

export default function HabitsSection(props: {
  lang?: Lang;
  i18n: {
    habitNamePh: string; add: string; save: string; cancel: string;
    todayDone: string; edit: string; del: string;
    checkinToast: (n: number) => string; checkinErr: string;
  };
  habits: any[];
  currentHabitId?: string | null;
  newHabit: string;
  newHabitExtra: any;
  editHabit: { id: string; name: string } | null;
  streaks: Record<string, Streak>;
  setNewHabit: (v: string) => void;
  setNewHabitExtra: (v: any) => void;
  setEditHabit: (v: any) => void;
  onAddHabit: () => Promise<void>;
  onSelectHabit: (id: string) => Promise<void>;
  onCheckin: (id: string) => Promise<void>;
  onEditSave: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const {
    lang, i18n, habits, currentHabitId, newHabit, newHabitExtra, editHabit, streaks,
    setNewHabit, setNewHabitExtra, setEditHabit, onAddHabit, onSelectHabit, onCheckin, onEditSave, onDelete,
  } = props;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] shadow-sm overflow-hidden">
        <div className="w-full flex items-center gap-2 px-4 py-3 border-b border-[var(--line)]">
          <span className="text-xl">➕</span>
          <span className="font-semibold flex-1 text-left">{lang === "ar" ? "أضف عادة" : "Add Habit"}</span>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder={i18n.habitNamePh}
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
            />
            <button className="btn-primary" onClick={onAddHabit}>{i18n.add}</button>
          </div>
          <HabitFormExtra value={newHabitExtra} onChange={setNewHabitExtra} lang={lang} />
        </div>
      </div>

      <ul className="grid sm:grid-cols-2 gap-3">
        {habits.map((h) => {
          const curr = streaks[h.id]?.current ?? 0;
          return (
            <li key={h.id} className="border border-[var(--line)] rounded-2xl p-3 bg-[var(--bg-1)] shadow-sm card-hover">
              {editHabit && editHabit.id === h.id ? (
                <div className="flex gap-2 w-full">
                  <input className="input flex-1" value={editHabit.name}
                    onChange={(e) => setEditHabit({ id: h.id, name: e.target.value })} />
                  <button className="btn-primary" onClick={() => onEditSave(h.id, editHabit.name)}>{i18n.save}</button>
                  <button className="btn-secondary" onClick={() => setEditHabit(null)}>{i18n.cancel}</button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <button
                    className={`text-left flex-1 ${currentHabitId === h.id ? "font-semibold underline" : ""}`}
                    onClick={() => onSelectHabit(h.id)}
                    title={h.name}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{h.icon ?? "📌"}</span>
                      <div className="flex items-center gap-2">
                        <span>{h.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                          🔥 {curr}
                        </span>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="text-sm px-2 py-1 rounded bg-green-600 text-white" onClick={() => onCheckin(h.id)} title={i18n.todayDone}>
                      {i18n.todayDone}
                    </button>
                    <button className="text-sm px-2 py-1 border rounded" onClick={() => setEditHabit({ id: h.id, name: h.name })}>
                      {i18n.edit}
                    </button>
                    <button className="text-sm px-2 py-1 rounded bg-red-600 text-white" onClick={() => onDelete(h.id)}>
                      {i18n.del}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
