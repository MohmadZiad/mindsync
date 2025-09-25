"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
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

/* ---------------- Fixed UI ---------------- */
import AnimatedStatCard from "@/components/ui/AnimatedStatCard";
import SmartSearchBar from "@/components/ui/SmartSearchBar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import BackgroundPicker from "@/components/ui/BackgroundPicker";
import ProgressBarToday from "@/components/ui/ProgressBarToday";

/* ---------------- Addons ------------------ */
import FocusModeToggle from "@/components/addons/FocusModeToggle";

/* ---------------- Lazy chunks ------------- */
const StepTabs = dynamic(() => import("@/components/StepTabs"), { ssr: false });
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

/* ---------------- Section deps (inline sections use these) ---------------- */
const NoteModal = dynamic(() => import("@/components/NoteModal"), {
  ssr: false,
});
const HabitFormExtra = dynamic(() => import("@/components/HabitFormExtra"));
const AnimatedCard = dynamic(() => import("@/components/ui/AnimatedCard"));
const StreakMeCard = dynamic(() => import("@/components/StreakMeCard"));
const AiReflectionControls = dynamic(
  () => import("@/components/AiReflectionControls"),
  { ssr: false }
);
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
const WeeklyGrouped = dynamic(() => import("@/components/WeeklyGrouped"), {
  ssr: false,
});
const MonthlySummary = dynamic(() => import("@/components/MonthlySummary"), {
  ssr: false,
});

/* ---------------- Modal shell ------------- */
import PrettyModal from "@/components/ui/PrettyModal";

/* ===================== i18n ===================== */
export type Lang = "en" | "ar";

type HabitsI18n = {
  habitNamePh: string;
  add: string;
  save: string;
  cancel: string;
  todayDone: string;
  edit: string;
  del: string;
  checkinToast: (n: number) => string;
  checkinErr: string;
  day?: string;
  days?: string;
};

type EntriesI18n = {
  chooseHabit: string;
  mood: string;
  reflectionPh: string;
  addEntry: string;
  editEntry: string;
  deleteEntry: string;
  clearFilter: string;
};

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
    todayCompletion: "Today's completion",
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

/* ===================== Helpers ===================== */
function computeBest(
  habits: any[],
  entries: any[],
  streaks: Record<string, Streak>
) {
  if (!habits?.length || !entries?.length) return null;
  try {
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
    if (!winner) return null;

    const now = new Date();
    const start2 = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    );
    const buckets = Array(7).fill(0);
    entries.forEach((e) => {
      if (e.habitId !== winner.id) return;
      const d = new Date(e.createdAt);
      if (d < start2) return;
      const idx = Math.floor((+d - +start2) / 86400000);
      if (idx >= 0 && idx < 7) buckets[idx] += 1;
    });

    return {
      habit: winner,
      weekPoints: buckets,
      streak: streaks[winner.id]?.current ?? 0,
    };
  } catch (err) {
    console.error("computeBest error:", err);
    return null;
  }
}

/* =============================================================================
   Sections (INLINE)
   ========================================================================== */

/* ---------- IntroSection ---------- */
const IntroSection = memo(function IntroSection({
  lang,
  t,
  best,
  onOpenAi,
}: {
  lang: Lang;
  t: any;
  best: { habit: any; weekPoints: number[]; streak: number } | null;
  onOpenAi: () => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 auto-rows-min">
      <div className="col-span-12 lg:col-span-8">
        <AnimatedCard
          lang={lang}
          title="MindSync"
          subtitle={t.introCopy}
          icon="✨"
          gradient
          defaultOpen
        >
          <div className="mt-2 flex gap-2">
            <button
              className="btn-primary rounded-2xl"
              onClick={onOpenAi}
              title={t.aiGenerate}
            >
              ✨ {t.aiGenerate}
            </button>
          </div>
        </AnimatedCard>
      </div>
      <div className="col-span-12 lg:col-span-4">
        <div className="h-full">
          <StreakMeCard />
        </div>
      </div>
      <div className="col-span-12 xl:col-span-7">
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
      </div>
      {best?.habit && (
        <div className="col-span-12 xl:col-span-5">
          <AnimatedCard
            lang={lang}
            title={
              lang === "ar" ? "أفضل عادة هذا الأسبوع" : "Best Habit This Week"
            }
            icon="🏆"
            flip
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <div className="font-semibold">
                  {best.habit.icon
                    ? `${best.habit.icon} ${best.habit.name}`
                    : best.habit.name}
                </div>
                <div className="opacity-70">
                  {lang === "ar"
                    ? `🔥 سلسلة: ${best.streak}`
                    : `🔥 Streak: ${best.streak}`}
                </div>
              </div>
              <div className="flex gap-1 items-end w-40">
                {best.weekPoints.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-indigo-400/20"
                    style={{ height: 6 + v * 10 }}
                  />
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
});

/* ---------- HabitsSection ---------- */
const HabitsSection = memo(function HabitsSection(props: {
  lang?: Lang;
  i18n: HabitsI18n;
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
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] shadow-sm overflow-hidden">
        <div className="w-full flex items-center gap-2 px-4 py-3 border-b border-[var(--line)]">
          <span className="text-xl">➕</span>
          <span className="font-semibold flex-1 text-left">
            {lang === "ar" ? "أضف عادة" : "Add Habit"}
          </span>
        </div>
        <div className="p-4 space-y-2">
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
      </div>

      <ul className="grid sm:grid-cols-2 gap-3">
        {habits.map((h) => {
          const curr = streaks[h.id]?.current ?? 0;
          return (
            <motion.li
              key={h.id}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: habits.indexOf(h) * 0.05 }}
              layout
            >
              <div className="card-interactive p-5 h-full">
                {/* Gradient overlay for active state */}
                {currentHabitId === h.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/10 to-[var(--brand-accent)]/5 rounded-2xl" />
                )}
                
                {editHabit && editHabit.id === h.id ? (
                  <motion.div 
                    className="flex gap-3 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <input
                      className="input flex-1"
                      value={editHabit.name}
                      onChange={(e) =>
                        setEditHabit({ id: h.id, name: e.target.value })
                      }
                      autoFocus
                    />
                    <button
                      className="btn-primary-sm"
                      onClick={() => onEditSave(h.id, editHabit.name)}
                    >
                      {i18n.save}
                    </button>
                    <button
                      className="btn-secondary px-4 py-2 text-sm"
                      onClick={() => setEditHabit(null)}
                    >
                      {i18n.cancel}
                    </button>
                  </motion.div>
                ) : (
                  <div className="relative space-y-4">
                    {/* Main content */}
                    <button
                      className="text-left w-full group/habit"
                      onClick={() => onSelectHabit(h.id)}
                      title={h.name}
                    >
                      <div className="flex items-start gap-3">
                        <motion.div 
                          className="text-2xl p-2 rounded-xl bg-[var(--bg-2)] group-hover/habit:bg-[var(--brand)]/10 transition-colors duration-200"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {h.icon ?? "📌"}
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-semibold text-[var(--ink-1)] mb-1 transition-colors duration-200",
                            currentHabitId === h.id && "text-[var(--brand)]"
                          )}>
                            {h.name}
                          </div>
                          
                          {h.description && (
                            <div className="text-sm text-[var(--ink-2)] line-clamp-2 mb-2">
                              {h.description}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium",
                              curr > 0 
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                : "bg-[var(--bg-3)] text-[var(--ink-3)]"
                            )}>
                              🔥 {curr} {curr === 1 ? (i18n.day ?? "day") : (i18n.days ?? "days")}
                            </span>
                            
                            <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-3)] text-[var(--ink-3)]">
                              {h.frequency === "weekly" ? "أسبوعي" : "يومي"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <motion.button
                        className="btn-primary-sm flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckin(h.id);
                        }}
                        title={i18n.todayDone}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-base">✓</span>
                        {i18n.todayDone}
                      </motion.button>
                      
                      <motion.button
                        className="btn-ghost p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditHabit({ id: h.id, name: h.name });
                        }}
                        title={i18n.edit}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-base">✏️</span>
                      </motion.button>
                      
                      <motion.button
                        className="btn-ghost p-2 text-[var(--error)] hover:bg-[var(--error-bg)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(h.id);
                        }}
                        title={i18n.del}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-base">🗑️</span>
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
});

/* ---------- EntriesSection ---------- */
const EntriesSection = memo(function EntriesSection(props: {
  lang?: Lang;
  i18n: EntriesI18n;
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
              ? "ملاحظة ✍️"
              : "Note ✍️"}
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
});

/* ---------- ReportsSection ---------- */
const ReportsSection = memo(function ReportsSection({
  lang = "en",
  t,
  entries,
  compute,
}: {
  lang?: Lang;
  t: any;
  entries: any[];
  compute: {
    line: any[];
    heat: any[];
    words: { text: string; value: number }[];
  };
}) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180);

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <ExportPdfButton targetId="report-root" />
      </div>
      <div id="report-root" className="grid gap-4">
        <ProgressLine data={compute.line} title={t.reportTitles.line} />
        <EntriesHeatmap
          values={compute.heat}
          startDate={start}
          endDate={end}
          title={t.reportTitles.heat}
        />
        <NotesWordCloud words={compute.words} title={t.reportTitles.cloud} />
        <WeeklyGrouped />
        <MonthlySummary />
      </div>
    </div>
  );
});

/* ---------- TopHelpers (inline) ---------- */
const TopHelpers = memo(function TopHelpers({
  lang,
  hasHabits,
  habits,
  entries,
}: {
  lang: Lang;
  hasHabits: boolean;
  habits: any[];
  entries: any[];
}) {
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
      <InsightsPanel entries={entries} habits={habits} lang={lang} />
    </section>
  );
});

/* ---------- LegacyQuickLog (inline) ---------- */
const LegacyQuickLog = memo(function LegacyQuickLog({
  habits,
  qlog,
  setQlog,
  onClose,
  onSave,
  t,
}: {
  habits: any[];
  qlog: any;
  setQlog: (updater: (prev: any) => any) => void;
  onClose: () => void;
  onSave: () => void;
  t: any;
}) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleHabitChange = useCallback(
    (habitId: string) => setQlog((q) => ({ ...q, habitId })),
    [setQlog]
  );
  const handleDoneChange = useCallback(
    (done: boolean) => setQlog((q) => ({ ...q, done })),
    [setQlog]
  );
  const handleNoteChange = useCallback(
    (note: string) => setQlog((q) => ({ ...q, note })),
    [setQlog]
  );

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={handleBackdropClick}
      />
      <section className="absolute bottom-0 inset-x-0 bg-[var(--bg-0)] rounded-t-2xl p-4 shadow-2xl border border-[var(--line)]">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{t.qlogTitle}</div>
            <button
              type="button"
              className="text-sm opacity-70 hover:opacity-100"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <div className="grid md:grid-cols-4 gap-2">
            <select
              className="border p-2 rounded bg-[var(--bg-1)]"
              value={qlog.habitId}
              onChange={(e) => handleHabitChange(e.target.value)}
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
                type="button"
                className={`px-3 py-2 border rounded bg-[var(--bg-1)] transition-colors ${qlog.done ? "ring-2 ring-indigo-400" : ""}`}
                onClick={() => handleDoneChange(true)}
              >
                {t.qlogDone}
              </button>
              <button
                type="button"
                className={`px-3 py-2 border rounded bg-[var(--bg-1)] transition-colors ${!qlog.done ? "ring-2 ring-indigo-400" : ""}`}
                onClick={() => handleDoneChange(false)}
              >
                {t.qlogNotDone}
              </button>
            </div>
            <input
              className="border p-2 rounded md:col-span-2 bg-[var(--bg-1)]"
              placeholder={t.qlogNotePh}
              value={qlog.note}
              onChange={(e) => handleNoteChange(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onSave}
              disabled={!qlog.habitId}
            >
              {t.qlogSave}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
});

/* =============================================================================
   Main Component
   ========================================================================== */

export default function DashboardMain() {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);
  const loadingStreaks = useRef(false);

  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Redux state
  const { user, loading: authLoading } = useAppSelector((s) => s.auth);
  const habits = useAppSelector((s) => s.habits.items);
  const entries = useAppSelector((s) => s.entries.items);
  const currentHabitId = useAppSelector((s) => s.entries.currentHabitId);

  // Local state
  const [lang, setLang] = useState<Lang>("en");
  const [bootstrapped, setBootstrapped] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [streaks, setStreaks] = useState<Record<string, Streak>>({});

  // UI state
  const [newHabit, setNewHabit] = useState("");
  const [newHabitExtra, setNewHabitExtra] = useState<{
    frequency?: "daily" | "weekly";
    description?: string;
    icon?: string | null;
  }>({
    frequency: "daily",
    description: "",
    icon: null,
  });
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
  const [qlog, setQlog] = useState<{
    habitId: string;
    note: string;
    done: boolean;
  }>({ habitId: "", note: "", done: true });

  // Modals / sheets
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [openAiModal, setOpenAiModal] = useState(false);
  const [openQuickHabit, setOpenQuickHabit] = useState(false);
  const [openProHabit, setOpenProHabit] = useState(false);
  const [openQuickLogPop, setOpenQuickLogPop] = useState(false);
  const [openEntrySheet, setOpenEntrySheet] = useState(false);

  /* ---------------- Effects ---------------- */

  // Mounted
  useEffect(() => setMounted(true), []);

  // Language bootstrap + reflect on <html>
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? ((localStorage.getItem("ms_lang") as Lang | null) ?? "en")
        : "en";
    setLang(saved);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("ms_lang", lang);
    const html = document.documentElement;
    html.lang = lang === "ar" ? "ar" : "en";
    html.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  // Auth init
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    dispatch(meThunk());
  }, [dispatch]);

  // Auth checked
  useEffect(() => {
    if (!authLoading) setAuthChecked(true);
  }, [authLoading]);

  // NOTE: ❌ لا نعمل أي redirect على العميل هنا.
  // الحراسة تُنفَّذ على السيرفر داخل app/dashboard/page.tsx بواسطة redirect().

  // Bootstrap data (habits + entries)
  const initializeDashboard = useCallback(async () => {
    if (!user || !authChecked || bootstrapped || isInitializing) return;
    setIsInitializing(true);
    try {
      await Promise.all([
        dispatch(fetchHabits()),
        dispatch(fetchEntries(undefined)),
      ]);
      setBootstrapped(true);
    } catch (error) {
      console.error("Dashboard initialization error:", error);
    } finally {
      setIsInitializing(false);
    }
  }, [user, authChecked, bootstrapped, isInitializing, dispatch]);
  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  // Load streaks once we have habits
  const loadStreaks = useCallback(async (habitsList: any[]) => {
    if (!habitsList.length || loadingStreaks.current) return;
    loadingStreaks.current = true;
    try {
      const results = await Promise.allSettled(
        habitsList.map((h) => habitsService.getStreak(h.id))
      );
      const newStreaks: Record<string, Streak> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value)
          newStreaks[habitsList[i].id] = r.value;
      });
      setStreaks((prev) => ({ ...prev, ...newStreaks }));
    } catch (error) {
      console.error("Error loading streaks:", error);
    } finally {
      loadingStreaks.current = false;
    }
  }, []);
  useEffect(() => {
    if (habits.length > 0) loadStreaks(habits);
  }, [habits, loadStreaks]);

  // Anti-refresh guards for anchors/buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const a = el.closest<HTMLAnchorElement>('a[href=""], a[href="#"]');
      if (a) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const ensureButtonType = (root: ParentNode) => {
      root
        .querySelectorAll<HTMLButtonElement>("form button:not([type])")
        .forEach((b) => (b.type = "button"));
    };
    ensureButtonType(document);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n instanceof HTMLElement) ensureButtonType(n);
          });
        }
      });
    });
    document.addEventListener("click", handleClick, true);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      document.removeEventListener("click", handleClick, true);
      observer.disconnect();
    };
  }, []);

  /* ---------------- Memo ---------------- */
  const t = useMemo(() => T[lang], [lang]);
  const dir = useMemo(() => (lang === "ar" ? "rtl" : "ltr"), [lang]);
  const locale = useMemo(() => (lang === "ar" ? "ar-EG" : "en-US"), [lang]);
  const hasHabits = useMemo(() => habits.length > 0, [habits.length]);
  const bestHabit = useMemo(
    () => computeBest(habits, entries, streaks),
    [habits, entries, streaks]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );
    const entriesThisWeek = entries.filter(
      (e) => new Date(e.createdAt) >= weekStart
    ).length;

    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const entriesToday = entries.filter((e) => {
      const d = new Date(e.createdAt);
      return d >= dayStart && d < dayEnd;
    }).length;

    return { entriesThisWeek, entriesToday };
  }, [entries]);

  /* ---------------- Handlers ---------------- */
  const goToHabitsTab = useCallback(() => {
    const labels = [T.en.steps.habits, T.ar.steps.habits];
    const btn = Array.from(
      document.querySelectorAll("button,[role='tab']")
    ).find((b: any) => labels.includes((b.textContent || "").trim()));
    (btn as HTMLButtonElement | undefined)?.click();
  }, []);

  const goToReportsTab = useCallback(() => {
    const labels = [T.en.steps.reports, T.ar.steps.reports];
    const btn = Array.from(
      document.querySelectorAll("button,[role='tab']")
    ).find((b: any) => labels.includes((b.textContent || "").trim()));
    (btn as HTMLButtonElement | undefined)?.click();
  }, []);

  const handleQuickLogSave = useCallback(async () => {
    if (!qlog.habitId) return;
    try {
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
    } catch (error) {
      console.error("Quick log save error:", error);
      toast.error(t.checkinErr);
    }
  }, [qlog, dispatch, currentHabitId, t.qlogSaved, t.checkinErr]);

  const handleAddHabit = useCallback(async () => {
    if (!newHabit.trim()) return;
    try {
      await dispatch(
        addHabit({ name: newHabit.trim(), ...newHabitExtra } as any)
      );
      setNewHabit("");
      setNewHabitExtra({ frequency: "daily", description: "", icon: null });
    } catch (error) {
      console.error("Add habit error:", error);
      toast.error("فشل في إضافة العادة");
    }
  }, [newHabit, newHabitExtra, dispatch]);

  const handleSelectHabit = useCallback(
    async (habitId: string) => {
      dispatch(setCurrentHabit(habitId as any));
      await dispatch(fetchEntries({ habitId } as any));
      setEntryForm((f) => ({ ...f, habitId }));

      if (!streaks[habitId]) {
        try {
          const streak = await habitsService.getStreak(habitId);
          setStreaks((prev) => ({ ...prev, [habitId]: streak }));
        } catch (error) {
          console.error("Failed to load streak:", error);
        }
      }
    },
    [dispatch, streaks]
  );

  const handleCheckin = useCallback(
    async (habitId: string) => {
      try {
        const result = await habitsService.checkin(habitId);
        const freshStreak = await habitsService.getStreak(habitId);
        setStreaks((prev) => ({ ...prev, [habitId]: freshStreak }));

        if (currentHabitId)
          await dispatch(fetchEntries({ habitId: currentHabitId } as any));
        else await dispatch(fetchEntries(undefined as any));

        toast.success(t.checkinToast(result.current));
      } catch (error: any) {
        console.error("Checkin error:", error);
        toast.error(error?.data?.error || error?.message || t.checkinErr);
      }
    },
    [dispatch, currentHabitId, t.checkinToast, t.checkinErr]
  );

  const handleEditSave = useCallback(
    async (id: string, name: string) => {
      if (!name.trim()) return;
      try {
        await dispatch(updateHabit({ id, name: name.trim() } as any));
        setEditHabit(null);
      } catch (error) {
        console.error("Edit habit error:", error);
        toast.error("فشل في تحديث العادة");
      }
    },
    [dispatch]
  );

  const handleDeleteHabit = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteHabit(id as any));
        if (currentHabitId === id) {
          dispatch(setCurrentHabit(undefined as any));
          await dispatch(fetchEntries(undefined as any));
        }
      } catch (error) {
        console.error("Delete habit error:", error);
        toast.error("فشل في حذف العادة");
      }
    },
    [dispatch, currentHabitId]
  );

  const handleAddEntry = useCallback(async () => {
    if (!entryForm.habitId) return;
    try {
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
        const streak = await habitsService.getStreak(entryForm.habitId);
        setStreaks((prev) => ({ ...prev, [entryForm.habitId]: streak }));
      } catch (error) {
        console.error("Failed to update streak:", error);
      }
      setEntryForm((f) => ({ ...f, reflection: "" }));
      try {
        window.dispatchEvent(new CustomEvent("ms:entry-added"));
      } catch {}
    } catch (error) {
      console.error("Add entry error:", error);
      toast.error("فشل في إضافة الإدخال");
    }
  }, [entryForm, dispatch, currentHabitId]);

  const handleEditEntry = useCallback(
    async (entry: { id: string; reflection?: string }) => {
      const newText =
        prompt(t.editEntry + ":", entry.reflection || "") ?? undefined;
      if (newText === undefined) return;
      try {
        await dispatch(
          updateEntry({ id: entry.id, data: { reflection: newText } } as any)
        );
        if (currentHabitId)
          await dispatch(fetchEntries({ habitId: currentHabitId } as any));
        else await dispatch(fetchEntries(undefined as any));
      } catch (error) {
        console.error("Edit entry error:", error);
        toast.error("فشل في تحديث الإدخال");
      }
    },
    [dispatch, currentHabitId, t.editEntry]
  );

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteEntry(id as any));
        if (currentHabitId)
          await dispatch(fetchEntries({ habitId: currentHabitId } as any));
        else await dispatch(fetchEntries(undefined as any));
      } catch (error) {
        console.error("Delete entry error:", error);
        toast.error("فشل في حذف الإدخال");
      }
    },
    [dispatch, currentHabitId]
  );

  const handleClearFilter = useCallback(async () => {
    dispatch(setCurrentHabit(undefined as any));
    await dispatch(fetchEntries(undefined as any));
  }, [dispatch]);

  /* ---------------- Steps config ---------------- */
  const steps = useMemo(
    () => [
      {
        id: "intro",
        title: t.steps.intro,
        content: (
          <IntroSection
            lang={lang}
            t={t}
            best={bestHabit}
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
            onAddHabit={handleAddHabit}
            onSelectHabit={handleSelectHabit}
            onCheckin={handleCheckin}
            onEditSave={handleEditSave}
            onDelete={handleDeleteHabit}
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
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onClearFilter={handleClearFilter}
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
      bestHabit,
      habits,
      entries,
      streaks,
      currentHabitId,
      entryForm,
      newHabit,
      newHabitExtra,
      editHabit,
      hasHabits,
      locale,
      handleAddHabit,
      handleSelectHabit,
      handleCheckin,
      handleEditSave,
      handleDeleteHabit,
      handleAddEntry,
      handleEditEntry,
      handleDeleteEntry,
      handleClearFilter,
    ]
  );

  /* ---------------- Render guards ---------------- */
  if (authLoading || (!authChecked && typeof window !== "undefined")) {
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

  /* ---------------- Main ---------------- */
  return (
    <main
      dir={dir}
      className="min-h-screen bg-page text-[var(--ink-1)] pb-28 theme-smooth"
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-r from-indigo-500/10 via-fuchsia-400/10 to-indigo-500/10 blur-2xl hide-in-focus" />
      <ConfettiSuccess />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)]/50 backdrop-blur-xl bg-[var(--bg-0)]/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 md:px-6 flex items-center justify-between py-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--ink-3)] font-medium">
              {t.dash}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-[var(--brand)] to-[var(--brand-accent)] bg-clip-text text-transparent">
              {t.helloTime(
                (user?.email?.split("@")[0] ?? "").replace(/\./g, " "),
                new Date().getHours()
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="input-sm min-w-[120px]"
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
              className="btn-primary-sm"
              onClick={goToHabitsTab}
            >
              <span className="text-base">➕</span>
              {t.addHabit}
            </button>
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm"
              onClick={() => setShowQuickLog(true)}
            >
              <span className="text-base">📝</span>
              {t.quickLog}
            </button>
            <button
              type="button"
              className="btn-ghost px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--error-bg)]"
              onClick={() => dispatch(logoutThunk())}
            >
              <span className="text-base">🚪</span>
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
            onPickHabit={handleSelectHabit}
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
          value={stats.entriesThisWeek}
          sub="📆"
        />
        <AnimatedStatCard
          lang={lang}
          title={t.todayCompletion}
          value={stats.entriesToday}
          sub="⚡"
        />
      </section>

      {/* Today progress bar */}
      <section className="mx-auto max-w-7xl px-3 md:px-6 -mt-1 mb-3 focus-ring">
        <ProgressBarToday
          done={stats.entriesToday}
          total={Math.max(habits.length, 1)}
          label={lang === "ar" ? "إنجاز اليوم" : "Today's progress"}
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
