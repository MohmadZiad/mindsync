import { prisma } from "../src/config/db";
import { getOpenAI } from "../lib/openaiClient";

export type Locale = "ar" | "en";

function fallbackMessage(locale: Locale) {
  return locale === "en"
    ? "Could not generate a summary now."
    : "تعذّر توليد الملخّص الآن.";
}

function extractResponseText(resp: any): string | undefined {
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) {
    return resp.output_text.trim();
  }
  if (Array.isArray(resp?.output) && resp.output.length > 0) {
    for (const part of resp.output) {
      const content = part?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (typeof c?.text === "string" && c.text.trim())
            return c.text.trim();
        }
      }
    }
  }
  if (typeof resp?.choices?.[0]?.message?.content === "string") {
    return resp.choices[0].message.content.trim();
  }
  return undefined;
}

export const buildReflectionText = async (opts: {
  userId: string;
  days: number;
  locale?: Locale;
}): Promise<string> => {
  const { userId } = opts;
  const days = Math.max(1, Math.min(Number(opts.days || 7), 30));
  const locale: Locale = opts.locale === "en" ? "en" : "ar";

  const from = new Date();
  from.setDate(from.getDate() - days);

  const entries = await prisma.entry.findMany({
    where: { userId, createdAt: { gte: from } },
    select: { createdAt: true, mood: true, reflection: true, habitId: true },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  if (!entries.length) {
    return locale === "en"
      ? "No entries in this period. Add a few reflections and try again."
      : "لا توجد إدخالات ضمن هذه الفترة. أضف بعض التأملات ثم أعد المحاولة.";
  }

  const lines = entries
    .slice(-200)
    .map((e) => {
      const d = e.createdAt.toISOString().slice(0, 10);
      const mood = e.mood ?? "N/A";
      const note = e.reflection ?? "-";
      return `- ${d} | habit:${e.habitId} | mood:${mood} | note:${note}`;
    })
    .join("\n");

  const system =
    locale === "en"
      ? "You are a concise behavioral coach. Summarize patterns from recent habit entries (moods + notes). Return: (1) 3 key insights, (2) 3 one-minute actions, (3) one gentle reflection question. Keep it under 180 words, friendly."
      : "أنت مدرّب سلوكي موجز. لخّص أنماط الإدخالات الأخيرة (المزاج + الملاحظات). أعطِ: (1) 3 ملاحظات رئيسية، (2) 3 إجراءات عملية لمدة دقيقة، (3) سؤال تأمّل واحد لطيف. أقل من 180 كلمة وبأسلوب ودود.";

  const model = (process.env.LLM_MODEL ?? "gpt-4o-mini").trim();
  const openai = await getOpenAI();

  try {
    const resp = await openai.responses.create({
      model,
      input: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Days: ${days}\nRecent entries (oldest->newest):\n${lines}`,
        },
      ],
      max_output_tokens: 350,
    });

    const text = extractResponseText(resp);
    return text ?? fallbackMessage(locale);
  } catch (err: any) {
    console.error("buildReflectionText error:", {
      message: err?.message,
      code: err?.code,
      type: err?.type,
      data: err?.response?.data,
    });
    return fallbackMessage(locale);
  }
};
