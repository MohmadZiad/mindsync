// backend/src/controllers/streaks.ts
import { Request, Response } from "express";
import { prisma } from "../config/db";
import { computeHabitStreakToday } from "../../services/streaks";

// GET /api/habits/:id/streak
// Unified response for frontend: { current, longest }
export const getHabitStreak = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const habitId = String(req.params.id || "");
    if (!habitId) return res.status(400).json({ error: "Missing habit id" });

    const stats = await computeHabitStreakToday(habitId, userId);
    return res.json({
      current: stats.current, // number
      longest: stats.longest, // number
    });
  } catch (err) {
    console.error("getHabitStreak error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/habits/:id/checkin
// Creates today's entry if needed, then returns {doneToday, current, longest}
export const checkinHabit = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const habitId = String(req.params.id || "");
    if (!habitId) return res.status(400).json({ error: "Missing habit id" });

    const note: string | undefined = req.body?.note ?? undefined;

    // today's window
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // prevent duplicate entry for today
    const existing = await prisma.entry.findFirst({
      where: { userId, habitId, createdAt: { gte: start, lte: end } },
      select: { id: true },
    });

    if (!existing) {
      await prisma.entry.create({
        data: {
          userId,
          habitId,
          mood: "done",
          reflection: note ?? null,
        },
      });
    }

    // recompute streak now that today's entry exists
    const stats = await computeHabitStreakToday(habitId, userId);

    return res.json({
      doneToday: true,
      current: stats.current, // number
      longest: stats.longest, // number
    });
  } catch (err) {
    console.error("checkinHabit error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
