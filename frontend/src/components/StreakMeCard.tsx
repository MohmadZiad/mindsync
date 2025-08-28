"use client";
import React, { useEffect, useState } from "react";
import { Card } from "./card";
import { api } from "@/services/api";
import { streaksService, type Streak } from "@/services/streaks";

type Habit = { id: string; name: string };

export default function StreakMeCard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitId, setHabitId] = useState<string | null>(null);

  const [s, setS] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 1) fetch habits and select the first one automatically
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const hs = await api.get<Habit[]>("/habits");
        if (!alive) return;
        setHabits(hs);
        if (hs[0]?.id) setHabitId(hs[0].id);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to fetch habits");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 2) fetch streak for selected habit
  useEffect(() => {
    if (!habitId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await streaksService.byHabit(habitId);
        if (alive) setS(r);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to fetch streak");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [habitId]);

  return (
    <Card title="Streak الشخصي">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">العادة</span>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={habitId ?? ""}
          onChange={(e) => setHabitId(e.target.value)}
        >
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>جاري...</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : s ? (
        <div className="text-2xl font-bold">
          🔥 {s.current ?? 0} يوم متواصل
          <div className="text-sm text-gray-500">
            أطول سلسلة: {s.longest ?? 0} يوم
          </div>
        </div>
      ) : (
        <div className="text-2xl font-bold">🔥 0 يوم متواصل</div>
      )}
    </Card>
  );
}
