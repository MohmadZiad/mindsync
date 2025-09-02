export const DAY = 24 * 60 * 60 * 1000;

export function startOfWeek(
  d: Date = new Date(),
  weekStartsOn: 0 | 1 = 0
): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - diff);
  return date;
}

export function endOfWeek(d: Date = new Date(), weekStartsOn: 0 | 1 = 0): Date {
  const s = startOfWeek(d, weekStartsOn);
  return new Date(s.getTime() + 7 * DAY - 1);
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

export function inRange(ts: number, start: Date, end: Date) {
  return ts >= start.getTime() && ts <= end.getTime();
}
