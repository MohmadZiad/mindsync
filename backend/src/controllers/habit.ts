import { Request, Response } from "express";
import { prisma } from "../config/db";

// GET /api/habits
export const getHabits = async (req: Request, res: Response) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        frequency: true,
        createdAt: true,
      },
    });
    return res.status(200).json(habits);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Server Error", error: err?.message });
  }
};

// POST /api/habits
export const createHabit = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color, frequency } = req.body as {
      name: string;
      description?: string;
      icon?: string | null;
      color?: string | null;
      frequency?: "daily" | "weekly";
    };

    if (!name?.trim()) {
      return res.status(400).json({ message: "name is required" });
    }

    const habit = await prisma.habit.create({
      data: {
        name: name.trim(),
        description: description ?? null,
        icon: icon ?? null,
        color: color ?? null,
        frequency: (frequency as any) ?? "daily",
        userId: req.user!.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        frequency: true,
        createdAt: true,
      },
    });

    return res.status(201).json(habit);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Server Error", error: err?.message });
  }
};

// PUT /api/habits/:id
export const updateHabit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.habit.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.id) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const { name, description, icon, color, frequency } = req.body;

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(icon !== undefined ? { icon } : {}),
        ...(color !== undefined ? { color } : {}),
        ...(frequency !== undefined ? { frequency } : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        frequency: true,
        createdAt: true,
      },
    });

    return res.status(200).json(updated);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Server Error", error: err?.message });
  }
};

// DELETE /api/habits/:id
export const deleteHabit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.habit.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.id) {
      return res.status(404).json({ message: "Habit not found" });
    }

    await prisma.habit.delete({ where: { id } }); // cascade will clean entries
    return res.status(204).send();
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Server Error", error: err?.message });
  }
};
