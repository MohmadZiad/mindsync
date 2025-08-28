"use client";
import React, { useState } from "react";
import { entriesService } from "@/services/entries";
import { Card } from "./card";

export default function AiReflectionControls() {
  const [days, setDays] = useState<number>(1);
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [text, setText] = useState<string>(""); // نترك النص الحالي
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    try {
      setLoading(true);
      setErr(null);
      const res = await entriesService.aiReflection({ days, locale });
      setText(res.summary); // ✅ نعرض الناتج تحت الأزرار
    } catch (e: any) {
      const msg =
        e?.data?.error || e?.data?.message || e?.message || "فشل التوليد";
      setErr(msg);
      // لا تمسح النص الموجود؛ حتى لو ظهر 429 يظل الملخص السابق ظاهر
      console.error("AI reflection error:", e);
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
            onChange={(e) => setDays(parseInt(e.target.value || "1"))}
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

      {err && <div className="text-red-600 mt-2">{err}</div>}

      {text && (
        <div className="mt-3 p-3 bg-gray-50 border rounded whitespace-pre-wrap text-sm leading-6">
          {text}
        </div>
      )}
    </Card>
  );
}
