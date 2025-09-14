import { Request, Response } from "express";
import { buildReflectionText, type Locale } from "../../services/reflection";

export const getAIReflection = async (req: Request, res: Response) => {
  try {
    // 1) التحقق من المستخدم
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: no user id" });
    }

    // 2) قراءة الباراميترات
    const daysRaw = String(req.query.days ?? "7");
    const days = Math.max(1, Math.min(parseInt(daysRaw, 10) || 7, 30));

    const rawLocale = String(
      req.query.locale ?? req.query.language ?? "ar"
    ).toLowerCase();
    const locale: Locale = rawLocale === "en" ? "en" : "ar";

    // 3) بناء الملخّص باستخدام خدمة الذكاء
    const summary = await buildReflectionText({ userId, days, locale });

    return res.json({
      ok: true,
      summary,
      days,
      locale,
      model: process.env.LLM_MODEL ?? "default",
    });
  } catch (err: any) {
    console.error("getAIReflection error:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    // 4) خريطة أخطاء أبسط للواجهة
    const status = err?.status || err?.response?.status || 500;
    const message =
      status === 401
        ? "Unauthorized"
        : status === 429
        ? "Rate limit reached"
        : "AI Server error";

    return res.status(status).json({ error: message });
  }
};
