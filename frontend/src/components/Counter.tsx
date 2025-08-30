"use client";
import { useEffect, useState } from "react";

export default function Counter({
  to,
  duration = 1200,
  suffix = "",
  className = "",
}: {
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return (
    <span className={className}>
      {val.toLocaleString()}
      <span className="opacity-70">{suffix}</span>
    </span>
  );
}
