"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { meThunk, logoutThunk } from "@/redux/slices/authSlice";
import {
  fetchHabits,
  addHabit,
  deleteHabit,
  updateHabit,
} from "@/redux/slices/habitSlice";
import {
  fetchEntries,
  addEntry,
  deleteEntry,
  updateEntry,
  setCurrentHabit,
} from "@/redux/slices/entrySlice";
import { habitsService } from "@/services/habits";
import type { Streak } from "@/services/streaks";

import StepTabs, { type Step } from "@/components/StepTabs";
import StreakMeCard from "@/components/StreakMeCard";
import AiReflectionControls from "@/components/AiReflectionControls";
import WeeklyGrouped from "@/components/WeeklyGrouped";
import MonthlySummary from "@/components/MonthlySummary";
import HabitFormExtra from "@/components/HabitFormExtra";
import { Card } from "@/components/card";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  // ===== Hooks (ثابتة دائمًا في الأعلى) =====
  const { user } = useAppSelector((s) => s.auth);
  const habits = useAppSelector((s) => s.habits.items);
  const entries = useAppSelector((s) => s.entries.items);
  const currentHabitId = useAppSelector((s) => s.entries.currentHabitId);

  const [newHabit, setNewHabit] = useState("");
  const [newHabitExtra, setNewHabitExtra] = useState<{
    frequency?: "daily" | "weekly";
    description?: string;
    icon?: string | null;
  }>({ frequency: "daily", description: "", icon: null });

  const [editHabit, setEditHabit] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [entryForm, setEntryForm] = useState<{
    habitId: string;
    mood: string;
    reflection: string;
  }>({
    habitId: "",
    mood: "🙂",
    reflection: "",
  });

  const [streaks, setStreaks] = useState<Record<string, Streak>>({});

  useEffect(() => {
    (async () => {
      await dispatch(meThunk());
      await dispatch(fetchHabits());
      await dispatch(fetchEntries(undefined));
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!habits.length) return;
    (async () => {
      const results = await Promise.allSettled(
        habits.map((h) => habitsService.getStreak(h.id))
      );
      const map: Record<string, Streak> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) map[habits[i].id] = r.value;
      });
      setStreaks((prev) => ({ ...prev, ...map }));
    })();
  }, [habits]);

  const hasHabits = habits.length > 0;

  if (!user) {
    return (
      <div className="max-w-xl mx-auto mt-16 space-y-4" dir="rtl">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-600">
          لازم تسجّل دخول قبل ما تشوف الداشبورد.
        </p>
        <a className="underline" href="/login">
          الذهاب لتسجيل الدخول
        </a>
      </div>
    );
  }

  // ===== تعريف الخطوات (بدون Hooks جديدة) =====
  const steps: Step[] = [
    {
      id: "intro",
      title: "تعريف وملخص",
      content: <IntroStep />,
      ready: true,
    },
    {
      id: "habits",
      title: "العادات",
      content: (
        <HabitsStep
          habits={habits}
          currentHabitId={currentHabitId}
          newHabit={newHabit}
          newHabitExtra={newHabitExtra}
          editHabit={editHabit}
          streaks={streaks}
          setNewHabit={setNewHabit}
          setNewHabitExtra={setNewHabitExtra}
          setEditHabit={setEditHabit}
          onAddHabit={async () => {
            if (!newHabit.trim()) return;
            await dispatch(
              addHabit({ name: newHabit.trim(), ...newHabitExtra } as any)
            );
            setNewHabit("");
            setNewHabitExtra({
              frequency: "daily",
              description: "",
              icon: null,
            });
          }}
          onSelectHabit={async (hId) => {
            dispatch(setCurrentHabit(hId as any));
            await dispatch(fetchEntries({ habitId: hId } as any));
            setEntryForm((f) => ({ ...f, habitId: hId }));
            if (!streaks[hId]) {
              try {
                const s = await habitsService.getStreak(hId);
                setStreaks((p) => ({ ...p, [hId]: s }));
              } catch {}
            }
          }}
          onCheckin={async (hId) => {
            try {
              const res = await habitsService.checkin(hId);
              const fresh = await habitsService.getStreak(hId);
              setStreaks((prev) => ({ ...prev, [hId]: fresh }));
              if (currentHabitId)
                await dispatch(
                  fetchEntries({ habitId: currentHabitId } as any)
                );
              else await dispatch(fetchEntries(undefined as any));
              toast.success(
                `تم تسجيل اليوم ✅ — الستريك الحالي: ${res.current} 🔥`
              );
            } catch (e: any) {
              toast.error(e?.data?.error || e?.message || "فشل التشيك-إن");
            }
          }}
          onEditSave={async (id, name) => {
            if (!name.trim()) return;
            await dispatch(updateHabit({ id, name: name.trim() } as any));
            setEditHabit(null);
          }}
          onDelete={async (id) => {
            await dispatch(deleteHabit(id as any));
            if (currentHabitId === id) {
              dispatch(setCurrentHabit(undefined as any));
              await dispatch(fetchEntries(undefined as any));
            }
          }}
        />
      ),
      ready: true,
    },
    {
      id: "entries",
      title: "الإدخالات",
      content: (
        <EntriesStep
          habits={habits}
          entries={entries}
          currentHabitId={currentHabitId}
          entryForm={entryForm}
          setEntryForm={setEntryForm}
          onAddEntry={async () => {
            if (!entryForm.habitId) return;
            await dispatch(
              addEntry({
                habitId: entryForm.habitId,
                mood: entryForm.mood,
                reflection: entryForm.reflection || undefined,
              } as any)
            );
            if (currentHabitId)
              await dispatch(fetchEntries({ habitId: currentHabitId } as any));
            else await dispatch(fetchEntries(undefined as any));
            try {
              const s = await habitsService.getStreak(entryForm.habitId);
              setStreaks((prev) => ({ ...prev, [entryForm.habitId]: s }));
            } catch {}
            setEntryForm((f) => ({ ...f, reflection: "" }));
          }}
          onEditEntry={async (e) => {
            const newText =
              prompt("Edit reflection:", e.reflection || "") ?? undefined;
            if (newText === undefined) return;
            await dispatch(
              updateEntry({ id: e.id, data: { reflection: newText } } as any)
            );
            if (currentHabitId)
              await dispatch(fetchEntries({ habitId: currentHabitId } as any));
            else await dispatch(fetchEntries(undefined as any));
          }}
          onDeleteEntry={async (id) => {
            await dispatch(deleteEntry(id as any));
            if (currentHabitId)
              await dispatch(fetchEntries({ habitId: currentHabitId } as any));
            else await dispatch(fetchEntries(undefined as any));
          }}
          onClearFilter={async () => {
            dispatch(setCurrentHabit(undefined as any));
            await dispatch(fetchEntries(undefined as any));
          }}
        />
      ),
      ready: hasHabits, // يمنع “التالي” إذا ما في ولا عادة
    },
    {
      id: "reports",
      title: "التقارير",
      content: <ReportsStep />,
      ready: true,
    },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-gray-50">
      <header className="mx-auto max-w-5xl px-3 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">أهلاً {user.email}</h1>
        <button
          className="px-3 py-1 border rounded"
          onClick={() => dispatch(logoutThunk())}
        >
          Logout
        </button>
      </header>

      <div className="mx-auto max-w-5xl px-3 pb-8">
        <StepTabs steps={steps} />
      </div>
    </main>
  );
}

/* ====== مكوّنات الخطوات (عرضية فقط) ====== */
function IntroStep() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card title="من نحن؟ وهدف الموقع">
        <p className="text-sm text-gray-700 leading-6">
          MindSync بيساعدك ترتّب عاداتك وتوثّق إدخالاتك اليومية، وتاخذ ملخصات
          ذكية أسبوعيًا وشهريًا. ابدأ بإضافة عادة، ثم سجّل إدخالاتك.
        </p>
      </Card>
      <StreakMeCard />
      <div className="md:col-span-2">
        <AiReflectionControls />
      </div>
    </div>
  );
}

function HabitsStep(props: {
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
    habits,
    currentHabitId,
    newHabit,
    newHabitExtra,
    editHabit,
    streaks,
    setNewHabit,
    setNewHabitExtra,
    setEditHabit,
    onAddHabit,
    onSelectHabit,
    onCheckin,
    onEditSave,
    onDelete,
  } = props;

  return (
    <div className="space-y-4">
      <div className="space-y-2 border p-3 rounded-2xl">
        <div className="flex gap-2">
          <input
            className="border p-2 rounded flex-1"
            placeholder="اسم العادة"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
          />
          <button className="px-3 py-2 border rounded" onClick={onAddHabit}>
            Add
          </button>
        </div>
        <HabitFormExtra value={newHabitExtra} onChange={setNewHabitExtra} />
      </div>

      <ul className="space-y-2">
        {habits.map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between border p-2 rounded"
          >
            {editHabit && editHabit.id === h.id ? (
              <div className="flex gap-2 w-full">
                <input
                  className="border p-2 rounded flex-1"
                  value={editHabit.name} 
                  onChange={(e) =>
                    setEditHabit({ id: h.id, name: e.target.value })
                  }
                />
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => onEditSave(h.id, editHabit.name)}
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setEditHabit(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  className={`text-left ${
                    currentHabitId === h.id ? "font-semibold underline" : ""
                  }`}
                  onClick={() => onSelectHabit(h.id)}
                >
                  <span className="mr-2">{h.icon ?? ""}</span> {h.name}
                  <span className="text-xs text-gray-500 ml-2">
                    🔥 {streaks[h.id]?.current ?? 0}
                  </span>
                </button>
                <div className="flex gap-3">
                  <button className="text-sm" onClick={() => onCheckin(h.id)}>
                    تمّ اليوم
                  </button>
                  <button
                    className="text-sm"
                    onClick={() => setEditHabit({ id: h.id, name: h.name })}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm text-red-600"
                    onClick={() => onDelete(h.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EntriesStep(props: {
  habits: any[];
  entries: any[];
  currentHabitId?: string | null;
  entryForm: { habitId: string; mood: string; reflection: string };
  setEntryForm: (v: any) => void;
  onAddEntry: () => Promise<void>;
  onEditEntry: (e: any) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onClearFilter: () => Promise<void>;
}) {
  const {
    habits,
    entries,
    currentHabitId,
    entryForm,
    setEntryForm,
    onAddEntry,
    onEditEntry,
    onDeleteEntry,
    onClearFilter,
  } = props;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-2">
        <select
          className="border p-2 rounded"
          value={entryForm.habitId}
          onChange={(e) =>
            setEntryForm({ ...entryForm, habitId: e.target.value })
          }
        >
          <option value="">اختر عادة</option>
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.icon ? `${h.icon} ${h.name}` : h.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={entryForm.mood}
          onChange={(e) => setEntryForm({ ...entryForm, mood: e.target.value })}
          title="المزاج"
        >
          <option value="🙂">🙂</option>
          <option value="😐">😐</option>
          <option value="😢">😢</option>
          <option value="😡">😡</option>
          <option value="😴">😴</option>
          <option value="🎉">🎉</option>
        </select>

        <input
          className="border p-2 rounded"
          placeholder="reflection (اختياري)"
          value={entryForm.reflection}
          onChange={(e) =>
            setEntryForm({ ...entryForm, reflection: e.target.value })
          }
        />

        <button className="px-3 py-2 border rounded" onClick={onAddEntry}>
          Add Entry
        </button>
      </div>

      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="border p-2 rounded">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm">
                  <span className="font-medium">{e.mood}</span>
                  <span className="text-gray-500">
                    {" "}
                    — {new Date(e.createdAt).toLocaleString()}
                  </span>
                </div>
                {e.reflection && (
                  <div className="text-xs text-gray-700">{e.reflection}</div>
                )}
              </div>
              <div className="flex gap-3">
                <button className="text-sm" onClick={() => onEditEntry(e)}>
                  Edit
                </button>
                <button
                  className="text-sm text-red-600"
                  onClick={() => onDeleteEntry(e.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {currentHabitId && (
        <button className="px-3 py-1 border rounded" onClick={onClearFilter}>
          إزالة الفلتر
        </button>
      )}
    </div>
  );
}

function ReportsStep() {
  return (
    <div className="grid gap-4">
      <WeeklyGrouped />
      <MonthlySummary />
    </div>
  );
}
