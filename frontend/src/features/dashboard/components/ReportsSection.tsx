"use client";

import React from "react";
import { motion } from "framer-motion";

import { useI18n } from "@/components/ui/i18n";
import ProgressLine from "@/components/reports/ProgressLine";
import EntriesHeatmap from "@/components/reports/EntriesHeatmap";
import NotesWordCloud from "@/components/reports/NotesWordCloud";
import ExportPdfButton from "@/components/reports/ExportPdfButton";
import MonthlySummary from "@/components/MonthlySummary";
import InsightsPanel from "@/components/addons/InsightsPanel";

interface ReportsSectionProps {
  entries: any[];
  reportData: {
    line: any[];
    heat: any[];
    words: { text: string; value: number }[];
  };
}

export default function ReportsSection({ entries, reportData }: ReportsSectionProps) {
  const { lang } = useI18n();

  const labels = {
    title: lang === "ar" ? "التقارير والتحليلات" : "Reports & Analytics",
    subtitle: lang === "ar" ? "تحليل شامل لتقدمك" : "Comprehensive analysis of your progress",
    export: lang === "ar" ? "تصدير PDF" : "Export PDF",
    dailyProgress: lang === "ar" ? "التقدم اليومي" : "Daily Progress",
    activityHeatmap: lang === "ar" ? "خريطة النشاط" : "Activity Heatmap",
    wordCloud: lang === "ar" ? "سحابة الكلمات" : "Word Cloud",
    insights: lang === "ar" ? "رؤى ذكية" : "Smart Insights",
  };

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {labels.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {labels.subtitle}
          </p>
        </div>
        <ExportPdfButton targetId="reports-container" lang={lang} />
      </motion.div>

      {/* Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <InsightsPanel
          entries={entries}
          habits={[]} // Will be passed from parent
          lang={lang}
        />
      </motion.div>

      {/* Reports Grid */}
      <div id="reports-container" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ProgressLine
            data={reportData.line}
            title={labels.dailyProgress}
            lang={lang}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <EntriesHeatmap
            values={reportData.heat}
            startDate={start}
            endDate={end}
            title={labels.activityHeatmap}
            lang={lang}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <NotesWordCloud
            words={reportData.words}
            title={labels.wordCloud}
            lang={lang}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <MonthlySummary />
        </motion.div>
      </div>
    </div>
  );
}