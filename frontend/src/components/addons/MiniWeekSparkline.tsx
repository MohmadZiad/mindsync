"use client";
import { useMemo } from "react";

export default function MiniWeekSparkline({ points }: { points: number[] }) {
  const max = Math.max(1, ...points);
  const d = useMemo(() => {
    const w = 100, h = 24, step = w/(points.length-1);
    return points.map((v,i) => `${i===0?"M":"L"} ${i*step},${h-(v/max)*h}`).join(" ");
  }, [points, max]);
  return (
    <svg viewBox="0 0 100 24" className="w-28 h-6">
      <path d={d} fill="none" stroke="url(#g1)" strokeWidth="2" />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6D5EF1"/><stop offset="100%" stopColor="#F15ECC"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
