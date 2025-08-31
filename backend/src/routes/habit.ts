import express from "express";

import { protect } from "../middleware/authMiddleware";
import {
  getHabits,
  updateHabit,
  createHabit,
  deleteHabit,
} from "../controllers/habit";
import { getHabitStreak } from "../controllers/streaks";
import { checkinHabit } from "../controllers/streaks";
// Habit Routes – all routes are protected (require login)

const router = express.Router();

// Middleware to protect all habit routes – only logged-in users can access
router.use(protect);
//  /api/habits/  GET all habits for the logged-in user
router.get("/", getHabits);
// POST a new habit for the logged-in user
router.post("/", createHabit);
// PUT (update) a specific habit by ID
router.put("/:id", updateHabit);
// DELETE a specific habit by ID
router.delete("/:id", deleteHabit);

//get Streak!
router.get("/:id/streak", getHabitStreak);

// Check-in لليوم
router.post("/:id/checkin", checkinHabit);

export default router;
