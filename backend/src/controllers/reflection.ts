import { Request, Response } from "express";
import { buildReflectionText, type Locale } from "../../services/reflection";

export const getAIReflection = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const days = Math.max(1, parseInt(String(req.query.days ?? "7"), 10));

    const raw = String(
      req.query.locale ?? req.query.language ?? "ar"
    ).toLowerCase();
    const locale: Locale = raw === "en" ? "en" : "ar";

    const summary = await buildReflectionText({ userId, days, locale });
    return res.json({ summary, days, locale });
  } catch (err) {
    console.error("getAIReflection error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
