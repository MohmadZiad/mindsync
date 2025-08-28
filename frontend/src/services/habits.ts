import { api } from "./api";
import type { Streak } from "./streaks"; // إعادة استخدام نفس النوع

export type Habit = {
  id: string;
  name: string;
  frequency?: "daily" | "weekly";
  description?: string;
  icon?: string | null;   // NEW
  color?: string | null;  // NEW
  createdAt?: string;
};


export const habitsService = {
  // GET /api/habits
  list: () => api.get<Habit[]>("/habits"),

  // POST /api/habits
  create: (d: {
    name: string;
    frequency?: Habit["frequency"];
    description?: string;
  }) => api.post<Habit>("/habits", d),

  // PUT /api/habits/:id
  update: (id: string, d: Partial<Omit<Habit, "id">>) =>
    api.put<Habit>(`/habits/${id}`, d),

  // DELETE /api/habits/:id
  remove: (id: string) => api.delete<{ success: true }>(`/habits/${id}`),

  // GET /api/habits/:id/streak  -> { current, longest }
  getStreak: async (id: string): Promise<Streak> => {
    const res = await api.get<{ current: number; longest: number }>(
      `/habits/${id}/streak`
    );
    return { current: res.current, longest: res.longest };
  },

  // POST /api/habits/:id/checkin -> { doneToday, current, longest }
  checkin: (habitId: string, note?: string) =>
    api.post<{ doneToday: boolean; current: number; longest: number }>(
      `/habits/${habitId}/checkin`,
      note ? { note } : undefined
    ),
};

export default habitsService;
