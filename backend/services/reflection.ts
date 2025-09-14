// services/ai/reflection.ts
// English-commented version

import { prisma } from "../src/config/db";
import { getOpenAI } from "../lib/openaiClient";

export type Locale = "ar" | "en";

/* -------------------- i18n messages -------------------- */
const M = {
  ar: {
    empty: "لا توجد إدخالات ضمن هذه الفترة. أضف بعض التأملات ثم أعد المحاولة.",
    fail: "تعذّر توليد الملخّص الآن.",
    title: "ملخّص ذكي",
    insights: "ملاحظات رئيسية",
    actions: "إجراءات دقيقة واحدة",
    question: "سؤال للتأمّل",
    quota: "تم استهلاك الحصة الخاصة بخدمة الذكاء. أضف رصيدًا أو جرّب لاحقًا.",
  },
  en: {
    empty: "No entries in this period. Add a few reflections and try again.",
    fail: "Could not generate a summary now.",
    title: "Smart Summary",
    insights: "Key Insights",
    actions: "One-Minute Actions",
    question: "Reflection Question",
    quota:
      "Quota exceeded for the AI service. Please add balance or try later.",
  },
} as const;

/* -------------------- small utils -------------------- */
function trimNote(s: string | null | undefined, max = 180) {
  if (!s) return "-";
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

function sliceLast<T>(arr: T[], n: number) {
  return arr.length > n ? arr.slice(arr.length - n) : arr;
}

/** Normalize different OpenAI response shapes into plain text */
function extractResponseText(resp: any): string | undefined {
  // Responses API (SDK helper)
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) {
    return resp.output_text.trim();
  }
  // Chat Completions API
  const choices = resp?.choices;
  if (Array.isArray(choices) && choices[0]?.message?.content) {
    const content = choices[0].message.content;
    if (typeof content === "string") return content.trim();
  }
  // Responses API (raw blocks)
  if (Array.isArray(resp?.output)) {
    for (const part of resp.output) {
      const blocks = Array.isArray(part?.content) ? part.content : [];
      for (const b of blocks) {
        if (typeof b?.text === "string" && b.text.trim()) return b.text.trim();
      }
    }
  }
  return undefined;
}

/* -------------------- models + retry policy -------------------- */
// Preferred models. First item is taken from .env if provided.
const MODEL_PREFS = [
  process.env.LLM_MODEL?.trim(),
  "gpt-5-mini",
  "gpt-5",
  "gpt-5-nano",
].filter(Boolean) as string[];

// Simple retry helper: retry only for 5xx. For 429 (quota/rate) return immediately.
type RetryOpts = { tries?: number; initialDelayMs?: number };
async function withRetries<T>(
  fn: () => Promise<T>,
  { tries = 3, initialDelayMs = 400 }: RetryOpts = {}
): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = err?.status || err?.response?.status;

      // Do not retry on quota/rate-limit; surface the error quickly
      if (status === 429) throw err;

      // Retry only on transient server errors
      if (status >= 500) {
        const delay = initialDelayMs * Math.pow(2, i);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      // For other codes, retrying won't help
      throw err;
    }
  }
  throw lastErr;
}

/* -------------------- main entry -------------------- */
export const buildReflectionText = async (opts: {
  userId: string;
  days: number;
  locale?: Locale;
}): Promise<string> => {
  const days = Math.max(1, Math.min(Number(opts.days || 7), 30));
  const locale: Locale = opts.locale === "en" ? "en" : "ar";
  const t = M[locale];

  // 1) Pull entries from DB
  const from = new Date();
  from.setDate(from.getDate() - days);

  const entries = await prisma.entry.findMany({
    where: { userId: opts.userId, createdAt: { gte: from } },
    select: { createdAt: true, mood: true, reflection: true, habitId: true },
    orderBy: { createdAt: "asc" },
    take: 600,
  });

  if (!entries.length) return t.empty;

  // 2) Prepare compact lines for the prompt
  const lines = sliceLast(entries, 220)
    .map((e) => {
      const d = e.createdAt.toISOString().slice(0, 10);
      const mood = e.mood ?? "N/A";
      const note = trimNote(e.reflection, 220);
      return `- ${d} | habit:${e.habitId} | mood:${mood} | note:${note}`;
    })
    .join("\n");

  // 3) Build system and user messages (bilingual)
  const system =
    locale === "en"
      ? "You are a concise behavioral coach. Summarize patterns from recent habit entries (moods + notes). Output friendly markdown with:\n1) 3 key insights\n2) 3 one-minute actions\n3) one gentle reflection question\nKeep it under 180 words total."
      : "أنت مدرّب سلوكي موجز. لخّص أنماط الإدخالات الأخيرة (المزاج + الملاحظات). أخرج Markdown ودود يحتوي:\n1) 3 ملاحظات رئيسية\n2) 3 إجراءات لمدة دقيقة واحدة\n3) سؤال تأمّل واحد لطيف\nليكن الإجمالي أقل من 180 كلمة.";

  const userMsg =
    locale === "en"
      ? `Days: ${days}\nRecent entries (oldest → newest):\n${lines}`
      : `الأيام: ${days}\nأحدث الإدخالات (الأقدم ← الأحدث):\n${lines}`;

  // 4) Call OpenAI (Responses first, then Chat Completions as a fallback)
  const openai = await getOpenAI();

  let text: string | undefined;
  let lastErr: any;

  for (const model of MODEL_PREFS) {
    console.log("🔎 Trying model:", model);
    try {
      // First try: Responses API (no temperature/max_output_tokens here)
      const resp = await withRetries(
        () =>
          openai.responses.create({
            model,
            input: [
              { role: "system", content: system },
              { role: "user", content: userMsg },
            ],
          }),
        { tries: 2, initialDelayMs: 500 }
      );

      text = extractResponseText(resp);

      // If Responses did not yield text, try Chat Completions
      if (!text || !text.trim()) {
        const chat = await withRetries(
          () =>
            openai.chat.completions.create({
              model,
              messages: [
                { role: "system", content: system },
                { role: "user", content: userMsg },
              ],
              temperature: 0.3,
              max_tokens: 380,
            }),
          { tries: 1, initialDelayMs: 500 }
        );
        text = chat?.choices?.[0]?.message?.content?.trim();
      }

      if (text && text.trim()) break; // success
      throw new Error("EMPTY_OPENAI_TEXT"); // move to next model
    } catch (err: any) {
      lastErr = err;
      const status = err?.status || err?.response?.status;
      console.error("[AI] model", model, "failed:", status, err?.message);
      // try the next model
      continue;
    }
  }

  // 5) Return result or user-friendly error
  if (!text) {
    if (lastErr) {
      const status = lastErr?.status || lastErr?.response?.status;
      if (status === 429) {
        // Quota/rate issues → explicit message
        return t.quota;
      }
      console.error("buildReflectionText final error:", {
        status,
        message: lastErr?.message,
        code: lastErr?.code,
        type: lastErr?.type,
      });
    }
    return t.fail;
  }

  // 6) Wrap into neat Markdown if needed
  const heading =
    locale === "en" ? `## ${M.en.title}\n\n` : `## ${M.ar.title}\n\n`;

  // If the model didn’t return Markdown, format a simple one
  if (!/^#+\s|\*\s|- /.test(text)) {
    const [ins, act, q] = text.split(/\n{2,}/);
    const label = M[locale];
    return (
      heading +
      `### ${label.insights}\n${ins || "-"}\n\n` +
      `### ${label.actions}\n${act || "-"}\n\n` +
      `### ${label.question}\n${q || "-"}`
    );
  }

  return heading + text.trim();
};
