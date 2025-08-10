import { Request, Response } from "express";
import { buildReflectionText, type Locale } from "../../services/reflection";

export const getAIReflection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const days = req.query.days ? parseInt(String(req.query.days), 10) : 7;
    const raw = String(req.query.locale || "").toLowerCase();
    const locale: Locale = raw === "en" ? "en" : "ar";

    const text = await buildReflectionText({ userId, days, locale });
    return res.json({ days, locale, text });
  } catch (err) {
    console.error("getAIReflection error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
