import { api } from "./api";

export type Entry = {
  id: string;
  habitId: string;
  mood: string;
  reflection?: string | null;
  createdAt: string;
};

// ---------- أنواع الردود العامة ----------
export type TopHabitResp =
  | { habit: { id: string; name: string } | null; count: number }
  | null;

// Raw types (كما قد يرجعها الباك، بدون ضمان وجود id أو createdAt)
type WeeklyGroupedEntryRaw = {
  id?: string;
  _id?: string;
  mood: string;
  reflection?: string | null;
  createdAt?: string;
};

type WeeklyGroupedRawResp = Array<{
  habit: { id: string; name: string };
  entries: WeeklyGroupedEntryRaw[];
}>;

// Normalized types (جاهزة للـUI)
export type WeeklyGroupedResp = Array<{
  habit: { id: string; name: string };
  entries: Array<{
    id: string;
    mood: string;
    reflection: string | null;
    createdAt: string;
  }>;
}>;

export const entriesService = {
  // GET /api/entries[?habitId=...]
  list: (habitId?: string) =>
    api.get<Entry[]>(
      `/entries${habitId ? `?habitId=${encodeURIComponent(habitId)}` : ""}`
    ),

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

  // GET /api/entries/weekly-grouped  (مع تطبيع id/createdAt)
  weeklyGrouped: async (): Promise<WeeklyGroupedResp> => {
    const raw = await api.get<WeeklyGroupedRawResp>("/entries/weekly-grouped");

    const normalized: WeeklyGroupedResp = raw.map((g) => ({
      habit: g.habit,
      entries: g.entries.map((e, idx) => ({
        id: e.id ?? e._id ?? `${g.habit.id}-${idx}`,
        mood: e.mood,
        reflection: e.reflection ?? null,
        createdAt: e.createdAt ?? new Date().toISOString(),
      })),
    }));

    return normalized;
  },

  // GET /api/entries/summary?from=...&to=...
  monthly: (fromISO: string, toISO: string) =>
    api.get<Entry[]>(
      `/entries/summary?from=${encodeURIComponent(
        fromISO
      )}&to=${encodeURIComponent(toISO)}`
    ),

  // GET /api/entries/ai-reflection[?days=&locale=]
  aiReflection: (opts?: { days?: number; locale?: "ar" | "en" }) => {
    const days = opts?.days ?? 7;
    const locale = opts?.locale ?? "ar";
    return api.get<{ reflection: string }>(
      `/entries/ai-reflection?days=${days}&locale=${locale}`
    );
  },
};
