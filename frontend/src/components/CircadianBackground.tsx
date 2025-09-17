"use client";
import * as React from "react";


export default function CircadianBackground({
  className,
}: { className?: string }) {
  const [hour, setHour] = React.useState<number>(new Date().getHours());

  React.useEffect(() => {
    const id = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  const stops =
    hour < 6
      ? ["#0b1020", "#1a1f3c"] 
      : hour < 11
      ? ["#c1d8ff", "#f5f3ff"] 
      : hour < 17
      ? ["#b7e3ff", "#ffe7f3"] 
      : hour < 20
      ? ["#fdd3a9", "#ffd6e8"] 
      : ["#0f1224", "#1b1f38"]; 

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 blur-[60px] saturate-[.9] ${className || ""}`}
      style={{
        background:
          `radial-gradient(40% 40% at 20% 15%, ${stops[0]} 0%, transparent 60%),` +
          `radial-gradient(35% 35% at 80% 10%, ${stops[1]} 0%, transparent 60%),` +
          `linear-gradient(180deg, ${stops[0]}10 0%, ${stops[1]} 100%)`,
      }}
    />
  );
}
