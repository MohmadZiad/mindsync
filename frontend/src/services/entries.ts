import { api } from "./api";

export type Entry = {
  id: string;
  habitId: string;
  mood: string;
  reflection?: string | null;
  createdAt: string;
};

// موحّد لكل الردود
export type TopHabitResp = { habit: { id: string; name: string } | null; count: number } | null;
export type WeeklyGroupedResp = { habit: { id: string; name: string }; entries: Array<{ mood: string; reflection?: string | null; createdAt: string }> }[];

export const entriesService = {
  // GET /api/entries[?habitId=...]
  list: (habitId?: string) =>
    api.get<Entry[]>(`/entries${habitId ? `?habitId=${encodeURIComponent(habitId)}` : ""}`),

  // POST /api/entries
  create: (d: { mood: string; reflection?: string; habitId: string }) =>
    api.post<Entry>("/entries", d),

  // PUT /api/entries/:id
  update: (id: string, d: Partial<{ mood: string; reflection: string }>) =>
    api.put<Entry>(`/entries/${id}`, d),

  // DELETE /api/entries/:id
  remove: (id: string) => api.delete<{ success?: true }>(`/entries/${id}`),

  // GET /api/entries/weekly-summary
  weeklySummary: () => api.get<Entry[]>("/entries/weekly-summary"),

  // GET /api/entries/weekly-mood
  weeklyMood: () => api.get<Record<string, number>>("/entries/weekly-mood"),

  // GET /api/entries/top-habit
  topHabit: () => api.get<TopHabitResp>("/entries/top-habit"),

  // GET /api/entries/weekly-grouped
  weeklyGrouped: () => api.get<WeeklyGroupedResp>("/entries/weekly-grouped"),

  // GET /api/entries/summary?from=...&to=...
  monthly: (fromISO: string, toISO: string) =>
    api.get<Entry[]>(`/entries/summary?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`),

  // GET /api/entries/ai-reflection[?days=&locale=]
  aiReflection: (opts?: { days?: number; locale?: "ar" | "en" }) => {
    const days = opts?.days ?? 7;
    const locale = opts?.locale ?? "ar";
    return api.get<{ reflection: string }>(`/entries/ai-reflection?days=${days}&locale=${locale}`);
  },
};
