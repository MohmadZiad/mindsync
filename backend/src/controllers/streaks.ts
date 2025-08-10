import { Request, Response } from "express";
import { computeHabitStreakToday } from "../../services/streaks";

export const getHabitStreak = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const habitId = String(req.params.id || "");
    if (!habitId) return res.status(400).json({ error: "Missing habit id" });

    const result = await computeHabitStreakToday(habitId, userId);
    return res.json(result);
  } catch (err) {
    console.error("getHabitStreak error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
