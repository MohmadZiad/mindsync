"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Plus, TrendingUp } from "lucide-react";

import { useI18n } from "@/components/ui/i18n";

export type TabId = "overview" | "habits" | "entries" | "reports";

interface NavigationTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const { lang } = useI18n();

  const tabs = [
    {
      id: "overview" as TabId,
      label: lang === "ar" ? "نظرة عامة" : "Overview",
      icon: <BarChart3 size={18} />,
    },
    {
      id: "habits" as TabId,
      label: lang === "ar" ? "العادات" : "Habits",
      icon: <Plus size={18} />,
    },
    {
      id: "entries" as TabId,
      label: lang === "ar" ? "الإدخالات" : "Entries",
      icon: <BookOpen size={18} />,
    },
    {
      id: "reports" as TabId,
      label: lang === "ar" ? "التقارير" : "Reports",
      icon: <TrendingUp size={18} />,
    },
  ];

  return (
    <div className="border-b border-[var(--line)] mb-8">
      <nav className="flex space-x-8 overflow-x-auto scrollbar-none" aria-label="Tabs">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
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
    </div>
  );
}