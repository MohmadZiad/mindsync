"use client";
import { useEffect, useRef } from "react";

type HotkeyHandler = (e: KeyboardEvent) => void;
type HotkeyMap = Record<string, HotkeyHandler>;
type HotkeyOptions = {
  enabled?: boolean;
  target?: EventTarget | null;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  when?: () => boolean;
  ignoreInInputs?: boolean;
};

export function useHotkeys(map: HotkeyMap, opts: HotkeyOptions = {}) {
  const {
    enabled = true,
    target = typeof window !== "undefined" ? (window as EventTarget) : null,
    preventDefault = true,
    stopPropagation = false,
    when,
    ignoreInInputs = true,
  } = opts;

  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    if (!enabled || !target) return;

    const normalize = (e: KeyboardEvent) => {
      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push("mod");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      parts.push(e.key.toLowerCase());
      return parts.join("+");
    };

    const handler = (e: KeyboardEvent) => {
      if (when && !when()) return;

      if (
        ignoreInInputs &&
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement ||
          (e.target as HTMLElement | null)?.isContentEditable)
      ) {
        return;
      }

      const key = normalize(e);
      const fn = mapRef.current[key] || mapRef.current[e.key.toLowerCase()];
      if (fn) {
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        fn(e);
      }
    };

    const el = target as unknown as {
      addEventListener: (t: string, l: any, o?: any) => void;
      removeEventListener: (t: string, l: any, o?: any) => void;
    };
    if (!el?.addEventListener) return;

    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [enabled, target, preventDefault, stopPropagation, when, ignoreInInputs]);
}
