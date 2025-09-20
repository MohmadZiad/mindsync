"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setMood } from "@/redux/slices/uiSlice";

type Mood = "calm" | "focus" | "energy" | "soft";
const MOOD_CLASSES = ["mood-calm", "mood-focus", "mood-energy", "mood-soft"] as const;
const STORAGE_KEY = "mindsync:mood";

export default function MoodBody() {
  const dispatch = useAppDispatch();
  const mood = (useAppSelector((s) => s.ui?.mood) ?? "calm") as Mood;

  // 1) On first mount, hydrate Redux from localStorage (if present)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Mood | null;
      if (saved && ["calm", "focus", "energy", "soft"].includes(saved) && saved !== mood) {
        dispatch(setMood(saved));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Reflect Redux mood to <body> and persist
  useEffect(() => {
    const b = document.body;
    if (!b) return;

    b.classList.add("moodify-all");
    MOOD_CLASSES.forEach((c) => b.classList.remove(c));
    b.classList.add(`mood-${mood}`);

    try {
      localStorage.setItem(STORAGE_KEY, mood);
    } catch {}
  }, [mood]);

  return null;
}
