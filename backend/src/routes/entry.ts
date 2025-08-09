import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  weeklySummary,
  weeklyMoodChart,
  topHabit,
  weeklyGrouped,
  monthlySummary,
} from "../controllers/entry";

const router = express.Router();
router.use(protect);

//Api request

router.get("/", getEntries);
router.post("/", createEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);
router.get("/weekly-summary", weeklySummary);
router.get("/weekly-mood", weeklyMoodChart);
router.get("/top-habit", topHabit);
router.get("/weekly-grouped", weeklyGrouped);
router.get("/summary", monthlySummary);

export default router;
