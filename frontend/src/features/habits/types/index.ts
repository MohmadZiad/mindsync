export interface Habit {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  frequency: "daily" | "weekly";
  isArchived: boolean;
  createdAt: string;
}

export interface CreateHabitData {
  name: string;
  description?: string;
  icon?: string | null;
  color?: string | null;
  frequency?: "daily" | "weekly";
}

export interface UpdateHabitData {
  name?: string;
  description?: string;
  icon?: string | null;
  color?: string | null;
  frequency?: "daily" | "weekly";
  isArchived?: boolean;
}

export interface HabitStreak {
  current: number;
  longest: number;
}

export interface CheckinResult {
  doneToday: boolean;
  current: number;
  longest: number;
}