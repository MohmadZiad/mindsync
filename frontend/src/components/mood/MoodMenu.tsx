"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setMood } from "@/redux/slices/uiSlice";

type MoodKey = "calm" | "focus" | "energy" | "soft";

const OPTIONS: { key: MoodKey; label: string; emoji: string }[] = [
  { key: "calm",   label: "Calm",   emoji: "🫧" },
  { key: "focus",  label: "Focus",  emoji: "🎯" },
  { key: "energy", label: "Energy", emoji: "⚡" },
  { key: "soft",   label: "Soft",   emoji: "🌙" }, // ← كان "sad" وصححناه لـ soft
];

const STORAGE_KEY = "mindsync:mood";

export default function MoodMenu() {
  const current = (useAppSelector((s) => s.ui.mood) as MoodKey) || "calm";
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = OPTIONS.find((o) => o.key === current) ?? OPTIONS[0];

  const choose = (k: MoodKey) => {
    try {
      localStorage.setItem(STORAGE_KEY, k);
      // Broadcast to other trees/pages immediately (no refresh)
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: k }));
      window.dispatchEvent(new CustomEvent("ms:mood", { detail: k }));
    } catch {}
    dispatch(setMood(k));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/90 px-3 py-1 text-sm font-medium shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mood)] dark:border-gray-700 dark:bg-gray-900/80 dark:hover:bg-gray-800"
      >
        <span className="text-lg leading-none">{active.emoji}</span>
        <span className="hidden sm:inline text-mood">{active.label}</span>
        <ChevronDown size={14} className="opacity-60" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 p-1 shadow-xl backdrop-blur-md ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-900/95"
        >
          {OPTIONS.map((o) => {
            const isActive = o.key === current;
            return (
              <button
                key={o.key}
                role="menuitem"
                onClick={() => choose(o.key)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 ${isActive ? "ring-mood" : ""}`}
                style={isActive ? { color: "var(--mood)" } : undefined}
              >
                <span className="text-lg leading-none">{o.emoji}</span>
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
