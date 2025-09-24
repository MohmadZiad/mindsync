"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, CheckCircle, MoreHorizontal, Filter } from "lucide-react";

import { useI18n } from "@/components/ui/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import HabitFormExtra, { type HabitExtra } from "@/components/HabitFormExtra";
import HabitFilters, { type HabitFilter } from "@/components/ui/HabitFilters";
import BadgesRow from "@/components/addons/BadgesRow";

interface Habit {
  id: string;
  name: string;
  icon?: string | null;
  frequency?: "daily" | "weekly";
  description?: string;
}

interface HabitsSectionProps {
  habits: Habit[];
  streaks: Record<string, { current: number; longest: number }>;
  onAddHabit: (data: { name: string } & HabitExtra) => Promise<void>;
  onUpdateHabit: (id: string, name: string) => Promise<void>;
  onDeleteHabit: (id: string) => Promise<void>;
  onCheckinHabit: (id: string) => Promise<void>;
}

export default function HabitsSection({
  habits,
  streaks,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
  onCheckinHabit,
}: HabitsSectionProps) {
  const { lang } = useI18n();
  
  const [newHabit, setNewHabit] = useState("");
  const [newHabitExtra, setNewHabitExtra] = useState<HabitExtra>({
    frequency: "daily",
    description: "",
    icon: null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [filter, setFilter] = useState<HabitFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const labels = {
    addHabit: lang === "ar" ? "إضافة عادة جديدة" : "Add New Habit",
    habitName: lang === "ar" ? "اسم العادة" : "Habit Name",
    add: lang === "ar" ? "إضافة" : "Add",
    save: lang === "ar" ? "حفظ" : "Save",
    cancel: lang === "ar" ? "إلغاء" : "Cancel",
    edit: lang === "ar" ? "تعديل" : "Edit",
    delete: lang === "ar" ? "حذف" : "Delete",
    markDone: lang === "ar" ? "تم اليوم" : "Mark Done",
    streak: lang === "ar" ? "سلسلة" : "Streak",
    days: lang === "ar" ? "أيام" : "days",
    noHabits: lang === "ar" ? "لا توجد عادات بعد" : "No habits yet",
    addFirst: lang === "ar" ? "أضف عادتك الأولى للبدء" : "Add your first habit to get started",
    search: lang === "ar" ? "ابحث في العادات..." : "Search habits...",
    filters: lang === "ar" ? "فلاتر" : "Filters",
  };

  const handleAddHabit = async () => {
    if (!newHabit.trim()) return;
    await onAddHabit({ name: newHabit.trim(), ...newHabitExtra });
    setNewHabit("");
    setNewHabitExtra({ frequency: "daily", description: "", icon: null });
  };

  const handleEditSave = async () => {
    if (!editingId || !editingName.trim()) return;
    await onUpdateHabit(editingId, editingName.trim());
    setEditingId(null);
    setEditingName("");
  };

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditingName(habit.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Filter habits based on search and filter
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === "all" ||
      (filter === "daily" && habit.frequency === "daily") ||
      (filter === "weekly" && habit.frequency === "weekly") ||
      (filter === "archived" && false); // TODO: Add archived field
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Add Habit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-[var(--line)] p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">➕</span>
          {labels.addHabit}
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder={labels.habitName}
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddHabit} disabled={!newHabit.trim()}>
              {labels.add}
            </Button>
          </div>
          
          <HabitFormExtra
            value={newHabitExtra}
            onChange={setNewHabitExtra}
            lang={lang}
          />
        </div>
      </motion.div>

      {/* Search and Filters */}
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">{labels.filters}:</span>
            <HabitFilters
              value={filter}
              onChange={setFilter}
              lang={lang}
            />
          </div>
        </div>
      </motion.div>

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
                {searchQuery ? (lang === "ar" ? "لا توجد نتائج" : "No results found") : labels.noHabits}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery 
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
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleEditSave}>
                      {labels.save}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      {labels.cancel}
                    </Button>
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
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => onCheckinHabit(habit.id)}
                          leftIcon={<CheckCircle size={16} />}
                        >
                          <span className="hidden sm:inline">{labels.markDone}</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(habit)}
                          leftIcon={<Edit2 size={16} />}
                        >
                          <span className="hidden sm:inline">{labels.edit}</span>
                          <span className="sm:hidden">✏️</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onDeleteHabit(habit.id)}
                          leftIcon={<Trash2 size={16} />}
                        >
                          <span className="hidden sm:inline">{labels.delete}</span>
                          <span className="sm:hidden">🗑️</span>
                        </Button>
                      </div>
                    </div>

                    {/* Habit description */}
                    {habit.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 pl-11">
                        {habit.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="pl-11">
                      <BadgesRow
                        lang={lang}
                        streak={streaks[habit.id]?.current || 0}
                        weekCount={5} // Will be computed from actual data
                        consistency={85} // Will be computed from actual data
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
  );
}