// وحدات زمنية
export const MS = 1;
export const SECOND = 1000 * MS;
export const MIN = 60 * SECOND;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

// ========= الأدوات الأساسية المتوافقة مع كودك =========
export function startOfWeek(d: Date = new Date(), weekStartsOn: 0 | 1 = 0): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0: Sun .. 6: Sat
  const diff = (day - weekStartsOn + 7) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - diff);
  return date;
}

export function endOfWeek(d: Date = new Date(), weekStartsOn: 0 | 1 = 0): Date {
  const s = startOfWeek(d, weekStartsOn);
  return new Date(s.getTime() + WEEK - 1);
}

export function startOfMonth(d: Date = new Date()): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(1);
  return date;
}

export function endOfMonth(d: Date = new Date()): Date {
  const start = startOfMonth(d);
  start.setMonth(start.getMonth() + 1);
  return new Date(start.getTime() - 1);
}

export function inRange(ts: number, start: Date, end: Date): boolean {
  return ts >= start.getTime() && ts <= end.getTime();
}

// ========= إضافات مفيدة (غير كاسرة) =========
export function startOfDay(d: Date = new Date()): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}
export function endOfDay(d: Date = new Date()): Date {
  const s = startOfDay(d);
  return new Date(s.getTime() + DAY - 1);
}

export function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}
export function addMonths(d: Date, months: number): Date {
  const date = new Date(d);
  date.setMonth(date.getMonth() + months);
  return date;
}

export function startOfYear(d: Date = new Date()): Date {
  const date = new Date(d);
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}
export function endOfYear(d: Date = new Date()): Date {
  const s = startOfYear(d);
  s.setFullYear(s.getFullYear() + 1);
  return new Date(s.getTime() - 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function clampDate(d: Date, min: Date, max: Date): Date {
  const t = d.getTime();
  if (t < min.getTime()) return new Date(min);
  if (t > max.getTime()) return new Date(max);
  return new Date(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function parseISODate(s: string): Date | null {
  // "YYYY-MM-DD"
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

export function formatDate(
  d: Date,
  lang: "ar" | "en" = "en",
  opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" }
): string {
  const locale = lang === "ar" ? "ar" : "en";
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

export function getWeekNumber(d: Date, weekStartsOn: 0 | 1 = 0): number {
  const soY = startOfYear(d);
  const soW = startOfWeek(d, weekStartsOn);
  const diffDays = Math.floor((soW.getTime() - soY.getTime()) / DAY);
  return Math.floor(diffDays / 7) + 1;
}

export function getWeekRange(d: Date, weekStartsOn: 0 | 1 = 0): { start: Date; end: Date } {
  const start = startOfWeek(d, weekStartsOn);
  const end = new Date(start.getTime() + WEEK - 1);
  return { start, end };
}
