"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { meThunk } from "@/redux/slices/authSlice";
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

import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import NavigationTabs, { type TabId } from "@/features/dashboard/components/NavigationTabs";
import StatsOverview from "@/features/dashboard/components/StatsOverview";
import OverviewSection from "@/features/dashboard/components/OverviewSection";
import HabitsSection from "@/features/dashboard/components/HabitsSection";
import EntriesSection from "@/features/dashboard/components/EntriesSection";
import ReportsSection from "@/features/dashboard/components/ReportsSection";
import LoadingSpinner from "@/features/shared/components/LoadingSpinner";
import ErrorBoundary from "@/features/shared/components/ErrorBoundary";

// Lazy loaded components for better performance
import dynamic from "next/dynamic";
const CommandPalette = dynamic(() => import("@/components/flows/CommandPalette"), { ssr: false });
const QuickAddHabitPopover = dynamic(() => import("@/components/flows/QuickAddHabitPopover"), { ssr: false });
const AddHabitSheet = dynamic(() => import("@/components/flows/AddHabitSheet"), { ssr: false });
const QuickLogPopover = dynamic(() => import("@/components/flows/QuickLogPopover"), { ssr: false });
const EntrySheet = dynamic(() => import("@/components/flows/EntrySheet"), { ssr: false });
const ConfettiSuccess = dynamic(() => import("@/components/addons/ConfettiSuccess"), { ssr: false });

function computeBestHabit(
  habits: any[],
  entries: any[],
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

    let bestHabit: any = null;
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
      if (entry.habitId !== bestHabit.id) return;
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

function DashboardSkeleton() {
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

  // Initialize auth
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    dispatch(meThunk());
  }, [dispatch]);

  // Initialize dashboard data with error handling
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

  // Keyboard shortcuts with useHotkeys
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

  // Handlers with enhanced error handling and user feedback
  const handleAddHabit = useCallback(async (data: any) => {
    try {
      await dispatch(addHabit(data));
      await dispatch(fetchHabits()); // Refresh list
      toast.success(lang === "ar" ? "تم إضافة العادة بنجاح 🎉" : "Habit added successfully 🎉");
      
      // Trigger confetti effect
      window.dispatchEvent(new CustomEvent("ms:entry-added"));
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في إضافة العادة" : "Failed to add habit");
    }
  }, [dispatch, lang]);

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

      // Refresh entries
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

      // Trigger confetti for streak milestones
      if (result.current > 0 && result.current % 7 === 0) {
        window.dispatchEvent(new CustomEvent("ms:entry-added"));
      }
    } catch (error: any) {
      toast.error(error?.message || (lang === "ar" ? "فشل التسجيل" : "Check-in failed"));
    }
  }, [dispatch, currentHabitId, lang]);

  const handleAddEntry = useCallback(async (data: any) => {
    try {
      await dispatch(addEntry(data));
      
      // Refresh entries
      if (currentHabitId) {
        await dispatch(fetchEntries({ habitId: currentHabitId }));
      } else {
        await dispatch(fetchEntries(undefined));
      }
      
      toast.success(lang === "ar" ? "تم إضافة الإدخال ✅" : "Entry added ✅");
      
      // Trigger confetti effect
      window.dispatchEvent(new CustomEvent("ms:entry-added"));
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في إضافة الإدخال" : "Failed to add entry");
    }
  }, [dispatch, currentHabitId, lang]);

  const handleUpdateEntry = useCallback(async (id: string, data: any) => {
    try {
      await dispatch(updateEntry({ id, data }));
      
      // Refresh entries
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
      
      // Refresh entries
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

  // Loading state with skeleton
  if (authLoading || !user) {
    return <DashboardSkeleton />;
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
          <Button onClick={() => window.location.reload()}>
            {lang === "ar" ? "إعادة المحاولة" : "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSection bestHabit={bestHabit} />;
      case "habits":
        return (
          <HabitsSection
            habits={habits}
            streaks={streaks}
            onAddHabit={handleAddHabit}
            onUpdateHabit={handleUpdateHabit}
            onDeleteHabit={handleDeleteHabit}
            onCheckinHabit={handleCheckinHabit}
          />
        );
      case "entries":
        return (
          <EntriesSection
            entries={entries}
            habits={habits}
            currentHabitId={currentHabitId}
            onAddEntry={handleAddEntry}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
            onFilterByHabit={handleFilterByHabit}
          />
        );
      case "reports":
        return <ReportsSection entries={entries} reportData={reportData} />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--bg-0)] page-enter" dir={lang === "ar" ? "rtl" : "ltr"}>
        <ConfettiSuccess />
        
        <DashboardHeader
          onAddHabit={() => setShowProHabit(true)}
          onQuickLog={() => setShowQuickLog(true)}
          onOpenSearch={() => setShowCommandPalette(true)}
        />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview with stagger animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="stagger-children"
          >
            <StatsOverview {...stats} />
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </motion.div>

          {/* Tab Content with smooth transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
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
    </ErrorBoundary>
  );
}