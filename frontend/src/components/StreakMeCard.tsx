"use client";
import React, { useEffect, useState } from "react";
import { streaksService, type Streak } from "@/services/streaks";
import { Card } from "./card";

export default function StreakMeCard() {
  const [s, setS] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await streaksService.me();
        if (m) setS(r);
      } catch (e: any) {
        setErr(e?.message || "فشل الجلب");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      m = false;
    };
  }, []);

  return (
    <Card title="Streak الشخصي">
      {loading ? (
        <div>جاري...</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : (
        <div className="text-2xl font-bold">{s?.count ?? 0} يوم متواصل</div>
      )}
    </Card>
  );
}
