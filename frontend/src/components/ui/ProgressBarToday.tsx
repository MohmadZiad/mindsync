export default function ProgressBarToday({
    done,
    total,
    label = "إنجاز اليوم",
  }: { done: number; total: number; label?: string }) {
    const pct = total ? Math.round((done/total)*100) : 0;
    return (
      <div className="rounded-2xl border border-[var(--line)] p-4 bg-[var(--bg-1)] shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm opacity-75">⚡ {label}</div>
          <div className="text-sm font-semibold">{pct}%</div>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--bg-2)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg,#6D5EF1,#F15ECC)",
            }}
          />
        </div>
        <div className="mt-1 text-xs opacity-70">{done} / {total}</div>
      </div>
    );
  }
  