export function cn(
  ...classes: Array<
    | string
    | undefined
    | null
    | false
    | Record<string, boolean | undefined | null>
    | Array<string | undefined | null | false>
  >
): string {
  const out: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === "string") out.push(c);
    else if (Array.isArray(c)) out.push(...c.filter(Boolean) as string[]);
    else {
      for (const k in c) if (c[k]) out.push(k);
    }
  }
  return out.join(" ");
}
