"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Settings, BarChart3, BookOpen, TrendingUp, Filter, Edit2, Trash2, CheckCircle, Calendar, User, LogOut } from "lucide-react";
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
import { groupEntriesDaily, wordsFromNotes } from "@/lib/reporting";
import { useI18n } from "@/components/ui/i18n";
import { useHotkeys } from "@/components/hooks/useHotkeys";
import { formatRelativeTime } from "@/features/shared/utils/formatters";

// Import all the original components
import AiReflectionControls from "@/components/AiReflectionControls";
import StreakMeCard from "@/components/StreakMeCard";
import WeeklyGrouped from "@/components/WeeklyGrouped";
import MonthlySummary from "@/components/MonthlySummary";
import DailyPromptWidget from "@/components/addons/DailyPromptWidget";
import AIInsightsCard from "@/components/addons/AIInsightsCard";
import BestHabitCard from "@/components/addons/BestHabitCard";
import OnboardingCoach from "@/components/addons/OnboardingCoach";
import BadgesRow from "@/components/addons/BadgesRow";
import InsightsPanel from "@/components/addons/InsightsPanel";
import FocusModeToggle from "@/components/addons/FocusModeToggle";
import ProgressLine from "@/components/reports/ProgressLine";
import EntriesHeatmap from "@/components/reports/EntriesHeatmap";
import NotesWordCloud from "@/components/reports/NotesWordCloud";
import ExportPdfButton from "@/components/reports/ExportPdfButton";
import HabitFormExtra, { type HabitExtra } from "@/components/HabitFormExtra";
import HabitFilters, { type HabitFilter } from "@/components/ui/HabitFilters";
import ThemeToggle from "@/components/ui/ThemeToggle";
import MoodMenu from "@/components/mood/MoodMenu";

// Lazy loaded components
import dynamic from "next/dynamic";
const CommandPalette = dynamic(() => import("@/components/flows/CommandPalette"), { ssr: false });
const QuickAddHabitPopover = dynamic(() => import("@/components/flows/QuickAddHabitPopover"), { ssr: false });
const AddHabitSheet = dynamic(() => import("@/components/flows/AddHabitSheet"), { ssr: false });
const QuickLogPopover = dynamic(() => import("@/components/flows/QuickLogPopover"), { ssr: false });
const EntrySheet = dynamic(() => import("@/components/flows/EntrySheet"), { ssr: false });
const ConfettiSuccess = dynamic(() => import("@/components/addons/ConfettiSuccess"), { ssr: false });

type TabId = "overview" | "habits" | "entries" | "reports";

interface Habit {
  id: string;
  name: string;
  icon?: string | null;
  frequency?: "daily" | "weekly";
  description?: string;
}

interface Entry {
  id: string;
  habitId: string;
  mood: string;
  reflection?: string | null;
  createdAt: string;
}

function computeBestHabit(
  habits: Habit[],
  entries: Entry[],
  streaks: Record<string, Streak>
) {
  if (!habits?.length || !entries?.length) return null;

  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const counts = new Map<string, number>();
    entries.forEach((entry) => {
      const entryDate = new Date(entry.createdAt);
      if (entryDate >= weekStart) {
        counts.set(entry.habitId, (counts.get(entry.habitId) || 0) + 1);
      }
    });

    let bestHabit: Habit | null = null;
    let maxCount = -1;
    
    habits.forEach((habit) => {
      const count = counts.get(habit.id) || 0;
      if (count > maxCount) {
        maxCount = count;
        bestHabit = habit;
      }
    });

    if (!bestHabit) return null;

    // Generate week points for sparkline
    const weekPoints = Array(7).fill(0);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    
    entries.forEach((entry) => {
      if (entry.habitId !== bestHabit!.id) return;
      const entryDate = new Date(entry.createdAt);
      if (entryDate < startOfWeek) return;
      const dayIndex = Math.floor((entryDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        weekPoints[dayIndex] += 1;
      }
    });

    return {
      habit: bestHabit,
      weekPoints,
      streak: streaks[bestHabit.id]?.current ?? 0,
    };
  } catch (error) {
    console.error("Error computing best habit:", error);
    return null;
  }
}

function DashboardSkeleton({ lang }: { lang: "en" | "ar" }) {
  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      <div className="h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-[var(--line)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded shimmer" />
          <div className="flex gap-3">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded shimmer" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded shimmer" />
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl shimmer" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl shimmer" />
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl shimmer" />
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { lang } = useI18n();
  const initialized = useRef(false);

  // Redux state
  const { user, loading: authLoading } = useAppSelector((s) => s.auth);
  const habits = useAppSelector((s) => s.habits.items);
  const entries = useAppSelector((s) => s.entries.items);
  const currentHabitId = useAppSelector((s) => s.entries.currentHabitId);

  // Local state
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [streaks, setStreaks] = useState<Record<string, Streak>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Modal states
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickHabit, setShowQuickHabit] = useState(false);
  const [showProHabit, setShowProHabit] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [showEntrySheet, setShowEntrySheet] = useState(false);

  // Form states for habits
  const [newHabit, setNewHabit] = useState("");
  const [newHabitExtra, setNewHabitExtra] = useState<HabitExtra>({
    frequency: "daily",
    description: "",
    icon: null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [habitFilter, setHabitFilter] = useState<HabitFilter>("all");
  const [habitSearchQuery, setHabitSearchQuery] = useState("");

  // Form states for entries
  const [entryForm, setEntryForm] = useState({
    habitId: "",
    mood: "🙂",
    reflection: "",
  });
  const [entrySearchQuery, setEntrySearchQuery] = useState("");

  // Initialize auth
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    dispatch(meThunk());
  }, [dispatch]);

  // Initialize dashboard data
  useEffect(() => {
    if (!user || isInitialized) return;
    
    const initDashboard = async () => {
      try {
        setInitError(null);
        await Promise.all([
          dispatch(fetchHabits()),
          dispatch(fetchEntries(undefined)),
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error("Dashboard initialization error:", error);
        setInitError(error instanceof Error ? error.message : "Failed to load dashboard");
      }
    };

    initDashboard();
  }, [user, dispatch, isInitialized]);

  // Load streaks when habits change
  useEffect(() => {
    if (!habits.length) return;

    const loadStreaks = async () => {
      try {
        const streakPromises = habits.map((habit) =>
          habitsService.getStreak(habit.id).then((streak) => ({ habitId: habit.id, streak }))
        );
        const results = await Promise.allSettled(streakPromises);
        
        const newStreaks: Record<string, Streak> = {};
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            newStreaks[result.value.habitId] = result.value.streak;
          }
        });
        
        setStreaks(newStreaks);
      } catch (error) {
        console.error("Error loading streaks:", error);
      }
    };

    loadStreaks();
  }, [habits]);

  // Keyboard shortcuts
  useHotkeys({
    "mod+k": () => setShowCommandPalette(true),
    "mod+h": () => setShowQuickHabit(true),
    "mod+l": () => setShowQuickLog(true),
    "mod+shift+h": () => setShowProHabit(true),
    "mod+shift+l": () => setShowEntrySheet(true),
    "esc": () => {
      setShowCommandPalette(false);
      setShowQuickHabit(false);
      setShowProHabit(false);
      setShowQuickLog(false);
      setShowEntrySheet(false);
    },
  });

  // Computed values
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const entriesThisWeek = entries.filter(
      (entry) => new Date(entry.createdAt) >= weekStart
    ).length;

    const entriesToday = entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= dayStart && entryDate < dayEnd;
    }).length;

    const todayCompletion = habits.length > 0 
      ? Math.round((entriesToday / habits.length) * 100)
      : 0;

    const currentStreak = Math.max(...Object.values(streaks).map(s => s.current), 0);

    return {
      totalHabits: habits.length,
      entriesThisWeek,
      todayCompletion,
      currentStreak,
    };
  }, [habits, entries, streaks]);

  const bestHabit = useMemo(
    () => computeBestHabit(habits, entries, streaks),
    [habits, entries, streaks]
  );

  const reportData = useMemo(() => ({
    line: groupEntriesDaily(entries),
    heat: groupEntriesDaily(entries),
    words: wordsFromNotes(entries),
  }), [entries]);

  // Handlers
  const handleAddHabit = useCallback(async () => {
    if (!newHabit.trim()) return;
    try {
      await dispatch(addHabit({ name: newHabit.trim(), ...newHabitExtra }));
      await dispatch(fetchHabits());
      toast.success(lang === "ar" ? "تم إضافة العادة بنجاح 🎉" : "Habit added successfully 🎉");
      setNewHabit("");
      setNewHabitExtra({ frequency: "daily", description: "", icon: null });
      window.dispatchEvent(new CustomEvent("ms:entry-added"));
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في إضافة العادة" : "Failed to add habit");
    }
  }, [dispatch, newHabit, newHabitExtra, lang]);

  const handleUpdateHabit = useCallback(async (id: string, name: string) => {
    try {
      await dispatch(updateHabit({ id, name }));
      toast.success(lang === "ar" ? "تم تحديث العادة ✅" : "Habit updated ✅");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في تحديث العادة" : "Failed to update habit");
    }
  }, [dispatch, lang]);

  const handleDeleteHabit = useCallback(async (id: string) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف هذه العادة؟" : "Are you sure you want to delete this habit?")) {
      return;
    }

    try {
      await dispatch(deleteHabit(id));
      if (currentHabitId === id) {
        dispatch(setCurrentHabit(undefined));
        await dispatch(fetchEntries(undefined));
      }
      toast.success(lang === "ar" ? "تم حذف العادة" : "Habit deleted");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في حذف العادة" : "Failed to delete habit");
    }
  }, [dispatch, currentHabitId, lang]);

  const handleCheckinHabit = useCallback(async (habitId: string) => {
    try {
      const result = await habitsService.checkin(habitId);
      const freshStreak = await habitsService.getStreak(habitId);
      setStreaks((prev) => ({ ...prev, [habitId]: freshStreak }));

      if (currentHabitId) {
        await dispatch(fetchEntries({ habitId: currentHabitId }));
      } else {
        await dispatch(fetchEntries(undefined));
      }

      toast.success(
        lang === "ar" 
          ? `تم التسجيل ✅ — السلسلة الحالية: ${result.current} 🔥`
          : `Checked in ✅ — Current streak: ${result.current} 🔥`
      );

      if (result.current > 0 && result.current % 7 === 0) {
        window.dispatchEvent(new CustomEvent("ms:entry-added"));
      }
    } catch (error: any) {
      toast.error(error?.message || (lang === "ar" ? "فشل التسجيل" : "Check-in failed"));
    }
  }, [dispatch, currentHabitId, lang]);

  const handleAddEntry = useCallback(async () => {
    if (!entryForm.habitId) return;
    try {
      await dispatch(addEntry(entryForm));
      
      if (currentHabitId) {
        await dispatch(fetchEntries({ habitId: currentHabitId }));
      } else {
        await dispatch(fetchEntries(undefined));
      }
      
      toast.success(lang === "ar" ? "تم إضافة الإدخال ✅" : "Entry added ✅");
      setEntryForm({ habitId: "", mood: "🙂", reflection: "" });
      window.dispatchEvent(new CustomEvent("ms:entry-added"));
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في إضافة الإدخال" : "Failed to add entry");
    }
  }, [dispatch, entryForm, currentHabitId, lang]);

  const handleUpdateEntry = useCallback(async (id: string, data: any) => {
    try {
      await dispatch(updateEntry({ id, data }));
      
      if (currentHabitId) {
        await dispatch(fetchEntries({ habitId: currentHabitId }));
      } else {
        await dispatch(fetchEntries(undefined));
      }
      
      toast.success(lang === "ar" ? "تم تحديث الإدخال ✅" : "Entry updated ✅");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في تحديث الإدخال" : "Failed to update entry");
    }
  }, [dispatch, currentHabitId, lang]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا الإدخال؟" : "Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await dispatch(deleteEntry(id));
      
      if (currentHabitId) {
        await dispatch(fetchEntries({ habitId: currentHabitId }));
      } else {
        await dispatch(fetchEntries(undefined));
      }
      
      toast.success(lang === "ar" ? "تم حذف الإدخال" : "Entry deleted");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في حذف الإدخال" : "Failed to delete entry");
    }
  }, [dispatch, currentHabitId, lang]);

  const handleFilterByHabit = useCallback(async (habitId: string | null) => {
    dispatch(setCurrentHabit(habitId));
    if (habitId) {
      await dispatch(fetchEntries({ habitId }));
    } else {
      await dispatch(fetchEntries(undefined));
    }
  }, [dispatch]);

  const handleEditEntry = async (entry: Entry) => {
    const newReflection = prompt(lang === "ar" ? "تعديل" : "Edit", entry.reflection || "");
    if (newReflection !== null) {
      await handleUpdateEntry(entry.id, { reflection: newReflection });
    }
  };

  // Filter habits
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(habitSearchQuery.toLowerCase());
    const matchesFilter = 
      habitFilter === "all" ||
      (habitFilter === "daily" && habit.frequency === "daily") ||
      (habitFilter === "weekly" && habit.frequency === "weekly") ||
      (habitFilter === "archived" && false);
    
    return matchesSearch && matchesFilter;
  });

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const habit = habits.find(h => h.id === entry.habitId);
    const habitName = habit?.name || "";
    const reflection = entry.reflection || "";
    
    return (
      habitName.toLowerCase().includes(entrySearchQuery.toLowerCase()) ||
      reflection.toLowerCase().includes(entrySearchQuery.toLowerCase()) ||
      entry.mood.includes(entrySearchQuery)
    );
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.email?.split("@")[0]?.replace(/\./g, " ") || "friend";
    
    if (lang === "ar") {
      return hour < 12 ? `صباح الخير، ${name}` : `مساء الخير، ${name}`;
    }
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const labels = {
    dashboard: lang === "ar" ? "لوحة التحكم" : "Dashboard",
    addHabit: lang === "ar" ? "إضافة عادة" : "Add Habit",
    quickLog: lang === "ar" ? "تسجيل سريع" : "Quick Log",
    search: lang === "ar" ? "بحث" : "Search",
    logout: lang === "ar" ? "تسجيل الخروج" : "Logout",
    language: lang === "ar" ? "اللغة" : "Language",
    searchPlaceholder: lang === "ar" ? "ابحث عن عادة أو تقرير..." : "Search habits or reports...",
    
    // Tabs
    overview: lang === "ar" ? "نظرة عامة" : "Overview",
    habits: lang === "ar" ? "العادات" : "Habits",
    entries: lang === "ar" ? "الإدخالات" : "Entries",
    reports: lang === "ar" ? "التقارير" : "Reports",

    // Stats
    totalHabits: lang === "ar" ? "العادات النشطة" : "Active Habits",
    entriesThisWeek: lang === "ar" ? "إدخالات هذا الأسبوع" : "This Week's Entries",
    todayProgress: lang === "ar" ? "إنجاز اليوم" : "Today's Progress",
    currentStreak: lang === "ar" ? "أطول سلسلة" : "Current Streak",
    days: lang === "ar" ? "أيام" : "days",

    // Habits
    addNewHabit: lang === "ar" ? "إضافة عادة جديدة" : "Add New Habit",
    habitName: lang === "ar" ? "اسم العادة" : "Habit Name",
    add: lang === "ar" ? "إضافة" : "Add",
    save: lang === "ar" ? "حفظ" : "Save",
    cancel: lang === "ar" ? "إلغاء" : "Cancel",
    edit: lang === "ar" ? "تعديل" : "Edit",
    delete: lang === "ar" ? "حذف" : "Delete",
    markDone: lang === "ar" ? "تم اليوم" : "Mark Done",
    streak: lang === "ar" ? "سلسلة" : "Streak",
    noHabits: lang === "ar" ? "لا توجد عادات بعد" : "No habits yet",
    addFirst: lang === "ar" ? "أضف عادتك الأولى للبدء" : "Add your first habit to get started",
    searchHabits: lang === "ar" ? "ابحث في العادات..." : "Search habits...",
    filters: lang === "ar" ? "فلاتر" : "Filters",

    // Entries
    addNewEntry: lang === "ar" ? "إضافة إدخال جديد" : "Add New Entry",
    chooseHabit: lang === "ar" ? "اختر عادة" : "Choose Habit",
    mood: lang === "ar" ? "المزاج" : "Mood",
    reflection: lang === "ar" ? "التأمل (اختياري)" : "Reflection (optional)",
    noEntries: lang === "ar" ? "لا توجد إدخالات بعد" : "No entries yet",
    addFirstEntry: lang === "ar" ? "أضف إدخالك الأول" : "Add your first entry",
    searchEntries: lang === "ar" ? "ابحث في الإدخالات..." : "Search entries...",
    allHabits: lang === "ar" ? "جميع العادات" : "All Habits",
    clearFilter: lang === "ar" ? "إزالة الفلتر" : "Clear Filter",

    // Reports
    reportsTitle: lang === "ar" ? "التقارير والتحليلات" : "Reports & Analytics",
    reportsSubtitle: lang === "ar" ? "تحليل شامل لتقدمك" : "Comprehensive analysis of your progress",
    export: lang === "ar" ? "تصدير PDF" : "Export PDF",
    dailyProgress: lang === "ar" ? "التقدم اليومي" : "Daily Progress",
    activityHeatmap: lang === "ar" ? "خريطة النشاط" : "Activity Heatmap",
    wordCloud: lang === "ar" ? "سحابة الكلمات" : "Word Cloud",
    insights: lang === "ar" ? "رؤى ذكية" : "Smart Insights",
  };

  // Loading state
  if (authLoading || !user) {
    return <DashboardSkeleton lang={lang} />;
  }

  // Error state
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-0)]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">
            {lang === "ar" ? "خطأ في التحميل" : "Loading Error"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {initError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            {lang === "ar" ? "إعادة المحاولة" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  const moods = ["🙂", "😐", "😢", "😡", "😴", "🎉", "💪", "🧠", "❤️"];

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180);

  return (
    <div className="min-h-screen bg-[var(--bg-0)] page-enter" dir={lang === "ar" ? "rtl" : "ltr"}>
      <ConfettiSuccess />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-[var(--line)] backdrop-blur-xl bg-[var(--bg-0)]/80"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Greeting */}
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  MindSync
                </h1>
              </motion.div>
              <div className="hidden md:block">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getGreeting()}
                </p>
              </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-lg mx-8">
              <motion.button
                onClick={() => setShowCommandPalette(true)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Search size={16} />
                <span className="text-sm flex-1">
                  {labels.searchPlaceholder}
                </span>
                <div className="ml-auto">
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">
                    ⌘K
                  </kbd>
                </div>
              </motion.button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowQuickLog(true)}
                className="btn-secondary hidden sm:inline-flex"
              >
                <Plus size={16} className="mr-2" />
                {labels.quickLog}
              </button>
              
              <button
                onClick={() => setShowProHabit(true)}
                className="btn-primary"
              >
                <Plus size={16} className="mr-2" />
                <span className="hidden sm:inline">{labels.addHabit}</span>
                <span className="sm:hidden">Add</span>
              </button>

              <FocusModeToggle lang={lang} />
              <MoodMenu />

              <select
                value={lang}
                onChange={(e) => {
                  const { setLang } = require("@/components/ui/i18n");
                  setLang(e.target.value as "en" | "ar");
                }}
                className="px-3 py-1.5 rounded-lg border bg-[var(--bg-1)] text-sm hidden md:block"
                title={labels.language}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>

              <ThemeToggle lang={lang} />

              <div className="relative group">
                <motion.button
                  onClick={() => dispatch(logoutThunk())}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={labels.logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User size={18} />
                </motion.button>
                
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {labels.logout}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="stagger-children mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: labels.totalHabits, value: stats.totalHabits, icon: "🎯" },
              { title: labels.entriesThisWeek, value: stats.entriesThisWeek, icon: "📅" },
              { title: labels.todayProgress, value: `${stats.todayCompletion}%`, icon: "📈" },
              { title: labels.currentStreak, value: stats.currentStreak, sub: labels.days, icon: "🔥" },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className="stats-card"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{stat.icon}</div>
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-70">
                      {stat.title}
                    </div>
                    <div className="text-3xl font-extrabold leading-none">{stat.value}</div>
                    {stat.sub && <div className="text-sm opacity-80 mt-0.5">{stat.sub}</div>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border-b border-[var(--line)] mb-8"
        >
          <nav className="flex space-x-8 overflow-x-auto scrollbar-none" aria-label="Tabs">
            {[
              { id: "overview" as TabId, label: labels.overview, icon: <BarChart3 size={18} /> },
              { id: "habits" as TabId, label: labels.habits, icon: <Plus size={18} /> },
              { id: "entries" as TabId, label: labels.entries, icon: <BookOpen size={18} /> },
              { id: "reports" as TabId, label: labels.reports, icon: <TrendingUp size={18} /> },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ 
                      scale: activeTab === tab.id ? 1.1 : 1,
                      color: activeTab === tab.id ? "var(--brand)" : "currentColor"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {tab.icon}
                  </motion.div>
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Welcome Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-800/50"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {lang === "ar" ? "مرحباً بك في رحلتك" : "Welcome to your journey"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {lang === "ar"
                      ? "MindSync يساعدك على بناء عادات صحية وتتبع تقدمك اليومي مع رؤى ذكية."
                      : "MindSync helps you build healthy habits and track your daily progress with smart insights."
                    }
                  </p>
                </motion.div>

                <OnboardingCoach 
                  hasHabits={habits.length > 0} 
                  hasEntries={entries.length > 0} 
                  lang={lang}
                />

                <DailyPromptWidget lang={lang} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <span className="mr-2">🧠</span>
                      {lang === "ar" ? "تحليل ذكي" : "AI Insights"}
                    </h3>
                    <AiReflectionControls />
                  </div>

                  <StreakMeCard />
                </div>

                {bestHabit && (
                  <BestHabitCard
                    title={bestHabit.habit.name}
                    weekPoints={bestHabit.weekPoints}
                    streak={bestHabit.streak}
                    lang={lang}
                  />
                )}

                <AIInsightsCard
                  lang={lang}
                  weeklyAvg={3.5}
                  missedDays={1}
                />

                <WeeklyGrouped />
              </div>
            )}

            {activeTab === "habits" && (
              <div className="space-y-6">
                {/* Add Habit Form */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">➕</span>
                    {labels.addNewHabit}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        placeholder={labels.habitName}
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        className="input flex-1"
                      />
                      <button 
                        onClick={handleAddHabit} 
                        disabled={!newHabit.trim()}
                        className="btn-primary"
                      >
                        {labels.add}
                      </button>
                    </div>
                    
                    <HabitFormExtra
                      value={newHabitExtra}
                      onChange={setNewHabitExtra}
                      lang={lang}
                    />
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-1">
                      <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          placeholder={labels.searchHabits}
                          value={habitSearchQuery}
                          onChange={(e) => setHabitSearchQuery(e.target.value)}
                          className="input pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{labels.filters}:</span>
                      <HabitFilters
                        value={habitFilter}
                        onChange={setHabitFilter}
                        lang={lang}
                      />
                    </div>
                  </div>
                </div>

                {/* Habits List */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredHabits.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700"
                      >
                        <div className="text-4xl mb-4">🌱</div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {habitSearchQuery ? (lang === "ar" ? "لا توجد نتائج" : "No results found") : labels.noHabits}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {habitSearchQuery 
                            ? (lang === "ar" ? "جرب مصطلح بحث آخر" : "Try a different search term")
                            : labels.addFirst
                          }
                        </p>
                      </motion.div>
                    ) : (
                      filteredHabits.map((habit, index) => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 100
                          }}
                          className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-4 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          {editingId === habit.id ? (
                            <div className="flex items-center gap-3">
                              <input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="input flex-1"
                                autoFocus
                              />
                              <button 
                                onClick={async () => {
                                  if (editingName.trim()) {
                                    await handleUpdateHabit(editingId, editingName.trim());
                                    setEditingId(null);
                                    setEditingName("");
                                  }
                                }}
                                className="btn-primary"
                              >
                                {labels.save}
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingName("");
                                }}
                                className="btn-secondary"
                              >
                                {labels.cancel}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <motion.div 
                                    className="text-2xl"
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    {habit.icon || "📌"}
                                  </motion.div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {habit.name}
                                    </h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                      <span>
                                        🔥 {streaks[habit.id]?.current || 0} {labels.days}
                                      </span>
                                      <span>•</span>
                                      <span className="capitalize">
                                        {habit.frequency === "weekly" 
                                          ? (lang === "ar" ? "أسبوعي" : "Weekly")
                                          : (lang === "ar" ? "يومي" : "Daily")
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleCheckinHabit(habit.id)}
                                    className="btn-success"
                                  >
                                    <CheckCircle size={16} className="mr-1" />
                                    <span className="hidden sm:inline">{labels.markDone}</span>
                                    <span className="sm:hidden">✓</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setEditingId(habit.id);
                                      setEditingName(habit.name);
                                    }}
                                    className="btn-secondary"
                                  >
                                    <Edit2 size={16} className="mr-1" />
                                    <span className="hidden sm:inline">{labels.edit}</span>
                                    <span className="sm:hidden">✏️</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteHabit(habit.id)}
                                    className="btn-danger"
                                  >
                                    <Trash2 size={16} className="mr-1" />
                                    <span className="hidden sm:inline">{labels.delete}</span>
                                    <span className="sm:hidden">🗑️</span>
                                  </button>
                                </div>
                              </div>

                              {habit.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 pl-11">
                                  {habit.description}
                                </p>
                              )}

                              <div className="pl-11">
                                <BadgesRow
                                  lang={lang}
                                  streak={streaks[habit.id]?.current || 0}
                                  weekCount={5}
                                  consistency={85}
                                />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === "entries" && (
              <div className="space-y-6">
                {/* Add Entry Form */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    {labels.addNewEntry}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                      className="input"
                      value={entryForm.habitId}
                      onChange={(e) => setEntryForm({ ...entryForm, habitId: e.target.value })}
                    >
                      <option value="">{labels.chooseHabit}</option>
                      {habits.map((habit) => (
                        <option key={habit.id} value={habit.id}>
                          {habit.icon} {habit.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="input"
                      value={entryForm.mood}
                      onChange={(e) => setEntryForm({ ...entryForm, mood: e.target.value })}
                    >
                      {moods.map((mood) => (
                        <option key={mood} value={mood}>
                          {mood}
                        </option>
                      ))}
                    </select>

                    <input
                      placeholder={labels.reflection}
                      value={entryForm.reflection}
                      onChange={(e) => setEntryForm({ ...entryForm, reflection: e.target.value })}
                      className="input"
                    />

                    <button 
                      onClick={handleAddEntry} 
                      disabled={!entryForm.habitId}
                      className="btn-primary"
                    >
                      {labels.add}
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-1">
                      <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          placeholder={labels.searchEntries}
                          value={entrySearchQuery}
                          onChange={(e) => setEntrySearchQuery(e.target.value)}
                          className="input pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        className="input w-auto"
                        value={currentHabitId || ""}
                        onChange={(e) => handleFilterByHabit(e.target.value || null)}
                      >
                        <option value="">{labels.allHabits}</option>
                        {habits.map((habit) => (
                          <option key={habit.id} value={habit.id}>
                            {habit.icon} {habit.name}
                          </option>
                        ))}
                      </select>
                      {currentHabitId && (
                        <button
                          onClick={() => handleFilterByHabit(null)}
                          className="btn-secondary"
                        >
                          {labels.clearFilter}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Entries List */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredEntries.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700"
                      >
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {entrySearchQuery ? (lang === "ar" ? "لا توجد نتائج" : "No results found") : labels.noEntries}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {entrySearchQuery 
                            ? (lang === "ar" ? "جرب مصطلح بحث آخر" : "Try a different search term")
                            : labels.addFirstEntry
                          }
                        </p>
                      </motion.div>
                    ) : (
                      filteredEntries.map((entry, index) => {
                        const habit = habits.find(h => h.id === entry.habitId);
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: index * 0.05,
                              type: "spring",
                              stiffness: 100
                            }}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-[var(--line)] p-4 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xl">{entry.mood}</span>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {habit?.icon} {habit?.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    <Calendar size={12} className="inline mr-1" />
                                    {formatRelativeTime(entry.createdAt, lang)}
                                  </span>
                                </div>
                                {entry.reflection && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-7">
                                    {entry.reflection}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleEditEntry(entry)}
                                  className="btn-secondary"
                                >
                                  <Edit2 size={14} className="mr-1" />
                                  <span className="hidden sm:inline">{labels.edit}</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  className="btn-danger"
                                >
                                  <Trash2 size={14} className="mr-1" />
                                  <span className="hidden sm:inline">{labels.delete}</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {labels.reportsTitle}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {labels.reportsSubtitle}
                    </p>
                  </div>
                  <ExportPdfButton targetId="reports-container" lang={lang} />
                </div>

                <InsightsPanel
                  entries={entries}
                  habits={habits}
                  lang={lang}
                />

                <div id="reports-container" className="space-y-6">
                  <ProgressLine
                    data={reportData.line}
                    title={labels.dailyProgress}
                    lang={lang}
                  />

                  <EntriesHeatmap
                    values={reportData.heat}
                    startDate={start}
                    endDate={end}
                    title={labels.activityHeatmap}
                    lang={lang}
                  />

                  <NotesWordCloud
                    words={reportData.words}
                    title={labels.wordCloud}
                    lang={lang}
                  />

                  <MonthlySummary />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals and Sheets */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onQuickHabit={() => {
          setShowCommandPalette(false);
          setShowQuickHabit(true);
        }}
        onProHabit={() => {
          setShowCommandPalette(false);
          setShowProHabit(true);
        }}
        onQuickLog={() => {
          setShowCommandPalette(false);
          setShowQuickLog(true);
        }}
        onProEntry={() => {
          setShowCommandPalette(false);
          setShowEntrySheet(true);
        }}
      />

      <QuickAddHabitPopover
        open={showQuickHabit}
        onOpenChange={setShowQuickHabit}
        onAdvanced={() => {
          setShowQuickHabit(false);
          setShowProHabit(true);
        }}
      />

      <AddHabitSheet
        open={showProHabit}
        onOpenChange={setShowProHabit}
      />

      <QuickLogPopover
        open={showQuickLog}
        onOpenChange={setShowQuickLog}
      />

      <EntrySheet
        open={showEntrySheet}
        onOpenChange={setShowEntrySheet}
      />
    </div>
  );
}