import { api } from "./api";

export type Streak = {
  current: number; // current consecutive count
  longest: number; // longest streak ever
  history?: Array<{ date: string; value: number }>;
};

export const streaksService = {
  byHabit: async (habitId: string): Promise<Streak> => {
    const res = await api.get<{ current: number; longest: number }>(
      `/habits/${habitId}/streak`
    );
    return {
      current: res.current,
      longest: res.longest,
      history: [], 
    };
  },
};
