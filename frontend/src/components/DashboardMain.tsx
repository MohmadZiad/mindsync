"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { useTheme } from "next-themes";

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
import { groupEntriesDaily, wordsFromNotes } from "@/lib/reporting";

// Fixed UI
import AnimatedStatCard from "@/components/ui/AnimatedStatCard";
import SmartSearchBar from "@/components/ui/SmartSearchBar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import BackgroundPicker from "@/components/ui/BackgroundPicker";
import ProgressBarToday from "@/components/ui/ProgressBarToday";

// Addons
import FocusModeToggle from "@/components/addons/FocusModeToggle";

// Lazy chunks
const StepTabs = dynamic(() => import("@/components/StepTabs"));
const FabMenu = dynamic(() => import("@/components/flows/FabMenu"), {
  ssr: false,
});
const CommandPalette = dynamic(
  () => import("@/components/flows/CommandPalette"),
  { ssr: false }
);
const QuickAddHabitPopover = dynamic(
  () => import("@/components/flows/QuickAddHabitPopover"),
  { ssr: false }
);
const AddHabitSheet = dynamic(
  () => import("@/components/flows/AddHabitSheet"),
  { ssr: false }
);
const QuickLogPopover = dynamic(
  () => import("@/components/flows/QuickLogPopover"),
  { ssr: false }
);
const EntrySheet = dynamic(() => import("@/components/flows/EntrySheet"), {
  ssr: false,
});
const ConfettiSuccess = dynamic(
  () => import("@/components/addons/ConfettiSuccess"),
  { ssr: false }
);

// Sections
const IntroSection = dynamic(
  () => import("@/components/dashboard/sections/IntroSection")
);
const HabitsSection = dynamic(
  () => import("@/components/dashboard/sections/HabitsSection")
);
const EntriesSection = dynamic(
  () => import("@/components/dashboard/sections/EntriesSection")
);
const ReportsSection = dynamic(
  () => import("@/components/dashboard/sections/ReportsSection")
);

// Modal + AI controls
import PrettyModal from "@/components/ui/PrettyModal";
const AiReflectionControls = dynamic(
  () => import("@/components/AiReflectionControls"),
  { ssr: false }
);

// ===================== i18n =====================
export type Lang = "en" | "ar";
const T = {
  en: {
    dash: "Dashboard",
    mustLogin: "You need to sign in to view the dashboard.",
    goLogin: "Go to login",
    helloTime: (name: string, h: number) =>
      `${h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"}, ${name || "friend"}`,
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
    checkinToast: (n: number) => `Checked in ✅ — current streak: ${n} 🔥`,
    checkinErr: "Check-in failed",
    chooseHabit: "Choose habit",
    mood: "Mood",
    reflectionPh: "Reflection (optional)",
    addEntry: "Add Entry",
    editEntry: "Edit",
    deleteEntry: "Delete",
    clearFilter: "Clear filter",
    noteBtn: "Note ✍️",
    aiGenerate: "Generate with AI",
    aiModalTitle: "Smart Summary",
    aiModalSub: "Create quick, beautiful summaries for your entries.",
    aiClose: "Close",
    reportTitles: {
      line: "Daily Entries",
      heat: "Heatmap (last 6 months)",
      cloud: "Notes Word Cloud",
    },
    day: "day",
    days: "days",
  },
  ar: {
    dash: "لوحة التحكم",
    mustLogin: "لازم تسجّل دخول قبل ما تشوف الداشبورد.",
    goLogin: "الذهاب لتسجيل الدخول",
    helloTime: (name: string, h: number) =>
      `${h < 12 ? "صباح الخير" : "مساء الخير"} يا ${name || "صديقي"}`,
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
    // IMPORTANT: keep the variable name `n` in Latin letters inside the template string
    checkinToast: (n: number) => `تم تسجيل اليوم ✅ — الستريك الحالي: ${n} 🔥`,
    checkinErr: "فشل التشيك-إن",
    chooseHabit: "اختر عادة",
    mood: "المزاج",
    reflectionPh: "تدوينة (اختياري)",
    addEntry: "إضافة إدخال",
    editEntry: "تعديل",
    deleteEntry: "حذف",
    clearFilter: "إزالة الفلتر",
    noteBtn: "ملاحظة ✍️",
    aiGenerate: "توليد بالذكاء",
    aiModalTitle: "ملخص ذكي",
    aiModalSub: "أنشئ ملخصات سريعة وأنيقة لإدخالاتك.",
    aiClose: "إغلاق",
    reportTitles: {
      line: "الإدخالات اليومية",
      heat: "خريطة النشاط (آخر ٦ أشهر)",
      cloud: "سحابة كلمات الملاحظات",
    },
    day: "يوم",
    days: "أيام",
  },
} as const;

// ===================== Component =====================
export default function DashboardMain() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { user, loading: authLoading } = useAppSelector((s) => s.auth);
  const habits = useAppSelector((s) => s.habits.items);
  const entries = useAppSelector((s) => s.entries.items);
  const currentHabitId = useAppSelector((s) => s.entries.currentHabitId);

  // --- Language bootstrap + persistence ---
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const l =
      (typeof window !== "undefined"
        ? (localStorage.getItem("ms_lang") as Lang | null)
        : null) || "en";
    setLang(l);
  }, []);
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

  // --- Anti-refresh guards (anchors + rogue submit buttons) ---
  useEffect(() => {
    // 1) Prevent anchors like href="#..." from changing the hash / jumping
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const a = el.closest<HTMLAnchorElement>('a[href^="#"], a[href=""]');
      if (a) e.preventDefault();
    };
    document.addEventListener("click", onClick, true);

    // 2) If a component renders a <form> with <button> lacking type,
    //    clicking it will submit → navigation. Force them to type="button".
    const fixButtons = () => {
      document
        .querySelectorAll<HTMLButtonElement>("form button:not([type])")
        .forEach((b) => (b.type = "button"));
    };
    fixButtons();
    const mo = new MutationObserver(fixButtons);
    mo.observe(document.body, { childList: true, subtree: true });

    // 3) Clear hash if something still toggles it
    const onHash = () => {
      try {
        history.replaceState(null, "", " ");
      } catch {}
    };
    window.addEventListener("hashchange", onHash);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHash);
      mo.disconnect();
    };
  }, []);

  // --- Local UI state ---
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
  const [qlog, setQlog] = useState<{
    habitId: string;
    note: string;
    done: boolean;
  }>({ habitId: "", note: "", done: true });
  const [showQuickLog, setShowQuickLog] = useState(false);

  // AI Modal
  const [openAiModal, setOpenAiModal] = useState(false);

  // Flow visibility
  const [openQuickHabit, setOpenQuickHabit] = useState(false);
  const [openProHabit, setOpenProHabit] = useState(false);
  const [openQuickLogPop, setOpenQuickLogPop] = useState(false);
  const [openEntrySheet, setOpenEntrySheet] = useState(false);

  // --- Auth + initial fetch ---
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

  const hasHabits = habits.length > 0;

  // --- Derived numbers ---
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

  // --- Small helpers ---
  function goToHabitsTab() {
    const labels = [T.en.steps.habits, T.ar.steps.habits];
    const btn = Array.from(
      document.querySelectorAll("button,[role='tab']")
    ).find((b: any) => labels.includes((b.textContent || "").trim()));
    (btn as HTMLButtonElement | undefined)?.click();
  }
  function goToReportsTab() {
    const labels = [T.en.steps.reports, T.ar.steps.reports];
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

  // --- Steps (memoized) ---
  const steps = useMemo(
    () => [
      {
        id: "intro",
        title: t.steps.intro,
        content: (
          <IntroSection
            lang={lang}
            t={t}
            best={computeBest(habits, entries, streaks)}
            onOpenAi={() => setOpenAiModal(true)}
          />
        ),
        ready: true,
      },
      {
        id: "habits",
        title: t.steps.habits,
        content: (
          <HabitsSection
            lang={lang}
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
              day: t.day,
              days: t.days,
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
            onSelectHabit={async (hId: string) => {
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
            onCheckin={async (hId: string) => {
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
            onEditSave={async (id: string, name: string) => {
              if (!name.trim()) return;
              await dispatch(updateHabit({ id, name: name.trim() } as any));
              setEditHabit(null);
            }}
            onDelete={async (id: string) => {
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
          <EntriesSection
            lang={lang}
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
                await dispatch(
                  fetchEntries({ habitId: currentHabitId } as any)
                );
              else await dispatch(fetchEntries(undefined as any));
              try {
                const s = await habitsService.getStreak(entryForm.habitId);
                setStreaks((prev) => ({ ...prev, [entryForm.habitId]: s }));
              } catch {}
              setEntryForm((f) => ({ ...f, reflection: "" }));
              try {
                window.dispatchEvent(new CustomEvent("ms:entry-added"));
              } catch {}
            }}
            onEditEntry={async (e: { id: string; reflection?: string }) => {
              const newText =
                prompt(t.editEntry + ":", e.reflection || "") ?? undefined;
              if (newText === undefined) return;
              await dispatch(
                updateEntry({ id: e.id, data: { reflection: newText } } as any)
              );
              if (currentHabitId)
                await dispatch(
                  fetchEntries({ habitId: currentHabitId } as any)
                );
              else await dispatch(fetchEntries(undefined as any));
            }}
            onDeleteEntry={async (id: string) => {
              await dispatch(deleteEntry(id as any));
              if (currentHabitId)
                await dispatch(
                  fetchEntries({ habitId: currentHabitId } as any)
                );
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
        content: (
          <ReportsSection
            lang={lang}
            t={t}
            entries={entries}
            compute={{
              line: groupEntriesDaily(entries),
              heat: groupEntriesDaily(entries),
              words: wordsFromNotes(entries),
            }}
          />
        ),
        ready: true,
      },
    ],
    [
      lang,
      t,
      habits,
      entries,
      streaks,
      currentHabitId,
      entryForm.mood,
      entryForm.reflection,
    ]
  );

  // --- Render guards ---
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

  // --- Main UI ---
  return (
    <main
      dir={dir}
      className="min-h-screen bg-page text-[var(--ink-1)] pb-28 theme-smooth"
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-r from-indigo-500/10 via-fuchsia-400/10 to-indigo-500/10 blur-2xl hide-in-focus" />
      <ConfettiSuccess />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] backdrop-blur bg-[var(--bg-0)]/75">
        <div className="mx-auto max-w-7xl px-3 md:px-6 flex items-center justify-between py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-mood/90">
              {t.dash}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-fuchsia-600 bg-clip-text text-transparent">
              {t.helloTime(
                (user?.email?.split("@")[0] ?? "").replace(/\./g, " "),
                new Date().getHours()
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              aria-label={t.lang}
              title={t.lang}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>

            <button
              type="button"
              className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]"
              onClick={goToHabitsTab}
            >
              {t.addHabit}
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]"
              onClick={() => setShowQuickLog(true)}
            >
              {t.quickLog}
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]"
              onClick={() => dispatch(logoutThunk())}
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <section className="mx-auto max-w-7xl px-3 md:px-6 mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <SmartSearchBar
            lang={lang}
            habits={habits as any}
            reports={[
              { id: "line", title: T[lang].reportTitles.line },
              { id: "heat", title: T[lang].reportTitles.heat },
              { id: "cloud", title: T[lang].reportTitles.cloud },
            ]}
            onPickHabit={(id: string) => {
              dispatch(setCurrentHabit(id as any));
              setEntryForm((f) => ({ ...f, habitId: id }));
            }}
            onPickReport={goToReportsTab}
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle
            lang={lang}
            currentTheme={
              mounted ? (resolvedTheme as "light" | "dark") : undefined
            }
            onChangeTheme={setTheme}
          />
          <BackgroundPicker lang={lang} />
          <FocusModeToggle lang={lang} variant="chip" />
        </div>
      </section>

      {/* Top helpers */}
      <TopHelpers
        lang={lang}
        hasHabits={hasHabits}
        habits={habits}
        entries={entries}
      />

      {/* Mini Stats */}
      <section className="mx-auto max-w-7xl px-3 md:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 focus-dim">
        <AnimatedStatCard
          lang={lang}
          title={t.activeHabits}
          value={habits.length}
          sub="🧩"
        />
        <AnimatedStatCard
          lang={lang}
          title={t.entriesThisWeek}
          value={entriesThisWeek}
          sub="📆"
        />
        <AnimatedStatCard
          lang={lang}
          title={t.todayCompletion}
          value={entriesToday}
          sub="⚡"
        />
      </section>

      {/* Today progress bar */}
      <section className="mx-auto max-w-7xl px-3 md:px-6 -mt-1 mb-3 focus-ring">
        <ProgressBarToday
          done={entriesToday}
          total={Math.max(habits.length, 1)}
          label={lang === "ar" ? "إنجاز اليوم" : "Today’s progress"}
        />
      </section>

      {/* Steps */}
      <div className="mx-auto max-w-7xl px-3 md:px-6 pb-8">
        <StepTabs steps={steps as any} />
      </div>

      {/* Floating actions */}
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

      {/* Sheets/Popovers */}
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

      {/* Legacy Quick Log bottom sheet */}
      {showQuickLog && (
        <LegacyQuickLog
          habits={habits}
          qlog={qlog}
          setQlog={setQlog}
          onClose={() => setShowQuickLog(false)}
          onSave={handleQuickLogSave}
          t={t}
        />
      )}

      {/* AI Modal */}
      <PrettyModal
        open={openAiModal}
        onClose={() => setOpenAiModal(false)}
        title={T[lang].aiModalTitle}
        subtitle={T[lang].aiModalSub}
        dir={dir as any}
      >
        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-3 md:p-4 shadow-sm">
          <AiReflectionControls />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpenAiModal(false)}
            className="btn-secondary"
          >
            {T[lang].aiClose}
          </button>
        </div>
      </PrettyModal>
    </main>
  );
}

// ===================== Sub-views / helpers =====================
function TopHelpers({ lang, hasHabits, habits, entries }: any) {
  const OnboardingCoach = dynamic(
    () => import("@/components/addons/OnboardingCoach"),
    { ssr: false }
  );
  const DailyPromptWidget = dynamic(
    () => import("@/components/addons/DailyPromptWidget"),
    { ssr: false }
  );
  const InsightsPanel = dynamic(
    () => import("@/components/addons/InsightsPanel"),
    { ssr: false }
  );

  return (
    <section className="mx-auto max-w-7xl px-3 md:px-6 mt-4 space-y-4 hide-in-focus">
      <OnboardingCoach
        hasHabits={hasHabits}
        hasEntries={entries.length > 0}
        lang={lang}
      />
      <DailyPromptWidget
        lang={lang}
        onStart={() => document.dispatchEvent(new CustomEvent("open:quicklog"))}
      />
      <InsightsPanel
        entries={entries as any}
        habits={habits as any}
        lang={lang}
      />
    </section>
  );
}

function LegacyQuickLog({ habits, qlog, setQlog, onClose, onSave, t }: any) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <section className="absolute bottom-0 inset-x-0 bg-[var(--bg-0)] rounded-t-2xl p-4 shadow-2xl border border-[var(--line)]">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{t.qlogTitle}</div>
            <button
              type="button"
              className="text-sm opacity-70"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <div className="grid md:grid-cols-4 gap-2">
            <select
              className="border p-2 rounded bg-[var(--bg-1)]"
              value={qlog.habitId}
              onChange={(e) =>
                setQlog((q: any) => ({ ...q, habitId: e.target.value }))
              }
            >
              <option value="">{t.qlogPickHabit}</option>
              {habits.map((h: any) => (
                <option key={h.id} value={h.id}>
                  {h.icon ? `${h.icon} ${h.name}` : h.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`px-3 py-2 border rounded bg-[var(--bg-1)] ${qlog.done ? "ring-2 ring-indigo-400" : ""}`}
                onClick={() => setQlog((q: any) => ({ ...q, done: true }))}
              >
                {t.qlogDone}
              </button>
              <button
                type="button"
                className={`px-3 py-2 border rounded bg-[var(--bg-1)] ${!qlog.done ? "ring-2 ring-indigo-400" : ""}`}
                onClick={() => setQlog((q: any) => ({ ...q, done: false }))}
              >
                {t.qlogNotDone}
              </button>
            </div>
            <input
              className="border p-2 rounded md:col-span-2 bg-[var(--bg-1)]"
              placeholder={t.qlogNotePh}
              value={qlog.note}
              onChange={(e) =>
                setQlog((q: any) => ({ ...q, note: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={onSave}
            >
              {t.qlogSave}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function computeBest(
  habits: any[],
  entries: any[],
  streaks: Record<string, Streak>
) {
  if (!habits.length || !entries.length) return null;

  // Top habit by entries this week
  const from = new Date();
  const start = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() - from.getDay()
  );
  const counts = new Map<string, number>();
  entries.forEach((e) => {
    const d = new Date(e.createdAt);
    if (d >= start) counts.set(e.habitId, (counts.get(e.habitId) || 0) + 1);
  });

  let winner: any = null;
  let max = -1;
  habits.forEach((h) => {
    const c = counts.get(h.id) || 0;
    if (c > max) {
      max = c;
      winner = h;
    }
  });

  // Points over last 7 days for the winner
  const now = new Date();
  const start2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const buckets = Array(7).fill(0);
  entries.forEach((e) => {
    if (winner && e.habitId !== winner.id) return;
    const d = new Date(e.createdAt);
    if (d < start2) return;
    const idx = Math.floor((+d - +start2) / 86400000);
    if (idx >= 0 && idx < 7) buckets[idx] += 1;
  });

  return {
    habit: winner,
    weekPoints: buckets,
    streak: winner ? (streaks[winner.id]?.current ?? 0) : 0,
  };
}
