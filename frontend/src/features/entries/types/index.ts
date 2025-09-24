export interface Entry {
  id: string;
  habitId: string;
  userId: string;
  mood: string;
  reflection?: string | null;
  createdAt: string;
}

export interface CreateEntryData {
  habitId: string;
  mood: string;
  reflection?: string;
  quantity?: number;
}

export interface UpdateEntryData {
  mood?: string;
  reflection?: string;
  quantity?: number;
}

export interface WeeklyMoodData {
  [mood: string]: number;
}

export interface TopHabitData {
  habit: {
    id: string;
    name: string;
  } | null;
  count: number;
}

export interface WeeklyGroupedEntry {
  id: string;
  mood: string;
  reflection: string | null;
  createdAt: string;
}

export interface WeeklyGroupedData {
  habit: {
    id: string;
    name: string;
  };
  entries: WeeklyGroupedEntry[];
}

export interface AIReflectionResponse {
  ok: boolean;
  summary: string;
  days: number;
  locale: "ar" | "en";
  model: string;
}