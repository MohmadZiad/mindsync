"use client";
import React, { useEffect, useState } from "react";
import { entriesService, type WeeklyGroupedResp } from "@/services/entries";
import { Card } from "./card";

export default function WeeklyGrouped() {
  const [data, setData] = useState<WeeklyGroupedResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await entriesService.weeklyGrouped();
        if (mounted) setData(res);
      } catch (e: any) {
        setError(e?.message || "فشل الجلب");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <Card title="إدخالات هذا الأسبوع حسب العادات">
        <div>جاري التحميل...</div>
      </Card>
    );

  if (error)
    return (
      <Card title="إدخالات هذا الأسبوع حسب العادات">
        <div className="text-red-600">{error}</div>
      </Card>
    );

  if (!data || data.length === 0)
    return (
      <Card title="إدخالات هذا الأسبوع حسب العادات">
        <div>لا يوجد إدخالات هذا الأسبوع.</div>
      </Card>
    );

  const locale =
    typeof navigator !== "undefined" ? navigator.language : "en-US";

  return (
    <Card title="إدخالات هذا الأسبوع حسب العادات">
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((group) => (
          <div
            key={group.habit.id}
            className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{group.habit.name}</div>
              <div className="text-xs text-zinc-500">
                {group.entries.length} إدخال
              </div>
            </div>

            <ul className="space-y-2">
              {group.entries.map((e) => (
                <li key={e.id} className="text-sm flex items-start gap-2">
                  <span className="inline-block shrink-0 mt-1 w-2 h-2 rounded-full bg-zinc-400" />
                  <div>
                    <div className="font-semibold">الحالة: {e.mood}</div>
                    {e.reflection ? (
                      <div className="text-zinc-600 dark:text-zinc-300">
                        {e.reflection}
                      </div>
                    ) : null}
                    <div className="text-[11px] text-zinc-500">
                      {e.createdAt
                        ? new Date(e.createdAt).toLocaleString(locale, {
                            hour12: false,
                          })
                        : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
