import { api } from "@/services/api";
import type { Habit, CreateHabitData, UpdateHabitData, HabitStreak, CheckinResult } from "../types";

export const habitsApi = {
  // Get all habits for the current user
  getHabits: () => api.get<Habit[]>("/habits"),

  // Create a new habit
  createHabit: (data: CreateHabitData) => api.post<Habit>("/habits", data),

  // Update an existing habit
  updateHabit: (id: string, data: UpdateHabitData) => 
    api.put<Habit>(`/habits/${id}`, data),

  // Delete a habit
  deleteHabit: (id: string) => api.delete(`/habits/${id}`),

  // Get habit streak information
  getHabitStreak: (id: string) => api.get<HabitStreak>(`/habits/${id}/streak`),

  // Check in for a habit (mark as done today)
  checkinHabit: (id: string, note?: string) => 
    api.post<CheckinResult>(`/habits/${id}/checkin`, note ? { note } : undefined),
};