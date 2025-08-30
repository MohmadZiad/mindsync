"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

/* ===================== i18n ===================== */
type Lang = "en" | "ar";
const T = {
  en: {
    dash: "Dashboard",
    mustLogin: "You need to sign in to view the dashboard.",
    goLogin: "Go to login",
    hello: (email: string) => `Welcome, ${email}`,
    logout: "Logout",

    steps: {
      intro: "Overview",
      habits: "Habits",
      entries: "Entries",
      reports: "Reports",
    },

    introCopy:
      "MindSync helps you structure your habits and log daily entries, with weekly and monthly insights. Start by adding a habit, then add entries.",

    // Habits
    habitNamePh: "Habit name",
    add: "Add",
    save: "Save",
    cancel: "Cancel",
    todayDone: "Mark today",
    edit: "Edit",
    del: "Delete",
    streak: "streak",
    checkinToast: (curr: number) =>
      `Checked in ✅ — current streak: ${curr} 🔥`,
    checkinErr: "Check-in failed",

    // Entries
    chooseHabit: "Choose habit",
    mood: "Mood",
    reflectionPh: "Reflection (optional)",
    addEntry: "Add Entry",
    editEntry: "Edit",
    deleteEntry: "Delete",
    clearFilter: "Clear filter",
  },
  ar: {
    dash: "لوحة التحكم",
    mustLogin: "لازم تسجّل دخول قبل ما تشوف الداشبورد.",
    goLogin: "الذهاب لتسجيل الدخول",
    hello: (email: string) => `أهلاً ${email}`,
    logout: "تسجيل الخروج",

    steps: {
      intro: "تعريف وملخص",
      habits: "العادات",
      entries: "الإدخالات",
      reports: "التقارير",
    },

    introCopy:
      "MindSync بيساعدك ترتّب عاداتك وتوثّق إدخالاتك اليومية، وتاخذ ملخصات ذكية أسبوعيًا وشهريًا. ابدأ بإضافة عادة، ثم سجّل إدخالاتك.",

    // Habits
    habitNamePh: "اسم العادة",
    add: "إضافة",
    save: "حفظ",
    cancel: "إلغاء",
    todayDone: "تمّ اليوم",
    edit: "تعديل",
    del: "حذف",
    streak: "سلسلة",
    checkinToast: (curr: number) =>
      `تم تسجيل اليوم ✅ — الستريك الحالي: ${curr} 🔥`,
    checkinErr: "فشل التشيك-إن",

    // Entries
    chooseHabit: "اختر عادة",
    mood: "المزاج",
    reflectionPh: "تدوينة (اختياري)",
    addEntry: "إضافة إدخال",
    editEntry: "تعديل",
    deleteEntry: "حذف",
    clearFilter: "إزالة الفلتر",
  },
} as const;

/* ===================== Page ===================== */
export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, loading: authLoading } = useAppSelector((s) => s.auth);
  const habits = useAppSelector((s) => s.habits.items);
  const entries = useAppSelector((s) => s.entries.items);
  const currentHabitId = useAppSelector((s) => s.entries.currentHabitId);

  // language
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const l =
      (typeof window !== "undefined"
        ? (localStorage.getItem("ms_lang") as Lang | null)
        : null) || "en";
    setLang(l);
  }, []);
  const t = useMemo(() => T[lang], [lang]);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  // local UI state
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

  /* ---- auth gate & initial fetch ---- */
  // حاول نجيب حالة المستخدم من السيرفر (كوكي/توكن)
  useEffect(() => {
    dispatch(meThunk());
  }, [dispatch]);

  // منع الوصول: إذا خلصنا تحميل auth ومفيش user -> login مع next
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/dashboard");
    }
  }, [authLoading, user, router]);

  // حمّل الداتا بعد التأكد من وجود user
  useEffect(() => {
    if (!user) return;
    (async () => {
      await dispatch(fetchHabits());
      await dispatch(fetchEntries(undefined));
    })();
  }, [user, dispatch]);

  // احسب الستريكس لكل عادة عندما تتغيّر القائمة
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

  // شاشة انتظار بسيطة أثناء التحقق/التحويل
  if (authLoading || (!user && typeof window !== "undefined")) {
    return (
      <main dir={dir} className="min-h-[60vh] grid place-items-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </main>
    );
  }

  // (حالة نادرة) لو ما في user ولسّه ما تحوّل
  if (!user) {
    return (
      <div dir={dir} className="max-w-xl mx-auto mt-16 space-y-4">
        <h1 className="text-2xl font-bold">{t.dash}</h1>
        <p className="text-sm text-gray-600">{t.mustLogin}</p>
        <a className="underline" href="/login?next=/dashboard">
          {t.goLogin}
        </a>
      </div>
    );
  }

  /* ---- steps ---- */
  const steps: Step[] = [
    {
      id: "intro",
      title: t.steps.intro,
      content: <IntroStep copy={t.introCopy} />,
      ready: true,
    },
    {
      id: "habits",
      title: t.steps.habits,
      content: (
        <HabitsStep
          i18n={{
            habitNamePh: t.habitNamePh,
            add: t.add,
            save: t.save,
            cancel: t.cancel,
            todayDone: t.todayDone,
            edit: t.edit,
            del: t.del,
            checkinToast: t.checkinToast,
            checkinErr: t.checkinErr,
          }}
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
              toast.success(t.checkinToast(res.current));
            } catch (e: any) {
              toast.error(e?.data?.error || e?.message || t.checkinErr);
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
      title: t.steps.entries,
      content: (
        <EntriesStep
          i18n={{
            chooseHabit: t.chooseHabit,
            mood: t.mood,
            reflectionPh: t.reflectionPh,
            addEntry: t.addEntry,
            editEntry: t.editEntry,
            deleteEntry: t.deleteEntry,
            clearFilter: t.clearFilter,
          }}
          locale={locale}
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
              prompt(t.editEntry + ":", e.reflection || "") ?? undefined;
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
      ready: hasHabits,
    },
    {
      id: "reports",
      title: t.steps.reports,
      content: <ReportsStep />,
      ready: true,
    },
  ];

  return (
    <main dir={dir} className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="mx-auto max-w-5xl px-3 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.hello(user.email)}</h1>
        <button
          className="px-3 py-1 border rounded"
          onClick={() => dispatch(logoutThunk())}
        >
          {t.logout}
        </button>
      </header>

      <div className="mx-auto max-w-5xl px-3 pb-8">
        <StepTabs steps={steps} />
      </div>
    </main>
  );
}

/* ===================== Steps ===================== */
function IntroStep({ copy }: { copy: string }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card title="MindSync">
        <p className="text-sm text-gray-700 leading-6">{copy}</p>
      </Card>
      <StreakMeCard />
      <div className="md:col-span-2">
        <AiReflectionControls />
      </div>
    </div>
  );
}

function HabitsStep(props: {
  i18n: {
    habitNamePh: string;
    add: string;
    save: string;
    cancel: string;
    todayDone: string;
    edit: string;
    del: string;
    checkinToast: (n: number) => string;
    checkinErr: string;
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
    i18n,
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
            placeholder={i18n.habitNamePh}
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
          />
          <button className="px-3 py-2 border rounded" onClick={onAddHabit}>
            {i18n.add}
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
                  {i18n.save}
                </button>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setEditHabit(null)}
                >
                  {i18n.cancel}
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
                    {i18n.todayDone}
                  </button>
                  <button
                    className="text-sm"
                    onClick={() => setEditHabit({ id: h.id, name: h.name })}
                  >
                    {i18n.edit}
                  </button>
                  <button
                    className="text-sm text-red-600"
                    onClick={() => onDelete(h.id)}
                  >
                    {i18n.del}
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
  i18n: {
    chooseHabit: string;
    mood: string;
    reflectionPh: string;
    addEntry: string;
    editEntry: string;
    deleteEntry: string;
    clearFilter: string;
  };
  locale: string;
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
    i18n,
    locale,
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
          <option value="">{i18n.chooseHabit}</option>
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.icon ? `${h.icon} ${h.name}` : h.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          aria-label={i18n.mood}
          value={entryForm.mood}
          onChange={(e) => setEntryForm({ ...entryForm, mood: e.target.value })}
          title={i18n.mood}
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
          placeholder={i18n.reflectionPh}
          value={entryForm.reflection}
          onChange={(e) =>
            setEntryForm({ ...entryForm, reflection: e.target.value })
          }
        />

        <button className="px-3 py-2 border rounded" onClick={onAddEntry}>
          {i18n.addEntry}
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
                    — {new Date(e.createdAt).toLocaleString(locale)}
                  </span>
                </div>
                {e.reflection && (
                  <div className="text-xs text-gray-700">{e.reflection}</div>
                )}
              </div>
              <div className="flex gap-3">
                <button className="text-sm" onClick={() => onEditEntry(e)}>
                  {i18n.editEntry}
                </button>
                <button
                  className="text-sm text-red-600"
                  onClick={() => onDeleteEntry(e.id)}
                >
                  {i18n.deleteEntry}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {currentHabitId && (
        <button className="px-3 py-1 border rounded" onClick={onClearFilter}>
          {i18n.clearFilter}
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
