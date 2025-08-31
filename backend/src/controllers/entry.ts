import { Request, Response } from "express";
import { prisma } from "../config/db";
import { HabitQuery } from "../types/types";
import { error } from "console";

export const getEntries = async (
  req: Request<{}, {}, {}, HabitQuery>,
  res: Response
) => {
  const { habitId } = req.query;

  try {
    const entries = await prisma.entry.findMany({
      where: {
        userId: req.user!.id,
        ...(habitId && { habitId: habitId as string }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// create a new entry

export const createEntry = async (req: Request, res: Response) => {
    const { mood, reflection, habitId } = req.body;
  
    try {
      const habit = await prisma.habit.findFirst({
        where: {
          id: habitId,
          userId: req.user!.id,
        },
      });
  
      if (!habit) {
        return res.status(400).json({ message: "Invalid habitId or unauthorized access." });
      }
  
      const entry = await prisma.entry.create({
        data: {
          mood,
          reflection,
          habitId,
          userId: req.user!.id,
        },
      });
  
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };
  

//update Entry

export const updateEntry = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { mood, reflection } = req.body;

  try {
    const entry = await prisma.entry.update({
      where: { id },
      data: { mood, reflection },
    });
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

//delete entry
// delete entry (fixed)
export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // اختياري بس مهم أمنيًا: تأكد إنه السجل للمستخدم الحالي
    const found = await prisma.entry.findUnique({ where: { id } });
    if (!found || found.userId !== req.user!.id) {
      return res.status(404).json({ message: "Entry not found" });
    }

    // احذف وانتظر انتهاء العملية
    await prisma.entry.delete({ where: { id } });

    // 204 بدون body
    return res.status(204).send();
  } catch (err: any) {
    // لو سجل غير موجود (P2025) رجّع 404 بدل 500
    if (err?.code === "P2025") {
      return res.status(404).json({ message: "Entry not found" });
    }
    console.error("DELETE /api/entries/:id", err);
    return res.status(500).json({ message: "Server Error", error: err?.message });
  }
};


//Get weekly summary

export const weeklySummary = async (req: Request, res: Response) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  try {
    const summary = await prisma.entry.findMany({
      where: {
        userId: req.user!.id,
        createdAt: { gte: oneWeekAgo },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
//  Bar Chart - mood count
export const weeklyMoodChart = async (req: Request, res: Response) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    try {
      const entries = await prisma.entry.findMany({
        where: {
          userId: req.user!.id,
          createdAt: { gte: oneWeekAgo },
        },
        select: { mood: true },
      });
  
      const moodCount: Record<string, number> = {};
      entries.forEach(entry => {
        moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
      });
  
      res.status(200).json(moodCount);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };

  // most happut cometment
export const topHabit = async (req: Request, res: Response) => {
    try {
      const result = await prisma.entry.groupBy({
        by: ['habitId'],
        where: { userId: req.user!.id },
        _count: { habitId: true },
        orderBy: { _count: { habitId: 'desc' } },
        take: 1,
      });
  
      if (result.length === 0) return res.status(200).json(null);
  
      const habit = await prisma.habit.findUnique({
        where: { id: result[0].habitId },
        select: { id: true, name: true },
      });
  
      res.status(200).json({
        habit,
        count: result[0]._count.habitId,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  //  Weekly entries grouped by habit
export const weeklyGrouped = async (req: Request, res: Response) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    try {
      const habits = await prisma.habit.findMany({
        where: { userId: req.user!.id },
        select: {
          id: true,
          name: true,
          entries: {
            where: { createdAt: { gte: oneWeekAgo } },
            select: {
              mood: true,
              reflection: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
  
      const grouped = habits
        .filter((h) => h.entries.length > 0)
        .map((habit) => ({
          habit: {
            id: habit.id,
            name: habit.name,
          },
          entries: habit.entries,
        }));
  
      res.status(200).json(grouped);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  // monthly summry 
  export const monthlySummary = async (req: Request, res: Response) => {
    const { from, to } = req.query;
  
    if (!from || !to) {
      return res.status(400).json({ message: "from and to dates are required." });
    }
  
    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);
  
    try {
      const summary = await prisma.entry.findMany({
        where: {
          userId: req.user!.id,
          createdAt: {
            gte: fromDate,
            lte: toDate,
          },
        },
        orderBy: { createdAt: "desc" },
      });
  
      res.status(200).json(summary);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  