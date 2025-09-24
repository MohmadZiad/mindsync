import { api } from "@/services/api";
import type {
  Entry,
  CreateEntryData,
  UpdateEntryData,
  WeeklyMoodData,
  TopHabitData,
  WeeklyGroupedData,
  AIReflectionResponse,
} from "../types";

export const entriesApi = {
  // Get entries (optionally filtered by habit)
  getEntries: (habitId?: string) => {
    const query = habitId ? `?habitId=${encodeURIComponent(habitId)}` : "";
    return api.get<Entry[]>(`/entries${query}`);
  },

  // Create a new entry
  createEntry: (data: CreateEntryData) => api.post<Entry>("/entries", data),

  // Update an existing entry
  updateEntry: (id: string, data: UpdateEntryData) => 
    api.put<Entry>(`/entries/${id}`, data),

  // Delete an entry
  deleteEntry: (id: string) => api.delete(`/entries/${id}`),

  // Get weekly summary
  getWeeklySummary: () => api.get<Entry[]>("/entries/weekly-summary"),

  // Get weekly mood chart data
  getWeeklyMood: () => api.get<WeeklyMoodData>("/entries/weekly-mood"),

  // Get top habit data
  getTopHabit: () => api.get<TopHabitData>("/entries/top-habit"),

  // Get weekly grouped entries
  getWeeklyGrouped: () => api.get<WeeklyGroupedData[]>("/entries/weekly-grouped"),

  // Get monthly summary
  getMonthlySummary: (from: string, to: string) => 
    api.get<Entry[]>(`/entries/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  // Get AI reflection
  getAIReflection: (params: { days?: number; locale?: "ar" | "en" }) => {
    const query = new URLSearchParams({
      days: String(params.days || 7),
      locale: params.locale || "ar",
    });
    return api.get<AIReflectionResponse>(`/entries/ai-reflection?${query}`);
  },
};