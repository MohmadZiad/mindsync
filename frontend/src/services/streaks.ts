import { api } from "./api";

export type Streak = {
  count: number;
  history?: Array<{ data: string; value: number }>;
};

export const streaksService = { me: () => api.get<Streak>("/streaks/me") };
