"use client";

import React from "react";
import { motion } from "framer-motion";

import { useI18n } from "@/components/ui/i18n";
import AiReflectionControls from "@/components/AiReflectionControls";
import StreakMeCard from "@/components/StreakMeCard";
import WeeklyGrouped from "@/components/WeeklyGrouped";
import DailyPromptWidget from "@/components/addons/DailyPromptWidget";
import AIInsightsCard from "@/components/addons/AIInsightsCard";
import BestHabitCard from "@/components/addons/BestHabitCard";
import OnboardingCoach from "@/components/addons/OnboardingCoach";

interface OverviewSectionProps {
  bestHabit?: {
    habit: any;
    weekPoints: number[];
    streak: number;
  } | null;
}

export default function OverviewSection({ bestHabit }: OverviewSectionProps) {
  const { lang } = useI18n();

  return (
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

      {/* Onboarding Coach */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <OnboardingCoach 
          hasHabits={true} // Will be computed from actual data
          hasEntries={true} // Will be computed from actual data
          lang={lang}
        />
      </motion.div>

      {/* Daily Prompt Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <DailyPromptWidget lang={lang} />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Reflection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🧠</span>
            {lang === "ar" ? "تحليل ذكي" : "AI Insights"}
          </h3>
          <AiReflectionControls />
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <StreakMeCard />
        </motion.div>
      </div>

      {/* Best Habit This Week */}
      {bestHabit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <BestHabitCard
            title={bestHabit.habit.name}
            weekPoints={bestHabit.weekPoints}
            streak={bestHabit.streak}
            lang={lang}
          />
        </motion.div>
      )}

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <AIInsightsCard
          lang={lang}
          weeklyAvg={3.5} // Will be computed from actual data
          missedDays={1} // Will be computed from actual data
        />
      </motion.div>

      {/* Weekly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <WeeklyGrouped />
      </motion.div>
    </div>
  );
}