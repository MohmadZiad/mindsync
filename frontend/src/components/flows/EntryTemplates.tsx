"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { useI18n } from "@/ui/i18n";

export function EntryTemplates() {
  const { setValue, watch } = useFormContext<any>();
  const { lang } = useI18n();

  const tplNote =
    lang === "ar"
      ? `✓ إنجاز: ...\n✗ ما زبط: ...\n→ خطوة بكرة: ...`
      : `✓ Win: ...\n✗ Didn't work: ...\n→ Next step: ...`;

  function appendNote(text: string) {
    const base = (watch("note") || "").trim();
    setValue("note", base ? base + "\n\n" + text : text, { shouldDirty: true });
  }

  function setQty(q: number) {
    setValue("quantity", q, { shouldDirty: true });
  }

  function setStatus(s: "done" | "partial" | "skipped") {
    setValue("status", s, { shouldDirty: true });
  }

  const L = {
    template: lang === "ar" ? "قالب" : "Template",
    mood: lang === "ar" ? "الحالة" : "Status",
    qty: lang === "ar" ? "كمية" : "Quantity",
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label">{L.template}:</span>
      <button
        type="button"
        className="chip"
        onClick={() => appendNote(tplNote)}
      >
        {lang === "ar" ? "مراجعة اليوم" : "Daily review"}
      </button>

      <span className="label ml-2">{L.mood}:</span>
      <button type="button" className="chip" onClick={() => setStatus("done")}>
        🎉
      </button>
      <button
        type="button"
        className="chip"
        onClick={() => setStatus("partial")}
      >
        🙂
      </button>
      <button
        type="button"
        className="chip"
        onClick={() => setStatus("skipped")}
      >
        😐
      </button>

      <span className="label ml-2">{L.qty}:</span>
      {[5, 10, 20, 30].map((q) => (
        <button
          key={q}
          type="button"
          className="chip"
          onClick={() => setQty(q)}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
