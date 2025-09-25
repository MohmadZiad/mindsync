"use client";
import { useEffect, useMemo, useRef } from "react";

export type HotkeyHandler = (e: KeyboardEvent) => void;

export type HotkeyMap = Record<string, HotkeyHandler>;

export type HotkeyOptions = {
  enabled?: boolean;
  target?: EventTarget | null | (() => EventTarget | null);
  eventType?: "keydown" | "keyup";
  preventDefault?: boolean;
  stopPropagation?: boolean;
  when?: () => boolean;
  ignoreInInputs?: boolean;
  allowInInputsKeys?: string[]; 
  capture?: boolean;
};

function isEditableTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}

function normalizeKeyName(key: string): string {
  const k = key.toLowerCase();
  if (k === "arrowleft") return "left";
  if (k === "arrowright") return "right";
  if (k === "arrowup") return "up";
  if (k === "arrowdown") return "down";
  if (k === " ") return "space";
  if (k === "escape") return "esc";
  return k;
}

function canonicalCombo(combo: string): string {
  const parts = combo
    .trim()
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);

  const mods = new Set<string>();
  let key: string | null = null;

  for (const p of parts) {
    if (p === "ctrl" || p === "control" || p === "cmd" || p === "meta" || p === "mod") {
      mods.add("mod");
    } else if (p === "shift") {
      mods.add("shift");
    } else if (p === "alt" || p === "option") {
      mods.add("alt");
    } else {
      key = normalizeKeyName(p);
    }
  }

  const ordered: string[] = [];
  if (mods.has("mod")) ordered.push("mod");
  if (mods.has("shift")) ordered.push("shift");
  if (mods.has("alt")) ordered.push("alt");
  if (key) ordered.push(key);

  return ordered.join("+");
}

// من الحدث → صيغة قياسية
function canonicalFromEvent(e: KeyboardEvent): string {
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const mods: string[] = [];
  if ((isMac && e.metaKey) || (!isMac && e.ctrlKey)) mods.push("mod");
  if (e.shiftKey) mods.push("shift");
  if (e.altKey) mods.push("alt");
  const key = normalizeKeyName(e.key);
  return [...mods, key].join("+");
}

export function useHotkeys(map: HotkeyMap, opts: HotkeyOptions = {}) {
  const {
    enabled = true,
    target = typeof window !== "undefined" ? (window as EventTarget) : null,
    eventType = "keydown",
    preventDefault = true,
    stopPropagation = false,
    when,
    ignoreInInputs = true,
    allowInInputsKeys = ["esc"],
    capture = false,
  } = opts;

  const mapRef = useRef(map);
  mapRef.current = map;

  const canonicalMap = useMemo(() => {
    const out = new Map<string, HotkeyHandler>();
    for (const raw in map) {
      if (!Object.prototype.hasOwnProperty.call(map, raw)) continue;
      const handler = map[raw];
      const key = canonicalCombo(raw);
      if (key) out.set(key, handler);
      if (!raw.includes("+")) out.set(normalizeKeyName(raw), handler);
    }
    return out;
  }, [map]);

  const allowInInputsSet = useMemo(() => {
    const set = new Set<string>();
    for (const k of allowInInputsKeys) {
      set.add(canonicalCombo(k));
      if (!k.includes("+")) set.add(normalizeKeyName(k));
    }
    return set;
  }, [allowInInputsKeys]);

  useEffect(() => {
    if (!enabled) return;

    const tgt = typeof target === "function" ? target() : target;
    const el = tgt as unknown as {
      addEventListener?: (t: string, l: any, o?: any) => void;
      removeEventListener?: (t: string, l: any, o?: any) => void;
    };
    if (!el?.addEventListener) return;

    const handler = (e: KeyboardEvent) => {
      if (when && !when()) return;

      const combo = canonicalFromEvent(e);
      const keyOnly = normalizeKeyName(e.key);

      if (ignoreInInputs && isEditableTarget(e.target)) {
        if (!allowInInputsSet.has(combo) && !allowInInputsSet.has(keyOnly)) {
          return;
        }
      }

      const fn =
        canonicalMap.get(combo) ||
        canonicalMap.get(keyOnly);

      if (fn) {
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        fn(e);
      }
    };

    el.addEventListener(eventType, handler, { passive: false, capture });
    return () => el.removeEventListener?.(eventType, handler, { capture } as any);
  }, [
    enabled,
    target,
    eventType,
    preventDefault,
    stopPropagation,
    when,
    ignoreInInputs,
    allowInInputsSet,
    canonicalMap,
    capture,
  ]);
}
