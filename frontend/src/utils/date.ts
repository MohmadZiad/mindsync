export const DAY = 24 * 60 * 60 * 1000;

export function startOfWeek(d = new Date()): Date {
  const date = new Date(d);

  const day = date.getDay(); 
  const diff = day * DAY;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0 - diff);
}

export function endOfWeek(d = new Date()): Date {
  const s = startOfWeek(d);
  return new Date(s.getTime() + 7 * DAY - 1); 
}

export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function inRange(ts: number, start: Date, end: Date) {
  return ts >= start.getTime() && ts <= end.getTime();
}
