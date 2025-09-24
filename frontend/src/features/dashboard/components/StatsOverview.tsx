"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Target, Flame } from "lucide-react";

import AnimatedStatCard from "@/components/ui/AnimatedStatCard";
import { useI18n } from "@/components/ui/i18n";

interface StatsOverviewProps {
  totalHabits: number;
  entriesThisWeek: number;
  todayCompletion: number;
  currentStreak: number;
}

export default function StatsOverview({
  totalHabits,
  entriesThisWeek,
  todayCompletion,
  currentStreak,
}: StatsOverviewProps) {
  const { lang } = useI18n();

  const stats = [
    {
      title: lang === "ar" ? "العادات النشطة" : "Active Habits",
      value: totalHabits,
      icon: <Target size={20} />,
      color: "text-blue-600",
    },
    {
      title: lang === "ar" ? "إدخالات هذا الأسبوع" : "This Week's Entries",
      value: entriesThisWeek,
      icon: <Calendar size={20} />,
      color: "text-green-600",
    },
    {
      title: lang === "ar" ? "إنجاز اليوم" : "Today's Progress",
      value: `${todayCompletion}%`,
      icon: <TrendingUp size={20} />,
      color: "text-purple-600",
    },
    {
      title: lang === "ar" ? "أطول سلسلة" : "Current Streak",
      value: currentStreak,
      icon: <Flame size={20} />,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <AnimatedStatCard
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            lang={lang}
          />
        </motion.div>
      ))}
    </div>
  );
}