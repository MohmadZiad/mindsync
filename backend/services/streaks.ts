import { prisma } from "../src/config/db";

const toDayKey = (d: Date) => d.toISOString().slice(0, 10);

export const computeHabitStreakToday = async (
  habitId: string,
  userId: string
) => {
  const from = new Date();
  from.setDate(from.getDate() - 365); // سنة

  const entries = await prisma.entry.findMany({
    where: { habitId, userId, createdAt: { gte: from } },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (!entries.length) return { current: 0, longest: 0 };

  const daysSet = new Set(entries.map((e) => toDayKey(e.createdAt)));

  // current streak
  let current = 0;
  const today = new Date();
  for (let offset = 0; offset < 400; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    if (daysSet.has(toDayKey(d))) current++;
    else break;
  }

  // longest streak
  const allDays = Array.from(daysSet).sort(); // تصاعدي
  let longest = 1;
  let run = 1;
  for (let i = 1; i < allDays.length; i++) {
    const prev = new Date(allDays[i - 1]);
    const cur = new Date(allDays[i]);
    const diff = Math.round((+cur - +prev) / 86400000);
    if (diff === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return { current, longest };
};
