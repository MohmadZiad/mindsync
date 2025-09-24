"use client";

import React from "react";
import { motion } from "framer-motion";
import { LogOut, Settings, Plus, Search } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutThunk } from "@/redux/slices/authSlice";
import { useI18n } from "@/components/ui/i18n";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

interface DashboardHeaderProps {
  onAddHabit: () => void;
  onQuickLog: () => void;
  onOpenSearch: () => void;
}

export default function DashboardHeader({
  onAddHabit,
  onQuickLog,
  onOpenSearch,
}: DashboardHeaderProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { lang, setLang } = useI18n();

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
    settings: lang === "ar" ? "الإعدادات" : "Settings",
    logout: lang === "ar" ? "تسجيل الخروج" : "Logout",
    language: lang === "ar" ? "اللغة" : "Language",
  };

  return (
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
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MindSync
              </h1>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getGreeting()}
              </p>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-lg mx-8">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Search size={16} />
              <span className="text-sm">
                {lang === "ar" ? "ابحث عن عادة أو تقرير..." : "Search habits or reports..."}
              </span>
              <div className="ml-auto">
                <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onQuickLog}
              leftIcon={<Plus size={16} />}
            >
              {labels.quickLog}
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={onAddHabit}
              leftIcon={<Plus size={16} />}
            >
              {labels.addHabit}
            </Button>

            {/* Language Toggle */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "ar")}
              className="px-3 py-1.5 rounded-lg border bg-[var(--bg-1)] text-sm"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>

            <ThemeToggle lang={lang} />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => dispatch(logoutThunk())}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={labels.logout}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}