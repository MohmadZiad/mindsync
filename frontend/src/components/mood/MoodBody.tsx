"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setMood } from "@/redux/slices/uiSlice";

type Mood = "calm" | "focus" | "energy" | "soft";
const CLASSES = [
  "mood-calm",
  "mood-focus",
  "mood-energy",
  "mood-soft",
] as const;
const KEY = "mindsync:mood";

export default function MoodBody() {
  const dispatch = useAppDispatch();
  const mood = (useAppSelector((s) => s.ui?.mood) ?? "calm") as Mood;

  // Hydrate Redux from storage on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Mood | null;
      if (
        saved &&
        ["calm", "focus", "energy", "soft"].includes(saved) &&
        saved !== mood
      ) {
        dispatch(setMood(saved));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep body classes + storage in sync with Redux
  useEffect(() => {
    const b = document.body;
    if (!b) return;
    b.classList.add("moodify-all");
    CLASSES.forEach((c) => b.classList.remove(c));
    b.classList.add(`mood-${mood}`);
    try {
      localStorage.setItem(KEY, mood);
    } catch {}
  }, [mood]);

  // Listen to external mood changes (e.g., from another component/page)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue && e.newValue !== mood) {
        dispatch(setMood(e.newValue as Mood));
      }
    };
    const onCustom = (e: Event) => {
      const v = (e as CustomEvent).detail as Mood | undefined;
      if (v && v !== mood) dispatch(setMood(v));
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("ms:mood", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ms:mood", onCustom as EventListener);
    };
  }, [dispatch, mood]);

  return null;
}
