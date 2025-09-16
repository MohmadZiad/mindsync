import MiniWeekSparkline from "./MiniWeekSparkline";
export default function BestHabitCard({
  title,
  weekPoints,
  streak,
}: { title:string; weekPoints:number[]; streak:number }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] p-4 bg-[var(--bg-1)] shadow-soft card-hover">
      <div className="text-sm opacity-75 mb-1">🏆 أفضل عادة هذا الأسبوع</div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm opacity-70">🔥 {streak} أيام متواصلة</div>
        </div>
        <MiniWeekSparkline points={weekPoints}/>
      </div>
    </div>
  );
}
