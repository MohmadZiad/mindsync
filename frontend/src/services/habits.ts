import { api } from "./api";

export type Habit = {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  description?: string;
};

export type Streak = {
  count: number;
  history?: Array<{ date: string; value: number }>;
};

export const habitsService = {
  list: () => api.get<Habit[]>("/habits"),

  create: (d: Omit<Habit, "id">) => api.post<Habit>("/habits", d),

  update: (id: string, d: Partial<Habit>) => api.put<Habit>(`/habits/${id}`, d),

  remove: (id: string) => api.delete<{ success: true }>(`/habits/${id}`),

  getStreak: (id: string) => api.get<Streak>(`/habits/${id}/streak`),
};

export default habitsService;
