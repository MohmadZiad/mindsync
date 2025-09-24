"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { entriesService } from "@/services/entries";
import { Card } from "./card";
import { useI18n } from "@/ui/i18n";

export default function AiReflectionControls() {
  const { t, lang } = useI18n();
  const [days, setDays] = useState<number>(1);
  const [locale, setLocale] = useState<"ar" | "en">(lang);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => setLocale(lang), [lang]);

  const safeDays = useMemo(() => Math.min(90, Math.max(1, Number(days) || 1)), [days]);

  async function run() {
    try {
      setLoading(true);
      setErr(null);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await entriesService.aiReflection(
        { days: safeDays, locale },
        // @ts-expect-error optional signal in your impl
        { signal: abortRef.current.signal }
      );

      setText(res.summary ?? "");
      if (!res.summary) {
        setErr(lang === "ar" ? "لا يوجد محتوى لعرضه" : "No content to show");
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
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

  function onKey(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter" && !loading) {
      e.preventDefault();
      run();
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <Card
      title={t.aiReflection}
      right={
        <span
          className="text-xs text-muted"
          title={lang === "ar" ? "اختصار: Ctrl/Cmd + Enter" : "Shortcut: Ctrl/Cmd + Enter"}
        >
          ⌘/Ctrl+↵
        </span>
      }
    >
      <div className="flex flex-col sm:flex-row gap-2 items-center" onKeyDown={onKey}>
        <label className="text-sm flex items-center gap-2">
          {t.days}
          <input
            type="number"
            min={1}
            max={90}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value || "1", 10))}
            className="input w-24"
            aria-label={t.days}
          />
        </label>

        <label className="text-sm flex items-center gap-2">
          {t.language}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "ar" | "en")}
            className="input"
            aria-label={t.language}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </label>

        <div className="ms-auto flex gap-2">
          <button
            className="btn btn-primary touch"
            onClick={run}
            disabled={loading}
            title={lang === "ar" ? "توليد الملخص" : "Generate summary"}
          >
            {loading ? (lang === "ar" ? "جاري..." : "Working…") : t.generate}
          </button>

          <button
            className="btn btn-muted touch"
            onClick={() => setText("")}
            disabled={!text || loading}
            title={lang === "ar" ? "مسح" : "Clear"}
          >
            {lang === "ar" ? "مسح" : "Clear"}
          </button>

          <button
            className="btn btn-muted touch"
            onClick={copy}
            disabled={!text || loading}
            title={lang === "ar" ? "نسخ" : "Copy"}
          >
            {copied ? (lang === "ar" ? "نُسخ ✓" : "Copied ✓") : (lang === "ar" ? "نسخ" : "Copy")}
          </button>
        </div>
      </div>

      {err && (
        <div
          className="mt-3 rounded-lg border border-[var(--danger)]/30 bg-red-50/70 dark:bg-red-950/20 px-3 py-2 text-sm"
          role="alert"
        >
          {err}
        </div>
      )}

      <div className="mt-3">
        {loading ? (
          <div className="skeleton h-24 rounded-lg" />
        ) : text ? (
          <div className="p-3 bg-[var(--bg-2)] border border-base rounded-lg whitespace-pre-wrap text-sm leading-6">
            {text}
          </div>
        ) : (
          <div className="text-xs text-muted">
            {lang === "ar"
              ? "اختر عدد الأيام واللغة ثم اضغط توليد."
              : "Choose days & language, then press Generate."}
          </div>
        )}
      </div>
    </Card>
  );
}
