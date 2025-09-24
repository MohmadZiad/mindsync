"use client";

import React from "react";
import { motion } from "framer-motion";

import { useI18n } from "@/components/ui/i18n";
import AiReflectionControls from "@/components/AiReflectionControls";
import StreakMeCard from "@/components/StreakMeCard";
import WeeklyGrouped from "@/components/WeeklyGrouped";

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Reflection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
          transition={{ duration: 0.5, delay: 0.2 }}
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
          className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            {lang === "ar" ? "أفضل عادة هذا الأسبوع" : "Best Habit This Week"}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-lg">
                {bestHabit.habit.icon} {bestHabit.habit.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                🔥 {lang === "ar" ? `سلسلة: ${bestHabit.streak}` : `Streak: ${bestHabit.streak}`}
              </div>
            </div>
            <div className="flex items-end space-x-1 h-12">
              {bestHabit.weekPoints.map((point, i) => (
                <div
                  key={i}
                  className="w-6 bg-indigo-400/60 rounded-t"
                  style={{ height: `${Math.max(8, point * 8)}px` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

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