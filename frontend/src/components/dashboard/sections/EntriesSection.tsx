"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { Lang } from "@/components/DashboardMain";

const NoteModal = dynamic(() => import("@/components/NoteModal"), { ssr: false });

export default function EntriesSection(props: {
  lang?: Lang;
  i18n: {
    chooseHabit: string; mood: string; reflectionPh: string; addEntry: string;
    editEntry: string; deleteEntry: string; clearFilter: string;
  };
  locale: string;
  habits: any[];
  entries: any[];
  currentHabitId?: string | null;
  entryForm: { habitId: string; mood: string; reflection: string };
  setEntryForm: (v: any) => void;
  onAddEntry: () => Promise<void>;
  onEditEntry: (e: any) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onClearFilter: () => Promise<void>;
}) {
  const {
    lang, i18n, locale, habits, entries, currentHabitId, entryForm, setEntryForm,
    onAddEntry, onEditEntry, onDeleteEntry, onClearFilter,
  } = props;

  const [noteOpen, setNoteOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-2">
        <select className="input" value={entryForm.habitId}
          onChange={(e) => setEntryForm({ ...entryForm, habitId: e.target.value })}>
          <option value="">{i18n.chooseHabit}</option>
          {habits.map((h) => (<option key={h.id} value={h.id}>{h.icon ? `${h.icon} ${h.name}` : h.name}</option>))}
        </select>

        <select className="input" aria-label={i18n.mood} value={entryForm.mood}
          onChange={(e) => setEntryForm({ ...entryForm, mood: e.target.value })} title={i18n.mood}>
          <option value="🙂">🙂</option><option value="😐">😐</option><option value="😢">😢</option>
          <option value="😡">😡</option><option value="😴">😴</option><option value="🎉">🎉</option>
        </select>

        <button type="button" className="btn-secondary text-left" onClick={() => setNoteOpen(true)} title={i18n.reflectionPh}>
          {entryForm.reflection ? entryForm.reflection.slice(0, 40) + "…" : (lang === "ar" ? "ملاحظة ✍️" : "Note ✍️")}
        </button>

        <button className="btn-primary" onClick={onAddEntry}>{i18n.addEntry}</button>
      </div>

      {noteOpen && (
        <NoteModal
          lang={lang}
          defaultText={entryForm.reflection || ""}
          onCancel={() => setNoteOpen(false)}
          onSave={(payload: any) => {
            setEntryForm({ ...entryForm, reflection: payload.text });
            setNoteOpen(false);
          }}
        />
      )}

      <ul className="divide-y divide-[var(--line)] border border-[var(--line)] rounded-2xl overflow-hidden">
        {entries.map((e) => (
          <li key={e.id} className="p-3 bg-[var(--bg-1)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm">
                  <span className="font-medium">{e.mood}</span>
                  <span className="opacity-70"> — {new Date(e.createdAt).toLocaleString(locale)}</span>
                </div>
                {e.reflection && <div className="text-xs text-[var(--ink-1)]/90">{e.reflection}</div>}
              </div>
              <div className="flex gap-2">
                <button className="text-sm px-2 py-1 border rounded" onClick={() => onEditEntry(e)}>{i18n.editEntry}</button>
                <button className="text-sm px-2 py-1 rounded bg-red-600 text-white" onClick={() => onDeleteEntry(e.id)}>
                  {i18n.deleteEntry}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {currentHabitId && (
        <button className="btn-secondary" onClick={onClearFilter}>
          {i18n.clearFilter}
        </button>
      )}
    </div>
  );
}
