import React, { useState } from "react";
import NoteModal, { NotePayload } from "@/components/NoteModal";

export type HabitExtra = {
  frequency?: "daily" | "weekly";
  description?: string;
  icon?: string | null;
  attachments?: {
    imageDataUrl?: string | null;
    drawingDataUrl?: string | null;
  };
};

type Lang = "en" | "ar";
const TEX = {
  en: {
    freq: "Frequency",
    daily: "Daily",
    weekly: "Weekly",
    desc: "Description",
    optional: "Optional",
    icon: "Icon",
    note: "Note ✍️",
  },
  ar: {
    freq: "التكرار",
    daily: "يومي",
    weekly: "أسبوعي",
    desc: "الوصف",
    optional: "اختياري",
    icon: "الأيقونة",
    note: "ملاحظة ✍️",
  },
} as const;

export default function HabitFormExtra({
  value,
  onChange,
  lang,
}: {
  value: HabitExtra;
  onChange: (v: HabitExtra) => void;
  lang?: Lang;
}) {
  const resolvedLang: Lang =
    lang ||
    (typeof document !== "undefined" &&
    (document.documentElement.lang === "ar" ||
      document.documentElement.dir === "rtl")
      ? "ar"
      : "en");
  const t = TEX[resolvedLang];

  const [openNote, setOpenNote] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[100px_1fr] items-center gap-2">
        <label className="text-sm opacity-70">{t.freq}</label>
        <select
          className="border p-2 rounded bg-[var(--bg-0)]"
          value={value.frequency || "daily"}
          onChange={(e) =>
            onChange({
              ...value,
              frequency: e.target.value as "daily" | "weekly",
            })
          }
        >
          <option value="daily">{t.daily}</option>
          <option value="weekly">{t.weekly}</option>
        </select>
      </div>

      <div className="grid grid-cols-[100px_1fr_auto] items-center gap-2">
        <label className="text-sm opacity-70">{t.desc}</label>
        <button
          type="button"
          className="border p-2 rounded bg-[var(--bg-0)] text-left truncate hover:ring-2 hover:ring-indigo-300 transition"
          onClick={() => setOpenNote(true)}
          title={t.note}
        >
          {value.description?.trim()
            ? value.description
            : `${t.optional} — ${t.note}`}
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-xl border bg-[var(--bg-1)] hover:bg-[var(--bg-0)] transition"
          onClick={() => setOpenNote(true)}
          title={t.note}
        >
          {t.note}
        </button>
      </div>

      <div className="grid grid-cols-[100px_1fr] items-center gap-2">
        <label className="text-sm opacity-70">{t.icon}</label>
        <input
          className="border p-2 rounded bg-[var(--bg-0)] w-28"
          placeholder="🙂"
          value={value.icon || ""}
          onChange={(e) => onChange({ ...value, icon: e.target.value || null })}
        />
      </div>

      {(value.attachments?.imageDataUrl ||
        value.attachments?.drawingDataUrl) && (
        <div className="flex flex-wrap gap-3 pt-1">
          {value.attachments?.imageDataUrl && (
            <img
              src={value.attachments.imageDataUrl}
              alt="attachment"
              className="h-16 w-16 rounded-lg border object-cover"
            />
          )}
          {value.attachments?.drawingDataUrl && (
            <img
              src={value.attachments.drawingDataUrl}
              alt="drawing"
              className="h-16 w-16 rounded-lg border object-cover"
            />
          )}
        </div>
      )}

      {openNote && (
        <NoteModal
          lang={resolvedLang}
          defaultText={value.description || ""}
          defaultImage={value.attachments?.imageDataUrl || null}
          defaultDrawing={value.attachments?.drawingDataUrl || null}
          onCancel={() => setOpenNote(false)}
          onSave={(payload: NotePayload) => {
            onChange({
              ...value,
              description: payload.text,
              attachments: {
                imageDataUrl: payload.imageDataUrl || null,
                drawingDataUrl: payload.drawingDataUrl || null,
              },
            });
            setOpenNote(false);
          }}
        />
      )}
    </div>
  );
}
