import express from "express";
import rateLimit from "express-rate-limit";

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
import { getAIReflection } from "../controllers/reflection";

const router = express.Router();
router.use(protect);

const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  standardHeaders: true, 
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip, 
  message: { error: "يمكنك طلب الانعكاس الذاتي مرة واحدة كل 10 دقائق." },
});

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

//Ai
router.get("/ai-reflection", aiLimiter, getAIReflection);
export default router;
