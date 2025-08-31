// backend/services/streaks.ts
import { prisma } from "../src/config/db";

// ---------- helpers (LOCAL time, not UTC) ----------
const toLocalDayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`; // yyyy-mm-dd (LOCAL)
};

const startOfLocalDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Monday = start of week (LOCAL)
const startOfLocalWeek = (d = new Date()) => {
  const x = startOfLocalDay(d);
  const day = x.getDay() || 7; // Sun=0 -> 7
  if (day !== 1) x.setDate(x.getDate() - (day - 1));
  return x;
};

const toLocalWeekKey = (d: Date) => toLocalDayKey(startOfLocalWeek(d));

// ---------- main ----------
export const computeHabitStreakToday = async (
  habitId: string,
  userId: string
) => {
  // read frequency (daily/weekly)
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { frequency: true },
  });
  const frequency = (habit?.frequency ?? "daily") as "daily" | "weekly";

  const from = new Date();
  from.setDate(from.getDate() - 365);

  const entries = await prisma.entry.findMany({
    where: { habitId, userId, createdAt: { gte: from } },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (!entries.length) return { current: 0, longest: 0 };

  if (frequency === "weekly") {
    // ===== WEEKLY (LOCAL) =====
    const weekSet = new Set(
      entries.map((e) => toLocalWeekKey(new Date(e.createdAt)))
    );

    // current: فقط إذا هذا الأسبوع موجود
    let current = 0;
    const thisWeek = toLocalWeekKey(new Date());
    if (weekSet.has(thisWeek)) {
      const cursor = startOfLocalWeek(new Date());
      while (weekSet.has(toLocalWeekKey(cursor))) {
        current++;
        cursor.setDate(cursor.getDate() - 7);
      }
    }

    // longest
    const allWeeks = Array.from(weekSet)
      .sort()
      .map((s) => new Date(s));
    let longest = allWeeks.length ? 1 : 0;
    let run = longest;
    for (let i = 1; i < allWeeks.length; i++) {
      const prev = allWeeks[i - 1];
      const cur = allWeeks[i];
      const diffDays = Math.round((+cur - +prev) / 86400000);
      if (diffDays === 7) {
        run++;
        if (run > longest) longest = run;
      } else run = 1;
    }
    return { current, longest };
  }

  // ===== DAILY (LOCAL) =====
  const daySet = new Set(
    entries.map((e) => toLocalDayKey(new Date(e.createdAt)))
  );

  const todayKey = toLocalDayKey(new Date());
  if (!daySet.has(todayKey)) {
    // no entry today → current = 0, لكن نحسب longest
    const allDays = Array.from(daySet)
      .sort()
      .map((s) => new Date(s));
    let longest = allDays.length ? 1 : 0;
    let run = longest;
    for (let i = 1; i < allDays.length; i++) {
      const prev = allDays[i - 1];
      const cur = allDays[i];
      const diff = Math.round((+cur - +prev) / 86400000);
      if (diff === 1) {
        run++;
        if (run > longest) longest = run;
      } else run = 1;
    }
    return { current: 0, longest };
  }

  // Count consecutive days including today
  let current = 0;
  const today = startOfLocalDay(new Date());
  for (let offset = 0; offset < 400; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    if (daySet.has(toLocalDayKey(d))) current++;
    else break;
  }

  // longest
  const allDays = Array.from(daySet)
    .sort()
    .map((s) => new Date(s));
  let longest = allDays.length ? 1 : 0;
  let run = longest;
  for (let i = 1; i < allDays.length; i++) {
    const prev = allDays[i - 1];
    const cur = allDays[i];
    const diff = Math.round((+cur - +prev) / 86400000);
    if (diff === 1) {
      run++;
      if (run > longest) longest = run;
    } else run = 1;
  }
  return { current, longest };
};
