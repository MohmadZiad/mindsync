    import { Request, Response } from "express";
    import { prisma } from "../config/db";

    //  Get all habits for authenticated user
    export const getHabits = async (req: Request, res: Response) => {
    try {
        const habits = await prisma.habit.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
        });
        res.status(200).json(habits);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
    };

    //  Create new habit
    export const createHabit = async (req: Request, res: Response) => {
    const { name, description, icon, color } = req.body;
    try {
        const habit = await prisma.habit.create({
        data: {
            name,
            description,
            icon,
            color,
            userId: req.user!.id,
        },
        });
        res.status(201).json(habit);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
    };

    //  Update habit
    export const updateHabit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, icon, color, isArchived } = req.body;
    try {
        const habit = await prisma.habit.update({
        where: { id },
        data: {
            name,
            description,
            icon,
            color,
            isArchived,
        },
        });
        res.status(200).json(habit);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
    };

    //  Delete habit
    export const deleteHabit = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.habit.delete({ where: { id } });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
    };
