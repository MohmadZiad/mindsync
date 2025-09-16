"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

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

// utils
import { groupEntriesDaily, wordsFromNotes } from "@/lib/reporting";

// lazy UI (reduce initial JS — best practice)
const StepTabs = dynamic(() => import("@/components/StepTabs"));
const HabitFormExtra = dynamic(() => import("@/components/HabitFormExtra"));
const StreakMeCard = dynamic(() => import("@/components/StreakMeCard"));
const AiReflectionControls = dynamic(
  () => import("@/components/AiReflectionControls"),
  { ssr: false }
);
const WeeklyGrouped = dynamic(() => import("@/components/WeeklyGrouped"), {
  ssr: false,
});
const MonthlySummary = dynamic(() => import("@/components/MonthlySummary"), {
  ssr: false,
});

// flows
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
  {
    ssr: false,
  }
);
const QuickLogPopover = dynamic(
  () => import("@/components/flows/QuickLogPopover"),
  { ssr: false }
);
const EntrySheet = dynamic(() => import("@/components/flows/EntrySheet"), {
  ssr: false,
});

// reports
const ProgressLine = dynamic(
  () => import("@/components/reports/ProgressLine"),
  { ssr: false }
);
const EntriesHeatmap = dynamic(
  () => import("@/components/reports/EntriesHeatmap"),
  { ssr: false }
);
const NotesWordCloud = dynamic(
  () => import("@/components/reports/NotesWordCloud"),
  { ssr: false }
);
const ExportPdfButton = dynamic(
  () => import("@/components/reports/ExportPdfButton"),
  { ssr: false }
);

// addons
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
const ConfettiSuccess = dynamic(
  () => import("@/components/addons/ConfettiSuccess"),
  { ssr: false }
);

// ======= NEW UI pieces =======
import AnimatedCard from "./ui/AnimatedCard";
import AnimatedStatCard from "@/components/ui/AnimatedStatCard";
import ProgressBarToday from "@/components/addons/ProgressBarToday";
import SmartSearchBar from "./ui/SmartSearchBar";
import ThemeToggle from "./ui/ThemeToggle";
import BackgroundPicker from "./ui/BackgroundPicker";

// ===================== i18n =====================
export type Lang = "en" | "ar";
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
  },
} as const;

// ===================== Small helpers =====================
function ProgressRing({
  value = 0,
  size = 64,
  stroke = 6,
}: {
  value?: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const gradId = useMemo(() => `g-${Math.random().toString(36).slice(2)}`, []);
  return (
    <svg width={size} height={size} className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6D5EF1" />
          <stop offset="100%" stopColor="#F15ECC" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        className="fill-none"
        stroke="rgba(148,163,184,.25)"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        className="fill-none"
        stroke={`url(#${gradId})`}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// Pretty modal used for AI reflection
function PrettyModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  lang = "en",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  lang?: Lang;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="absolute inset-0 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-white to-violet-50 dark:from-slate-900 dark:to-indigo-950 shadow-2xl">
          <div className="pointer-events-none absolute -top-16 -end-16 h-40 w-40 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -start-12 h-36 w-36 rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div className="relative p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-1 text-sm text-[var(--text-3)]">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="btn btn--ghost touch rounded-xl"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Collapsible card (animated open/close)
function CollapsibleCard({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[var(--bg-2)] transition"
      >
        <span className="text-xl">{icon || "📦"}</span>
        <span className="font-semibold flex-1 text-left">{title}</span>
        <span
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          ⌄
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ===================== Page =====================
export default function DashboardMain() {
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

  // theme (kept for initial load — ThemeToggle سيضبط النهائي)
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

  // legacy quick log
  const [qlog, setQlog] = useState<{
    habitId: string;
    note: string;
    done: boolean;
  }>({ habitId: "", note: "", done: true });
  const [showQuickLog, setShowQuickLog] = useState(false);

  // AI Modal
  const [openAiModal, setOpenAiModal] = useState(false);

  // flows visibility
  const [openQuickHabit, setOpenQuickHabit] = useState(false);
  const [openProHabit, setOpenProHabit] = useState(false);
  const [openQuickLogPop, setOpenQuickLogPop] = useState(false);
  const [openEntrySheet, setOpenEntrySheet] = useState(false);

  // auth + initial fetch
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

  // best habit this week (for the special card)
  function getWeekPoints(all: any[], habitId?: string) {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    );
    const buckets = Array(7).fill(0);
    all.forEach((e) => {
      if (habitId && e.habitId !== habitId) return;
      const d = new Date(e.createdAt);
      if (d < start) return;
      const idx = Math.floor((+d - +start) / 86400000);
      if (idx >= 0 && idx < 7) buckets[idx] += 1;
    });
    return buckets;
  }
  const bestHabit = useMemo(() => {
    if (!habits.length || !entries.length) return null;
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
    return winner;
  }, [habits, entries]);
  const bestWeekPoints = useMemo(
    () => (bestHabit ? getWeekPoints(entries, bestHabit.id) : Array(7).fill(0)),
    [entries, bestHabit]
  );
  const bestStreak = bestHabit ? streaks[bestHabit.id]?.current ?? 0 : 0;

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

  const steps = [
    {
      id: "intro",
      title: t.steps.intro,
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          {/* يمكنك إبقاء CollapsibleCard أو استخدام AnimatedCard — أخليتها AnimatedCard للتجميل */}
          <AnimatedCard
            lang={lang}
            title="MindSync"
            subtitle={t.introCopy}
            icon="✨"
            gradient
            defaultOpen
          >
            <div className="mt-2">
              <button
                className="btn-primary rounded-2xl"
                onClick={() => setOpenAiModal(true)}
                title={t.aiGenerate}
              >
                ✨ {t.aiGenerate}
              </button>
            </div>
          </AnimatedCard>

          <StreakMeCard />

          <div className="md:col-span-2 space-y-4">
            <AnimatedCard
              lang={lang}
              title={lang === "ar" ? "انعكاس ذكي" : "AI Reflection"}
              icon="🧠"
              gradient
              defaultOpen
            >
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-3">
                <AiReflectionControls />
              </div>
            </AnimatedCard>

            {bestHabit && (
              <AnimatedCard
                lang={lang}
                title={
                  lang === "ar"
                    ? "أفضل عادة هذا الأسبوع"
                    : "Best Habit This Week"
                }
                icon="🏆"
                flip
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm">
                    <div className="font-semibold">
                      {bestHabit.icon
                        ? `${bestHabit.icon} ${bestHabit.name}`
                        : bestHabit.name}
                    </div>
                    <div className="opacity-70">
                      {lang === "ar"
                        ? `🔥 سلسلة: ${bestStreak}`
                        : `🔥 Streak: ${bestStreak}`}
                    </div>
                  </div>
                  <div className="flex gap-1 items-end">
                    {bestWeekPoints.map((v, i) => (
                      <div
                        key={i}
                        className="w-6 rounded-t bg-indigo-400/20"
                        style={{ height: 6 + v * 10 }}
                      />
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            )}
          </div>
        </div>
      ),
      ready: true,
    },
    {
      id: "habits",
      title: t.steps.habits,
      content: (
        <HabitsStep
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
              await dispatch(fetchEntries({ habitId: currentHabitId } as any));
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
      content: <ReportsStep lang={lang} />,
      ready: true,
    },
  ];

  return (
    <main
      dir={dir}
      className="min-h-screen bg-[var(--bg-0)] text-[var(--ink-1)] pb-28 theme-smooth"
    >
      {/* gradient top banner */}
      <div className="pointer-events-none absolute inset-x-0 h-48 bg-gradient-to-r from-indigo-500/10 via-fuchsia-400/10 to-indigo-500/10 blur-2xl" />

      {/* global micro-interaction listener */}
      <ConfettiSuccess />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] backdrop-blur bg-[var(--bg-0)]/75">
        <div className="container flex items-center justify-between py-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-500">
              {t.dash}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-fuchsia-600 bg-clip-text text-transparent">
              {t.helloTime(emailName, hour)}
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

            {/* Removed the old theme button; ThemeToggle below in toolbar */}
            <button
              className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]"
              onClick={() => goToHabitsTab()}
            >
              {t.addHabit}
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]"
              onClick={() => setShowQuickLog(true)}
            >
              {t.quickLog}
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)]"
              onClick={() => dispatch(logoutThunk())}
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar: search + theme + background */}
      <section className="container mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <SmartSearchBar
            lang={lang}
            habits={habits as any}
            reports={[
              { id: "line", title: t.reportTitles.line },
              { id: "heat", title: t.reportTitles.heat },
              { id: "cloud", title: t.reportTitles.cloud },
            ]}
            onPickHabit={(id) => {
              dispatch(setCurrentHabit(id as any));
              setEntryForm((f) => ({ ...f, habitId: id }));
            }}
            onPickReport={() => goToReportsTab()}
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle lang={lang} />
          <BackgroundPicker lang={lang} />
        </div>
      </section>

      {/* Top helpers */}
      <section className="container mt-4 space-y-4">
        <OnboardingCoach
          hasHabits={hasHabits}
          hasEntries={entries.length > 0}
          lang={lang}
        />
        <DailyPromptWidget
          lang={lang}
          onStart={() => setOpenQuickLogPop(true)}
        />
        <InsightsPanel
          entries={entries as any}
          habits={habits as any}
          lang={lang}
        />
      </section>

      {/* Mini Stats (Animated) */}
      <section className="container py-4 grid grid-cols-1 md:grid-cols-3 gap-3">
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
      <section className="container -mt-1 mb-3">
        <ProgressBarToday
          done={entriesToday}
          total={Math.max(habits.length, 1)}
          label={lang === "ar" ? "إنجاز اليوم" : "Today’s progress"}
        />
      </section>

      {/* Steps */}
      <div className="container pb-8">
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

      {/* popovers/sheets */}
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
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowQuickLog(false)}
          />
          <section className="absolute bottom-0 inset-x-0 bg-[var(--bg-0)] rounded-t-2xl p-4 shadow-2xl border border-[var(--line)]">
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
                  className="border p-2 rounded bg-[var(--bg-1)]"
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
                    className={`px-3 py-2 border rounded bg-[var(--bg-1)] ${
                      qlog.done ? "ring-2 ring-indigo-400" : ""
                    }`}
                    onClick={() => setQlog((q) => ({ ...q, done: true }))}
                  >
                    {t.qlogDone}
                  </button>
                  <button
                    className={`px-3 py-2 border rounded bg-[var(--bg-1)] ${
                      !qlog.done ? "ring-2 ring-indigo-400" : ""
                    }`}
                    onClick={() => setQlog((q) => ({ ...q, done: false }))}
                  >
                    {t.qlogNotDone}
                  </button>
                </div>
                <input
                  className="border p-2 rounded md:col-span-2 bg-[var(--bg-1)]"
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

      {/* AI Modal */}
      <PrettyModal
        open={openAiModal}
        onClose={() => setOpenAiModal(false)}
        title={t.aiModalTitle}
        subtitle={t.aiModalSub}
        lang={lang}
      >
        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-3 md:p-4 shadow-sm">
          <AiReflectionControls />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setOpenAiModal(false)}
            className="btn-secondary"
          >
            {t.aiClose}
          </button>
        </div>
      </PrettyModal>
    </main>
  );
}

// ===================== Sub-views =====================
function HabitsStep(props: {
  lang?: Lang;
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
    lang,
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
      <CollapsibleCard
        title={lang === "ar" ? "أضف عادة" : "Add Habit"}
        icon="➕"
      >
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder={i18n.habitNamePh}
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
            />
            <button className="btn-primary" onClick={onAddHabit}>
              {i18n.add}
            </button>
          </div>
          <HabitFormExtra
            value={newHabitExtra}
            onChange={setNewHabitExtra}
            lang={lang}
          />
        </div>
      </CollapsibleCard>

      <ul className="grid sm:grid-cols-2 gap-3">
        {habits.map((h) => {
          const curr = streaks[h.id]?.current ?? 0;
          return (
            <li
              key={h.id}
              className="border border-[var(--line)] rounded-2xl p-3 bg-[var(--bg-1)] shadow-sm card-hover"
            >
              {editHabit && editHabit.id === h.id ? (
                <div className="flex gap-2 w-full">
                  <input
                    className="input flex-1"
                    value={editHabit.name}
                    onChange={(e) =>
                      setEditHabit({ id: h.id, name: e.target.value })
                    }
                  />
                  <button
                    className="btn-primary"
                    onClick={() => onEditSave(h.id, editHabit.name)}
                  >
                    {i18n.save}
                  </button>
                  <button
                    className="btn-secondary"
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
                    <button
                      className="text-sm px-2 py-1 rounded bg-green-600 text-white"
                      onClick={() => onCheckin(h.id)}
                      title={i18n.todayDone}
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
  lang?: Lang;
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
    lang,
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
  const [noteOpen, setNoteOpen] = useState(false);
  const NoteModal = dynamic(() => import("@/components/NoteModal"), {
    ssr: false,
  });

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-2">
        <select
          className="input"
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
          className="input"
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
        <button
          type="button"
          className="btn-secondary text-left"
          onClick={() => setNoteOpen(true)}
          title={i18n.reflectionPh}
        >
          {entryForm.reflection
            ? entryForm.reflection.slice(0, 40) + "…"
            : lang === "ar"
            ? T.ar.noteBtn
            : T.en.noteBtn}
        </button>
        <button className="btn-primary" onClick={onAddEntry}>
          {i18n.addEntry}
        </button>
      </div>

      {noteOpen && (
        <NoteModal
          lang={lang}
          defaultText={entryForm.reflection || ""}
          onCancel={() => setNoteOpen(false)}
          onSave={(payload: any) => {
            setEntryForm({ ...entryForm, reflection: payload.text });
            setNoteOpen(false);
          }}
        />
      )}

      <ul className="divide-y divide-[var(--line)] border border-[var(--line)] rounded-2xl overflow-hidden">
        {entries.map((e) => (
          <li key={e.id} className="p-3 bg-[var(--bg-1)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm">
                  <span className="font-medium">{e.mood}</span>
                  <span className="opacity-70">
                    {" "}
                    — {new Date(e.createdAt).toLocaleString(locale)}
                  </span>
                </div>
                {e.reflection && (
                  <div className="text-xs text-[var(--ink-1)]/90">
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
        <button className="btn-secondary" onClick={onClearFilter}>
          {i18n.clearFilter}
        </button>
      )}
    </div>
  );
}

function ReportsStep({ lang = "en" as Lang }) {
  const entries = useAppSelector((s) => s.entries.items);
  const t = T[lang];
  const line = useMemo(() => groupEntriesDaily(entries), [entries]);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180);
  const heatValues = line;
  const words = useMemo(() => wordsFromNotes(entries), [entries]);

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <ExportPdfButton targetId="report-root" />
      </div>
      <div id="report-root" className="grid gap-4">
        <ProgressLine data={line} title={t.reportTitles.line} />
        <EntriesHeatmap
          values={heatValues}
          startDate={start}
          endDate={end}
          title={t.reportTitles.heat}
        />
        <NotesWordCloud words={words} title={t.reportTitles.cloud} />
        <WeeklyGrouped />
        <MonthlySummary />
      </div>
    </div>
  );
}

// (النسخة القديمة بقيت للاستخدام الداخلي لبعض الأقسام)
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
    <div className="relative overflow-hidden flex items-center gap-4 border border-[var(--line)] rounded-2xl p-4 bg-[var(--bg-1)] shadow-sm transition-transform duration-200 hover:scale-[1.02]">
      <div className="pointer-events-none absolute -top-10 end-0 h-28 w-28 rounded-full bg-indigo-400/20 blur-2xl" />
      <ProgressRing value={pct} />
      <div>
        <div className="text-xs uppercase tracking-wider opacity-70">
          {title}
        </div>
        <div className="text-3xl font-extrabold">{value}</div>
        <div className="text-sm opacity-80">{emoji}</div>
      </div>
    </div>
  );
}
