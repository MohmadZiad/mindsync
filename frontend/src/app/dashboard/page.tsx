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
import { habitsService } from "@/services/habits"; // 1) الاستيراد

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const habits = useAppSelector((s) => s.habits.items);
  const entries = useAppSelector((s) => s.entries.items);
  const currentHabitId = useAppSelector((s) => s.entries.currentHabitId);

  const [newHabit, setNewHabit] = useState("");
  const [editHabit, setEditHabit] = useState<{ id: string; name: string } | null>(null);

  const [entryForm, setEntryForm] = useState<{
    habitId: string;
    mood: string;
    reflection: string;
  }>({
    habitId: "",
    mood: "happy",
    reflection: "",
  });

  // 2) نوع وحالة الستريك
  type Streak = { count: number; start?: string; current?: boolean };
  const [streaks, setStreaks] = useState<Record<string, Streak>>({});

  useEffect(() => {
    (async () => {
      await dispatch(meThunk());
      await dispatch(fetchHabits());
      await dispatch(fetchEntries(undefined));
    })();
  }, [dispatch]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto mt-16 space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-600">لازم تسجّل دخول قبل ما تشوف الداشبورد.</p>
        <a className="underline" href="/login">
          الذهاب لتسجيل الدخول
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">أهلاً {user.email}</h1>
        <button className="px-3 py-1 border rounded" onClick={() => dispatch(logoutThunk())}>
          Logout
        </button>
      </header>

      {/* HABITS */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Habits</h2>

        {/* create habit */}
        <div className="flex gap-2">
          <input
            className="border p-2 rounded flex-1"
            placeholder="اسم العادة"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
          />
          <button
            className="px-3 py-2 border rounded"
            onClick={async () => {
              if (!newHabit.trim()) return;
              await dispatch(addHabit({ name: newHabit.trim() }));
              setNewHabit("");
            }}
          >
            Add
          </button>
        </div>

        {/* list habits */}
        <ul className="space-y-2">
          {habits.map((h) => (
            <li key={h.id} className="flex items-center justify-between border p-2 rounded">
              {editHabit?.id === h.id ? (
                <div className="flex gap-2 w-full">
                  <input
                    className="border p-2 rounded flex-1"
                    value={editHabit.name}
                    onChange={(e) => setEditHabit({ ...editHabit, name: e.target.value })}
                  />
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={async () => {
                      if (!editHabit?.name.trim()) return;
                      await dispatch(updateHabit({ id: h.id, name: editHabit.name.trim() }));
                      setEditHabit(null);
                    }}
                  >
                    Save
                  </button>
                  <button className="px-3 py-1 border rounded" onClick={() => setEditHabit(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className={`text-left ${currentHabitId === h.id ? "font-semibold underline" : ""}`}
                    onClick={async () => {
                      // تفعيل الفلتر على هذه العادة
                      dispatch(setCurrentHabit(h.id));
                      await dispatch(fetchEntries({ habitId: h.id }));
                      setEntryForm((f) => ({ ...f, habitId: h.id }));

                      // (اختياري مفيد) جيب الستريك أول مرة يظهر فيها
                      if (!streaks[h.id]) {
                        try {
                          const s = await habitsService.getStreak(h.id);
                          setStreaks((prev) => ({ ...prev, [h.id]: s }));
                        } catch {
                          /* نتجاهل لو فشل */
                        }
                      }
                    }}
                  >
                    {h.name}
                    {/* عرض الستريك 🔥 جنب اسم العادة */}
                    <span className="text-xs text-gray-500 ml-2">
                      🔥 {streaks[h.id]?.count ?? 0}
                      {streaks[h.id] && streaks[h.id].current === false ? " (paused)" : ""}
                    </span>
                  </button>

                  <div className="flex gap-3">
                    <button className="text-sm" onClick={() => setEditHabit({ id: h.id, name: h.name })}>
                      Edit
                    </button>
                    <button className="text-sm text-red-600" onClick={() => dispatch(deleteHabit(h.id))}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ENTRIES */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Entries</h2>

        {/* new entry */}
        <div className="grid md:grid-cols-4 gap-2">
          <select
            className="border p-2 rounded"
            value={entryForm.habitId}
            onChange={(e) => setEntryForm({ ...entryForm, habitId: e.target.value })}
          >
            <option value="">اختر عادة</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={entryForm.mood}
            onChange={(e) => setEntryForm({ ...entryForm, mood: e.target.value })}
          >
            <option value="happy">happy</option>
            <option value="neutral">neutral</option>
            <option value="sad">sad</option>
          </select>

          <input
            className="border p-2 rounded"
            placeholder="reflection (اختياري)"
            value={entryForm.reflection}
            onChange={(e) => setEntryForm({ ...entryForm, reflection: e.target.value })}
          />

          {/* 3) onClick المعدّلة */}
          <button
            className="px-3 py-2 border rounded"
            onClick={async () => {
              if (!entryForm.habitId) return; // لازم يختار عادة

              // 1) أنشئ الإدخال
              await dispatch(
                addEntry({
                  habitId: entryForm.habitId,
                  mood: entryForm.mood,
                  reflection: entryForm.reflection || undefined,
                })
              );

              // 2) حدّث قائمة الإدخالات حسب الفلتر الحالي
              if (currentHabitId) {
                await dispatch(fetchEntries({ habitId: currentHabitId }));
              } else {
                await dispatch(fetchEntries(undefined));
              }

              try {
                const s = await habitsService.getStreak(entryForm.habitId);
                setStreaks((prev) => ({ ...prev, [entryForm.habitId]: s }));
              } catch {
                /* لو فشل الطلب، منطنّش التحديث المحلي */
              }

              // 4) نظّف خانة الـreflection فقط
              setEntryForm((f) => ({ ...f, reflection: "" }));
            }}
          >
            Add Entry
          </button>
        </div>

        {/* entries list */}
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="border p-2 rounded">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm">
                    <span className="font-medium">{e.mood}</span>
                    <span className="text-gray-500"> — {new Date(e.createdAt).toLocaleString()}</span>
                  </div>
                  {e.reflection && <div className="text-xs text-gray-700">{e.reflection}</div>}
                </div>

                <div className="flex gap-3">
                  <button
                    className="text-sm"
                    onClick={async () => {
                      const newText = prompt("Edit reflection:", e.reflection || "") ?? undefined;
                      if (newText === undefined) return;
                      await dispatch(updateEntry({ id: e.id, data: { reflection: newText } }));
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="text-sm text-red-600"
                    onClick={async () => {
                      await dispatch(deleteEntry(e.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* clear filter */}
        {currentHabitId && (
          <button
            className="px-3 py-1 border rounded"
            onClick={async () => {
              dispatch(setCurrentHabit(undefined));
              await dispatch(fetchEntries(undefined));
            }}
          >
            إزالة الفلتر
          </button>
        )}
      </section>
    </div>
  );
}
