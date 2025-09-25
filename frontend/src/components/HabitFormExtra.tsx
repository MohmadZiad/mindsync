"use client";
import * as React from "react";
import NoteModal, { NotePayload } from "@/components/NoteModal";
import EmojiPickerButton from "@/components/EmojiPickerButton";
import { useI18n } from "@/components/ui/i18n";

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

const TEX: Record<Lang, Record<string, string>> = {
  en: {
    freq: "Frequency",
    daily: "Daily",
    weekly: "Weekly",
    desc: "Description",
    optional: "Optional",
    icon: "Icon",
    note: "Note ✍️",
    openNote: "Open note editor",
    emojiHint: "Pick the emoji that represents the habit",
    previewImg: "attachment image",
    previewDraw: "drawing",
  },
  ar: {
    freq: "التكرار",
    daily: "يومي",
    weekly: "أسبوعي",
    desc: "الوصف",
    optional: "اختياري",
    icon: "الأيقونة",
    note: "ملاحظة ✍️",
    openNote: "افتح محرّر الملاحظة",
    emojiHint: "اختر الإيموجي الذي يعبّر عن العادة",
    previewImg: "صورة مرفقة",
    previewDraw: "رسم مرفق",
  },
};

export default function HabitFormExtra({
  value,
  onChange,
  lang,
}: {
  value: HabitExtra;
  onChange: (v: HabitExtra) => void;
  lang?: Lang;
}) {
  const i18n = useI18n?.();
  const resolvedLang: Lang = (lang || i18n?.lang || "en") as Lang;
  const t = TEX[resolvedLang];

  const [openNote, setOpenNote] = React.useState(false);
  const freqId = React.useId();
  const descBtnId = React.useId();
  const iconId = React.useId();

  return (
    <div className="space-y-4" dir={resolvedLang === "ar" ? "rtl" : "ltr"}>
      {/* Frequency */}
      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
        <label htmlFor={freqId} className="text-sm text-[var(--ink-2)]">
          {t.freq}
        </label>
        <select
          id={freqId}
          className="input"
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

      {/* Description + Note modal */}
      <div className="grid grid-cols-[120px_1fr_auto] items-center gap-2">
        <span className="text-sm text-[var(--ink-2)]">{t.desc}</span>

        <button
          id={descBtnId}
          type="button"
          className="btn-secondary truncate text-left"
          onClick={() => setOpenNote(true)}
          title={t.openNote}
          aria-haspopup="dialog"
          aria-expanded={openNote}
        >
          {value.description?.trim()
            ? value.description
            : `${t.optional} — ${t.note}`}
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setOpenNote(true)}
          title={t.openNote}
          aria-describedby={descBtnId}
        >
          {t.note}
        </button>
      </div>

      {/* Icon via EmojiPicker */}
      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
        <label htmlFor={iconId} className="text-sm text-[var(--ink-2)]">
          {t.icon}
        </label>
        <div className="flex items-center gap-3">
          <EmojiPickerButton
            lang={resolvedLang}
            value={value.icon || undefined}
            onChange={(emoji) => onChange({ ...value, icon: emoji })}
          />
          <span className="text-sm text-[var(--ink-2)]">{t.emojiHint}</span>
        </div>
      </div>

      {/* Attachments preview */}
      {(value.attachments?.imageDataUrl ||
        value.attachments?.drawingDataUrl) && (
        <div className="flex flex-wrap gap-3 pt-1">
          {value.attachments?.imageDataUrl && (
            <img
              src={value.attachments.imageDataUrl}
              alt={t.previewImg}
              className="h-16 w-16 rounded-lg border object-cover"
            />
          )}
          {value.attachments?.drawingDataUrl && (
            <img
              src={value.attachments.drawingDataUrl}
              alt={t.previewDraw}
              className="h-16 w-16 rounded-lg border object-cover"
            />
          )}
        </div>
      )}

      {/* Note modal */}
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
