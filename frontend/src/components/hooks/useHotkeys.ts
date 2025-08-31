"use client";
import { useEffect } from "react";

export function useHotkeys(map: Record<string, (e: KeyboardEvent) => void>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = [];
      if (e.ctrlKey || e.metaKey) k.push("mod");
      if (e.shiftKey) k.push("shift");
      k.push(e.key.toLowerCase());
      const key = k.join("+");
      const fn = map[key] || map[e.key.toLowerCase()];
      if (fn) {
        fn(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [map]);
}
