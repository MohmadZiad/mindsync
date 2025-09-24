"use client";
import React, { useState } from "react";
import { entriesService } from "@/services/entries";
import { Card } from "@/ui/Card";

export default function MonthlySummary() {
  // default: first day of current month -> today (yyyy-mm-dd)
  const [from, setFrom] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10)
  );
  const [to, setTo] = useState<string>(new Date().toISOString().slice(0, 10));
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    try {
      setLoading(true);
      setErr(null);
      setText("");

      // IMPORTANT: build local day bounds to avoid timezone shifts
      const start = new Date(`${from}T00:00:00.000`);
      const end = new Date(`${to}T23:59:59.999`);

      // send as ISO if your backend expects ISO strings
      const list = await entriesService.monthly(
        start.toISOString(),
        end.toISOString()
      );

      // optional: ensure order (oldest -> newest)
      const sorted = [...list].sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const count = sorted.length;
      const firstMood = sorted[0]?.mood ? `أول حالة: ${sorted[0].mood}` : "";
      const lastMood =
        sorted[count - 1]?.mood ? `آخر حالة: ${sorted[count - 1].mood}` : "";

      setText(`عدد الإدخالات: ${count}. ${firstMood} ${lastMood}`.trim());
    } catch (e: any) {
      setErr(e?.message || "فشل الجلب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="ملخّص شهري (حسب تاريخين)">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <label className="text-sm">
          من
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="ml-2 px-2 py-1 border rounded"
          />
        </label>
        <label className="text-sm">
          إلى
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="ml-2 px-2 py-1 border rounded"
          />
        </label>
        <button className="px-3 py-1 border rounded" disabled={loading}>
          {loading ? "جاري..." : "اعرض"}
        </button>
      </form>

      {err ? <div className="text-red-600 mt-2">{err}</div> : null}
      {text ? <p className="mt-3 text-sm">{text}</p> : null}
    </Card>
  );
}
