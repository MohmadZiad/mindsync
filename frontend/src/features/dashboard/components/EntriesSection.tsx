"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, Filter, Calendar } from "lucide-react";

import { useI18n } from "@/components/ui/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatRelativeTime } from "@/features/shared/utils/formatters";

interface Entry {
  id: string;
  habitId: string;
  mood: string;
  reflection?: string | null;
  createdAt: string;
}

interface Habit {
  id: string;
  name: string;
  icon?: string | null;
}

interface EntriesSectionProps {
  entries: Entry[];
  habits: Habit[];
  currentHabitId?: string | null;
  onAddEntry: (data: { habitId: string; mood: string; reflection?: string }) => Promise<void>;
  onUpdateEntry: (id: string, data: { reflection?: string }) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onFilterByHabit: (habitId: string | null) => void;
}

export default function EntriesSection({
  entries,
  habits,
  currentHabitId,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onFilterByHabit,
}: EntriesSectionProps) {
  const { lang } = useI18n();
  
  const [entryForm, setEntryForm] = useState({
    habitId: "",
    mood: "🙂",
    reflection: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const labels = {
    addEntry: lang === "ar" ? "إضافة إدخال جديد" : "Add New Entry",
    chooseHabit: lang === "ar" ? "اختر عادة" : "Choose Habit",
    mood: lang === "ar" ? "المزاج" : "Mood",
    reflection: lang === "ar" ? "التأمل (اختياري)" : "Reflection (optional)",
    add: lang === "ar" ? "إضافة" : "Add",
    edit: lang === "ar" ? "تعديل" : "Edit",
    delete: lang === "ar" ? "حذف" : "Delete",
    filter: lang === "ar" ? "فلترة" : "Filter",
    clearFilter: lang === "ar" ? "إزالة الفلتر" : "Clear Filter",
    noEntries: lang === "ar" ? "لا توجد إدخالات بعد" : "No entries yet",
    addFirst: lang === "ar" ? "أضف إدخالك الأول" : "Add your first entry",
    search: lang === "ar" ? "ابحث في الإدخالات..." : "Search entries...",
    allHabits: lang === "ar" ? "جميع العادات" : "All Habits",
  };

  const handleAddEntry = async () => {
    if (!entryForm.habitId) return;
    await onAddEntry(entryForm);
    setEntryForm({ habitId: "", mood: "🙂", reflection: "" });
  };

  const handleEditEntry = async (entry: Entry) => {
    const newReflection = prompt(labels.edit, entry.reflection || "");
    if (newReflection !== null) {
      await onUpdateEntry(entry.id, { reflection: newReflection });
    }
  };

  const moods = ["🙂", "😐", "😢", "😡", "😴", "🎉", "💪", "🧠", "❤️"];

  // Filter entries based on search
  const filteredEntries = entries.filter((entry) => {
    const habit = habits.find(h => h.id === entry.habitId);
    const habitName = habit?.name || "";
    const reflection = entry.reflection || "";
    
    return (
      habitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reflection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.mood.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6">
      {/* Add Entry Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">📝</span>
          {labels.addEntry}
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

          <Input
            placeholder={labels.reflection}
            value={entryForm.reflection}
            onChange={(e) => setEntryForm({ ...entryForm, reflection: e.target.value })}
          />

          <Button onClick={handleAddEntry} disabled={!entryForm.habitId}>
            {labels.add}
          </Button>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <Input
              placeholder={labels.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Filter size={16} />}
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              className="input w-auto"
              value={currentHabitId || ""}
              onChange={(e) => onFilterByHabit(e.target.value || null)}
            >
              <option value="">{labels.allHabits}</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.icon} {habit.name}
                </option>
              ))}
            </select>
            {currentHabitId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFilterByHabit(null)}
              >
                {labels.clearFilter}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

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
                {searchQuery ? (lang === "ar" ? "لا توجد نتائج" : "No results found") : labels.noEntries}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery 
                  ? (lang === "ar" ? "جرب مصطلح بحث آخر" : "Try a different search term")
                  : labels.addFirst
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditEntry(entry)}
                        leftIcon={<Edit2 size={14} />}
                      >
                        <span className="hidden sm:inline">{labels.edit}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDeleteEntry(entry.id)}
                        leftIcon={<Trash2 size={14} />}
                      >
                        <span className="hidden sm:inline">{labels.delete}</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}