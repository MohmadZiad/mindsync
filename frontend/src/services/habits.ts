import { api } from "./api";

export type Habit = {
  id: string;
  name: string;
  frequency?: "daily" | "weekly";
  description?: string;
  createdAt?: string;
};

export type Streak = {
  count: number;
  start?: string;
  current?: boolean;
  history?: Array<{ date: string; value: number }>;
};

export const habitsService = {
  // GET /api/habits
  list: () => api.get<Habit[]>("/habits"),

  // POST /api/habits
  create: (d: { name: string; frequency?: Habit["frequency"]; description?: string }) =>
    api.post<Habit>("/habits", d),

  // PUT /api/habits/:id
  update: (id: string, d: Partial<Omit<Habit, "id">>) =>
    api.put<Habit>(`/habits/${id}`, d),

  // DELETE /api/habits/:id
  remove: (id: string) => api.delete<{ success: true }>(`/habits/${id}`),

  // GET /api/habits/:id/streak
  getStreak: (id: string) => api.get<Streak>(`/habits/${id}/streak`),
};

export default habitsService;
