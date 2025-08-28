"use client";
import React, { useState } from "react";
import { entriesService } from "@/services/entries";
import { Card } from "./card";

export default function AiReflectionControls() {
  const [days, setDays] = useState<number>(7);
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    try {
      setLoading(true);
      setErr(null);
      setText("");
      const { reflection } = await entriesService.aiReflection({ days, locale });
      setText(reflection);
    } catch (e: any) {
      setErr(e?.message || "فشل التوليد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="AI Reflection (خيارات سريعة)">
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <label className="text-sm">
          الأيام
          <input
            type="number"
            min={1}
            max={90}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value || "7"))}
            className="ml-2 w-24 px-2 py-1 border rounded"
          />
        </label>

        <label className="text-sm">
          اللغة
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "ar" | "en")}
            className="ml-2 px-2 py-1 border rounded"
          >
            <option value="ar">عربي</option>
            <option value="en">English</option>
          </select>
        </label>

        <button
          className="px-3 py-1 border rounded"
          onClick={run}
          disabled={loading}
        >
          {loading ? "جاري..." : "توليد"}
        </button>
      </div>

      {err ? <div className="text-red-600 mt-2">{err}</div> : null}
      {text ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{text}</p>
      ) : null}
    </Card>
  );
}
