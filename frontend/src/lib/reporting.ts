export function dateKey(d: Date) {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  
  export function groupEntriesDaily(entries: { createdAt: string }[]) {
    const map: Record<string, number> = {};
    for (const e of entries) {
      const k = dateKey(new Date(e.createdAt));
      map[k] = (map[k] || 0) + 1;
    }
    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  }
  
  export function wordsFromNotes(entries: { reflection?: string | null }[]) {
    const freq: Record<string, number> = {};
    const stop = new Set(["و", "في", "من", "على", "الى", "عن", "with", "the", "and", "for", "to", "a"]);
    entries.forEach((e) => {
      (e.reflection || "")
        .toLowerCase()
        .replace(/[^[\u0600-\u06FF\w\s]]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .forEach((w) => {
          if (stop.has(w)) return;
          freq[w] = (freq[w] || 0) + 1;
        });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 120)
      .map(([text, value]) => ({ text, value }));
  }
  