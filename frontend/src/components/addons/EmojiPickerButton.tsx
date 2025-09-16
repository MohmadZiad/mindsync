"use client";
import { useEffect, useRef, useState } from "react";

const EMOJIS = ["📌","✅","🔥","🌱","🧠","💪","📚","🧘","🚴","🥗","💧","🛏️","⏱️","🧩","🎯","📆"];

export default function EmojiPickerButton({
  value,
  onPick,
  lang="en",
}: {
  value?: string|null;
  onPick: (e: string) => void;
  lang?: "en"|"ar";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as any)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref} dir={lang==="ar"?"rtl":"ltr"}>
      <button type="button" className="chip" onClick={() => setOpen(v=>!v)}>
        {value ?? "🙂"} {lang==="ar" ? "إيموجي" : "Emoji"}
      </button>
      {open && (
        <div className="absolute z-30 mt-2 rounded-xl border border-[var(--line)] bg-[var(--bg-1)] shadow-soft p-2 grid grid-cols-8 gap-1">
          {EMOJIS.map(e => (
            <button
              key={e}
              className="rounded-lg hover:bg-[var(--bg-2)] p-1"
              onClick={() => { onPick(e); setOpen(false); }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
