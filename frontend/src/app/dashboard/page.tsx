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

/* === NEW: flows === */
import FabMenu from "@/components/flows/FabMenu";
import CommandPalette from "@/components/flows/CommandPalette";
import QuickAddHabitPopover from "@/components/flows/QuickAddHabitPopover";
import AddHabitSheet from "@/components/flows/AddHabitSheet";
import QuickLogPopover from "@/components/flows/QuickLogPopover";
import EntrySheet from "@/components/flows/EntrySheet";

/* ===================== i18n ===================== */
type Lang = "en" | "ar";
const T = {
  en: {
    dash: "Dashboard",
    mustLogin: "You need to sign in to view the dashboard.",
    goLogin: "Go to login",
    helloTime: (name: string, h: number) =>
      `${
        h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
      }, ${name || "friend"}`,
    logout: "Logout",
    theme: "Theme",
    lang: "Language",
    light: "Light",
    dark: "Dark",

    steps: {
      intro: "Overview",
      habits: "Habits",
      entries: "Entries",
      reports: "Reports",
    },
    introCopy:
      "MindSync helps you structure your habits and log daily entries, with weekly and monthly insights. Start by adding a habit, then add entries.",

    addHabit: "Add Habit",
    quickLog: "Quick Log",

    activeHabits: "Active habits",
    entriesThisWeek: "Entries this week",
    todayCompletion: "Today’s completion",

    qlogTitle: "Quick Log",
    qlogPickHabit: "Pick a habit",
    qlogNotePh: "Short note (optional)",
    qlogDone: "Done",
    qlogNotDone: "Not done",
    qlogSave: "Save",
    qlogSaved: "Logged successfully ✅",

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

    chooseHabit: "Choose habit",
    mood: "Mood",
    reflectionPh: "Reflection (optional)",
    addEntry: "Add Entry",
    editEntry: "Edit",
    deleteEntry: "Delete",
    clearFilter: "Clear filter",

    home: "Home",
    habitsTab: "Habits",
    ai: "Entries",
    reports: "Reports",
  },
  ar: {
    dash: "لوحة التحكم",
    mustLogin: "لازم تسجّل دخول قبل ما تشوف الداشبورد.",
    goLogin: "الذهاب لتسجيل الدخول",
    helloTime: (name: string, h: number) =>
      `${h < 12 ? "صباح الخير" : h < 18 ? "مساء الخير" : "مساء الخير"} يا ${
        name || "صديقي"
      }`,
    logout: "تسجيل الخروج",
    theme: "المظهر",
    lang: "اللغة",
    light: "فاتح",
    dark: "داكن",

    steps: {
      intro: "تعريف وملخص",
      habits: "العادات",
      entries: "الإدخالات",
      reports: "التقارير",
    },
    introCopy:
      "MindSync بيساعدك ترتّب عاداتك وتوثّق إدخالاتك اليومية، وتاخذ ملخصات ذكية أسبوعيًا وشهريًا. ابدأ بإضافة عادة، ثم سجّل إدخالاتك.",

    addHabit: "أضف عادة",
    quickLog: "تسجيل سريع",

    activeHabits: "عادات فعّالة",
    entriesThisWeek: "مدخلات هذا الأسبوع",
    todayCompletion: "إنجاز اليوم",

    qlogTitle: "تسجيل سريع",
    qlogPickHabit: "اختر عادة",
    qlogNotePh: "ملاحظة قصيرة (اختياري)",
    qlogDone: "تم",
    qlogNotDone: "لم يتم",
    qlogSave: "حفظ",
    qlogSaved: "تم الحفظ بنجاح ✅",

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

    chooseHabit: "اختر عادة",
    mood: "المزاج",
    reflectionPh: "تدوينة (اختياري)",
    addEntry: "إضافة إدخال",
    editEntry: "تعديل",
    deleteEntry: "حذف",
    clearFilter: "إزالة الفلتر",

    home: "الرئيسية",
    habitsTab: "العادات",
    ai: "ادخالات",
    reports: "تقارير",
  },
} as const;

/* ===================== Small UI helpers ===================== */
function ProgressRing({
  value = 0,
  size = 64,
  stroke = 8,
}: {
  value?: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        className="fill-none stroke-gray-200 dark:stroke-gray-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        className="fill-none stroke-current text-indigo-500"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function BottomNav({
  items,
  onSelect,
}: {
  items: { id: string; label: string; icon: string }[];
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-t">
      <ul className="max-w-3xl mx-auto grid grid-cols-4">
        {items.map((it) => (
          <li key={it.id}>
            <button
              onClick={() => onSelect(it.id)}
              className="w-full py-2.5 text-sm flex flex-col items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <span className="text-lg">{it.icon}</span>
              <span>{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

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

  // ✅ sync <html> lang/dir + localStorage + broadcast
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("ms_lang", lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "ar" ? "ar" : "en";
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
    try {
      window.dispatchEvent(new Event("storage"));
    } catch {}
  }, [lang]);

  const t = useMemo(() => T[lang], [lang]);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  // theme (light/dark)
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });
  useEffect(() => {
    const el = document.documentElement;
    dark ? el.classList.add("dark") : el.classList.remove("dark");
  }, [dark]);

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
  }>({ habitId: "", mood: "🙂", reflection: "" });

  const [streaks, setStreaks] = useState<Record<string, Streak>>({});

  // Quick Log UI (القديم)
  const [qlog, setQlog] = useState<{
    habitId: string;
    note: string;
    done: boolean;
  }>({
    habitId: "",
    note: "",
    done: true,
  });
  const [showQuickLog, setShowQuickLog] = useState(false);

  /* ---- NEW: flows visibility ---- */
  const [openQuickHabit, setOpenQuickHabit] = useState(false);
  const [openProHabit, setOpenProHabit] = useState(false);
  const [openQuickLogPop, setOpenQuickLogPop] = useState(false);
  const [openEntrySheet, setOpenEntrySheet] = useState(false);

  /* ---- auth gate & initial fetch ---- */
  useEffect(() => {
    dispatch(meThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/dashboard");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await dispatch(fetchHabits());
      await dispatch(fetchEntries(undefined));
    })();
  }, [user, dispatch]);

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

  // computed
  const hasHabits = habits.length > 0;
  const emailName = (user?.email?.split("@")[0] ?? "").replace(/\./g, " ");
  const hour = new Date().getHours();

  const entriesThisWeek = useMemo(() => {
    const from = new Date();
    const day = from.getDay();
    const start = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate() - day
    );
    return entries.filter((e) => new Date(e.createdAt) >= start).length;
  }, [entries]);

  const entriesToday = useMemo(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return entries.filter((e) => {
      const t0 = new Date(e.createdAt);
      return t0 >= start && t0 < end;
    }).length;
  }, [entries]);

  // helpers
  function goToHabitsTab() {
    const labels = [T.en.steps.habits, T.ar.steps.habits];
    const btn = Array.from(
      document.querySelectorAll("button,[role='tab']")
    ).find((b: any) => labels.includes((b.textContent || "").trim()));
    (btn as HTMLButtonElement | undefined)?.click();
  }

  async function handleQuickLogSave() {
    if (!qlog.habitId) return;
    await dispatch(
      addEntry({
        habitId: qlog.habitId,
        mood: qlog.done ? "🎉" : "😐",
        reflection: qlog.note || undefined,
      } as any)
    );
    if (currentHabitId)
      await dispatch(fetchEntries({ habitId: currentHabitId } as any));
    else await dispatch(fetchEntries(undefined as any));
    setQlog({ habitId: "", note: "", done: true });
    setShowQuickLog(false);
    toast.success(t.qlogSaved);
  }

  // loading / login states
  if (authLoading || (!user && typeof window !== "undefined")) {
    return (
      <main dir={dir} className="min-h-[60vh] grid place-items-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </main>
    );
  }
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
    <main
      dir={dir}
      className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 pb-28"
    >
      {/* Header */}
      <header className="mx-auto max-w-5xl px-3 py-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {t.dash}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            {t.helloTime(emailName, hour)}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* language */}
          <select
            className="px-3 py-1.5 rounded-xl border bg-white/70 dark:bg-gray-950/70"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            aria-label={t.lang}
            title={t.lang}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
          {/* theme */}
          <button
            onClick={() => setDark((v) => !v)}
            className="px-3 py-1.5 rounded-xl border bg-white/70 dark:bg-gray-950/70"
            title={t.theme}
            aria-label={t.theme}
          >
            {dark ? `🌙 ${t.dark}` : `☀️ ${t.light}`}
          </button>

          <button
            className="px-3 py-1.5 rounded-xl border bg-white/70 dark:bg-gray-950/70"
            onClick={() => goToHabitsTab()}
          >
            {t.addHabit}
          </button>
          <button
            className="px-3 py-1.5 rounded-xl border bg-white/70 dark:bg-gray-950/70"
            onClick={() => setShowQuickLog(true)}
          >
            {t.quickLog}
          </button>
          <button
            className="px-3 py-1.5 rounded-xl border bg-white/70 dark:bg-gray-950/70"
            onClick={() => dispatch(logoutThunk())}
          >
            {t.logout}
          </button>
        </div>
      </header>

      {/* Mini Stats */}
      <section className="mx-auto max-w-5xl px-3 pb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          title={t.activeHabits}
          value={habits.length}
          pct={Math.min(habits.length * 10, 100)}
          emoji="🧩"
        />
        <StatCard
          title={t.entriesThisWeek}
          value={entriesThisWeek}
          pct={Math.min(entriesThisWeek * 10, 100)}
          emoji="📆"
        />
        <StatCard
          title={t.todayCompletion}
          value={entriesToday}
          pct={Math.min(entriesToday * 25, 100)}
          emoji="⚡"
        />
      </section>

      {/* Steps */}
      <div className="mx-auto max-w-5xl px-3 pb-8">
        <StepTabs steps={steps} />
      </div>

      {/* === NEW: Floating menu & palette === */}
      <FabMenu
        onQuickHabit={() => setOpenQuickHabit(true)}
        onProHabit={() => setOpenProHabit(true)}
        onQuickLog={() => setOpenQuickLogPop(true)}
        onProEntry={() => setOpenEntrySheet(true)}
      />
      <CommandPalette
        onQuickHabit={() => setOpenQuickHabit(true)}
        onProHabit={() => setOpenProHabit(true)}
        onQuickLog={() => setOpenQuickLogPop(true)}
        onProEntry={() => setOpenEntrySheet(true)}
      />

      {/* === NEW: popovers/sheets === */}
      <QuickAddHabitPopover
        open={openQuickHabit}
        onOpenChange={setOpenQuickHabit}
        onAdvanced={() => {
          setOpenQuickHabit(false);
          setOpenProHabit(true);
        }}
      />
      <AddHabitSheet open={openProHabit} onOpenChange={setOpenProHabit} />
      <QuickLogPopover
        open={openQuickLogPop}
        onOpenChange={setOpenQuickLogPop}
      />
      <EntrySheet open={openEntrySheet} onOpenChange={setOpenEntrySheet} />

      {/* Quick Log Sheet (القديم) */}
      {showQuickLog && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowQuickLog(false)}
          />
          <section className="absolute bottom-0 inset-x-0 bg-white dark:bg-gray-950 rounded-t-2xl p-4 shadow-2xl">
            <div className="mx-auto max-w-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{t.qlogTitle}</div>
                <button
                  className="text-sm opacity-70"
                  onClick={() => setShowQuickLog(false)}
                >
                  ✕
                </button>
              </div>
              <div className="grid md:grid-cols-4 gap-2">
                <select
                  className="border p-2 rounded"
                  value={qlog.habitId}
                  onChange={(e) =>
                    setQlog((q) => ({ ...q, habitId: e.target.value }))
                  }
                >
                  <option value="">{t.qlogPickHabit}</option>
                  {habits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.icon ? `${h.icon} ${h.name}` : h.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button
                    className={`px-3 py-2 border rounded ${
                      qlog.done ? "bg-gray-200 dark:bg-gray-800" : ""
                    }`}
                    onClick={() => setQlog((q) => ({ ...q, done: true }))}
                  >
                    {t.qlogDone}
                  </button>
                  <button
                    className={`px-3 py-2 border rounded ${
                      !qlog.done ? "bg-gray-200 dark:bg-gray-800" : ""
                    }`}
                    onClick={() => setQlog((q) => ({ ...q, done: false }))}
                  >
                    {t.qlogNotDone}
                  </button>
                </div>

                <input
                  className="border p-2 rounded md:col-span-2"
                  placeholder={t.qlogNotePh}
                  value={qlog.note}
                  onChange={(e) =>
                    setQlog((q) => ({ ...q, note: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end">
                <button
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={handleQuickLogSave}
                >
                  {t.qlogSave}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

/* ===================== Steps ===================== */
function IntroStep({ copy }: { copy: string }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card title="MindSync">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-6">
          {copy}
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
      {/* Add Habit */}
      <div className="space-y-2 border p-3 rounded-2xl bg-white/60 dark:bg-gray-950/60 backdrop-blur">
        <div className="flex gap-2">
          <input
            className="border p-2 rounded flex-1"
            placeholder={i18n.habitNamePh}
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
          />
        </div>
        <HabitFormExtra value={newHabitExtra} onChange={setNewHabitExtra} />
      </div>

      {/* Habit list */}
      <ul className="grid sm:grid-cols-2 gap-3">
        {habits.map((h) => {
          const curr = streaks[h.id]?.current ?? 0;
          return (
            <li
              key={h.id}
              className="border rounded-2xl p-3 bg-white/70 dark:bg-gray-950/70 backdrop-blur"
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
                    className="px-3 py-1 rounded bg-indigo-600 text-white"
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
                <div className="flex items-center justify-between gap-3">
                  <button
                    className={`text-left flex-1 ${
                      currentHabitId === h.id ? "font-semibold underline" : ""
                    }`}
                    onClick={() => onSelectHabit(h.id)}
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
                    <button
                      className="text-sm px-2 py-1 rounded bg-green-600 text-white"
                      onClick={() => onCheckin(h.id)}
                    >
                      {i18n.todayDone}
                    </button>
                    <button
                      className="text-sm px-2 py-1 border rounded"
                      onClick={() => setEditHabit({ id: h.id, name: h.name })}
                    >
                      {i18n.edit}
                    </button>
                    <button
                      className="text-sm px-2 py-1 rounded bg-red-600 text-white"
                      onClick={() => onDelete(h.id)}
                    >
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

        <button
          className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={onAddEntry}
        >
          {i18n.addEntry}
        </button>
      </div>

      <ul className="space-y-2">
        {entries.map((e) => (
          <li
            key={e.id}
            className="border p-3 rounded-2xl bg-white/70 dark:bg-gray-950/70"
          >
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
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {e.reflection}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="text-sm px-2 py-1 border rounded"
                  onClick={() => onEditEntry(e)}
                >
                  {i18n.editEntry}
                </button>
                <button
                  className="text-sm px-2 py-1 rounded bg-red-600 text-white"
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

/* ======== Small Presentational Card with Ring ======== */
function StatCard({
  title,
  value,
  pct,
  emoji,
}: {
  title: string;
  value: number;
  pct: number;
  emoji: string;
}) {
  return (
    <div className="flex items-center gap-4 border rounded-2xl p-4 bg-white/70 dark:bg-gray-950/70 backdrop-blur">
      <ProgressRing value={pct} />
      <div>
        <div className="text-xs uppercase tracking-wider text-gray-500">
          {title}
        </div>
        <div className="text-3xl font-extrabold">{value}</div>
        <div className="text-sm opacity-80">{emoji}</div>
      </div>
    </div>
  );
}
