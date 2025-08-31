"use client";
import React, { useEffect, useState } from "react";
import { entriesService } from "@/services/entries";
import { Card } from "./card";
import { useI18n } from "@/components/i18n";

export default function AiReflectionControls() {
  const { t, lang } = useI18n(); // ⬅️ خذ اللغة والنصوص
  const [days, setDays] = useState<number>(1);
  const [locale, setLocale] = useState<"ar" | "en">(lang); // default = لغة التطبيق
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // لو المستخدم غيّر لغة التطبيق من الهيدر، خليه ينعكس هنا كـ default
  useEffect(() => {
    setLocale(lang);
  }, [lang]);

  async function run() {
    try {
      setLoading(true);
      setErr(null);
      const res = await entriesService.aiReflection({ days, locale });
      setText(res.summary);
    } catch (e: any) {
      const msg =
        e?.data?.error ||
        e?.data?.message ||
        e?.message ||
        (lang === "ar" ? "فشل التوليد" : "Generation failed");
      setErr(msg);
      console.error("AI reflection error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title={t.aiReflection}>
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <label className="text-sm">
          {t.days}
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
          {t.language}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "ar" | "en")}
            className="ml-2 px-2 py-1 border rounded"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </label>

        <button
          className="px-3 py-1 border rounded"
          onClick={run}
          disabled={loading}
        >
          {loading ? (lang === "ar" ? "جاري..." : "Working…") : t.generate}
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
