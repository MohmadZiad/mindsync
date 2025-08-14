import { api } from "./api";

export type Entry = {
  id: string;
  content: string;
  mood?: string;
  createdAt: string;
};

export type AIReflectionResponse = {
  days: number;
  locale: "ar" | "en";
  text: string;
};

export const entriesService = {
  list: () => api.get<Entry[]>("/entries"),

  create: (d: { content: string; mood?: string }) =>
    api.post<Entry>("/entries", d),

  aiReflection: (opts?: { days?: number; locale?: "ar" | "en" }) => {
    const days = opts?.days ?? 7;
    const locale = opts?.locale ?? "ar";
    return api.get<AIReflectionResponse>(
      `/entries/ai-reflection?days=${days}&locale=${locale}`
    );
  },
};
