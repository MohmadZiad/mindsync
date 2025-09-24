"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import NavigationTabs, { type TabId } from "@/features/dashboard/components/NavigationTabs";
import StatsOverview from "@/features/dashboard/components/StatsOverview";
import OverviewSection from "@/features/dashboard/components/OverviewSection";
import HabitsSection from "@/features/dashboard/components/HabitsSection";
import EntriesSection from "@/features/dashboard/components/EntriesSection";
import ReportsSection from "@/features/dashboard/components/ReportsSection";

// Lazy loaded components
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

  // Initialize dashboard data
  useEffect(() => {
    if (!user || isInitialized) return;
    
    const initDashboard = async () => {
      try {
        await Promise.all([
          dispatch(fetchHabits()),
          dispatch(fetchEntries(undefined)),
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error("Dashboard initialization error:", error);
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
  const handleAddHabit = useCallback(async (data: any) => {
    try {
      await dispatch(addHabit(data));
      toast.success(lang === "ar" ? "تم إضافة العادة بنجاح" : "Habit added successfully");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في إضافة العادة" : "Failed to add habit");
    }
  }, [dispatch, lang]);

  const handleUpdateHabit = useCallback(async (id: string, name: string) => {
    try {
      await dispatch(updateHabit({ id, name } as any));
      toast.success(lang === "ar" ? "تم تحديث العادة" : "Habit updated");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في تحديث العادة" : "Failed to update habit");
    }
  }, [dispatch, lang]);

  const handleDeleteHabit = useCallback(async (id: string) => {
    try {
      await dispatch(deleteHabit(id as any));
      if (currentHabitId === id) {
        dispatch(setCurrentHabit(undefined as any));
        await dispatch(fetchEntries(undefined as any));
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
        await dispatch(fetchEntries({ habitId: currentHabitId } as any));
      } else {
        await dispatch(fetchEntries(undefined as any));
      }

      toast.success(
        lang === "ar" 
          ? `تم التسجيل ✅ — السلسلة الحالية: ${result.current} 🔥`
          : `Checked in ✅ — Current streak: ${result.current} 🔥`
      );
    } catch (error: any) {
      toast.error(error?.message || (lang === "ar" ? "فشل التسجيل" : "Check-in failed"));
    }
  }, [dispatch, currentHabitId, lang]);

  const handleAddEntry = useCallback(async (data: any) => {
    try {
      await dispatch(addEntry(data));
      if (currentHabitId) {
        await dispatch(fetchEntries({ habitId: currentHabitId } as any));
      } else {
        await dispatch(fetchEntries(undefined as any));
      }
      toast.success(lang === "ar" ? "تم إضافة الإدخال" : "Entry added");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في إضافة الإدخال" : "Failed to add entry");
    }
  }, [dispatch, currentHabitId, lang]);

  const handleUpdateEntry = useCallback(async (id: string, data: any) => {
    try {
      await dispatch(updateEntry({ id, data } as any));
      if (currentHabitId) {
        await dispatch(fetchEntries({ habitId: currentHabitId } as any));
      } else {
        await dispatch(fetchEntries(undefined as any));
      }
      toast.success(lang === "ar" ? "تم تحديث الإدخال" : "Entry updated");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في تحديث الإدخال" : "Failed to update entry");
    }
  }, [dispatch, currentHabitId, lang]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    try {
      await dispatch(deleteEntry(id as any));
      if (currentHabitId) {
        await dispatch(fetchEntries({ habitId: currentHabitId } as any));
      } else {
        await dispatch(fetchEntries(undefined as any));
      }
      toast.success(lang === "ar" ? "تم حذف الإدخال" : "Entry deleted");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في حذف الإدخال" : "Failed to delete entry");
    }
  }, [dispatch, currentHabitId, lang]);

  const handleFilterByHabit = useCallback(async (habitId: string | null) => {
    dispatch(setCurrentHabit(habitId as any));
    if (habitId) {
      await dispatch(fetchEntries({ habitId } as any));
    } else {
      await dispatch(fetchEntries(undefined as any));
    }
  }, [dispatch]);

  // Loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {lang === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
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
    <div className="min-h-screen bg-[var(--bg-0)]" dir={lang === "ar" ? "rtl" : "ltr"}>
      <ConfettiSuccess />
      
      <DashboardHeader
        onAddHabit={() => setShowProHabit(true)}
        onQuickLog={() => setShowQuickLog(true)}
        onOpenSearch={() => setShowCommandPalette(true)}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <StatsOverview {...stats} />

        {/* Navigation */}
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
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
        onQuickHabit={() => setShowQuickHabit(true)}
        onProHabit={() => setShowProHabit(true)}
        onQuickLog={() => setShowQuickLog(true)}
        onProEntry={() => setShowEntrySheet(true)}
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