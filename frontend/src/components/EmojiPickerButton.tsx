"use client";
import * as React from "react";

type Lang = "en" | "ar";

export interface EmojiPickerButtonProps {
  value?: string | null;
  onChange: (emoji: string) => void;
  lang?: Lang; // defaults to 'en'
  size?: "sm" | "md" | "lg"; // visual size only
  disabled?: boolean;
  className?: string;
}

/** Minimal emoji dataset (extend any time) */
type EmojiItem = {
  char: string;
  name_en: string;
  name_ar: string;
  kw?: string[];
};

const EMOJIS: EmojiItem[] = [
  {
    char: "✅",
    name_en: "check",
    name_ar: "صح",
    kw: ["done", "complete", "صح"],
  },
  { char: "🔥", name_en: "fire", name_ar: "نار", kw: ["streak", "تحفيز"] },
  { char: "💪", name_en: "muscle", name_ar: "عضلة", kw: ["gym", "قوة"] },
  { char: "🧠", name_en: "brain", name_ar: "دماغ", kw: ["focus", "تعلم"] },
  { char: "📚", name_en: "books", name_ar: "كتب", kw: ["study", "قراءة"] },
  { char: "📝", name_en: "note", name_ar: "مذكرة", kw: ["journal", "كتابة"] },
  { char: "☕", name_en: "coffee", name_ar: "قهوة", kw: ["morning", "قهوتي"] },
  { char: "🥗", name_en: "salad", name_ar: "سلطة", kw: ["health", "دايت"] },
  { char: "🏃", name_en: "run", name_ar: "جري", kw: ["cardio", "رياضة"] },
  { char: "🧘", name_en: "meditate", name_ar: "تأمل", kw: ["breath", "هدوء"] },
  { char: "🕒", name_en: "time", name_ar: "وقت", kw: ["routine", "روتين"] },
  { char: "🌙", name_en: "sleep", name_ar: "نوم", kw: ["rest", "راحة"] },
  { char: "🚰", name_en: "water", name_ar: "ماء", kw: ["drink", "شرب"] },
  { char: "🍎", name_en: "apple", name_ar: "تفاح", kw: ["fruit", "غذاء"] },
  { char: "🏋️", name_en: "weights", name_ar: "حديد", kw: ["gym", "قوة"] },
  {
    char: "📵",
    name_en: "no phone",
    name_ar: "بدون هاتف",
    kw: ["focus", "تركيز"],
  },
  { char: "📅", name_en: "calendar", name_ar: "تقويم", kw: ["plan", "تخطيط"] },
  { char: "❤️", name_en: "heart", name_ar: "قلب", kw: ["health", "قلب"] },
  { char: "🎯", name_en: "target", name_ar: "هدف", kw: ["goal", "هدف"] },
  { char: "🌿", name_en: "herb", name_ar: "نبات", kw: ["nature", "طبيعة"] },
  { char: "🧩", name_en: "puzzle", name_ar: "أحجية", kw: ["brain", "تركيز"] },
  { char: "🧹", name_en: "clean", name_ar: "تنظيف", kw: ["house", "ترتيب"] },
  { char: "🧺", name_en: "laundry", name_ar: "غسيل", kw: ["home", "بيت"] },
  {
    char: "🧴",
    name_en: "skincare",
    name_ar: "عناية",
    kw: ["self-care", "نفس"],
  },
  { char: "📖", name_en: "read", name_ar: "قراءة", kw: ["book", "كتاب"] },
  {
    char: "🧪",
    name_en: "experiment",
    name_ar: "تجربة",
    kw: ["learn", "تعلّم"],
  },
  { char: "🚶", name_en: "walk", name_ar: "مشي", kw: ["steps", "خطوات"] },
  {
    char: "🧊",
    name_en: "cold shower",
    name_ar: "ماء بارد",
    kw: ["shower", "استحمام"],
  },
  {
    char: "🧯",
    name_en: "quit bad habit",
    name_ar: "أوقف عادة",
    kw: ["no", "توقف"],
  },
  { char: "🧑‍💻", name_en: "code", name_ar: "برمجة", kw: ["dev", "تطوير"] },
];

export default function EmojiPickerButton({
  value,
  onChange,
  lang = "en",
  size = "md",
  disabled,
  className,
}: EmojiPickerButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const id = React.useId();
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Close on outside click
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // Focus search when opened
  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const label = lang === "ar" ? "اختر الإيموجي" : "Pick an emoji";
  const searchPh =
    lang === "ar" ? "ابحث بالاسم أو الرمز..." : "Search by name or emoji...";

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMOJIS;
    return EMOJIS.filter((e) => {
      const hay = `${e.char} ${e.name_en} ${e.name_ar} ${(e.kw || []).join(
        " "
      )}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const sz =
    size === "sm"
      ? "h-9 w-9 text-xl"
      : size === "lg"
      ? "h-12 w-12 text-2xl"
      : "h-10 w-10 text-xl";

  return (
    <div
      ref={rootRef}
      className={`relative inline-block ${className || ""}`}
      dir={dir}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-label={label}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] hover:bg-[var(--bg-2)] ${sz} transition`}
      >
        <span className="leading-none">{value || "🙂"}</span>
      </button>

      {open && (
        <div
          id={`${id}-panel`}
          role="dialog"
          aria-label={label}
          className="absolute z-50 mt-2 w-72 rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-2 shadow-xl"
        >
          <div className="px-2 pb-2">
            <input
              ref={inputRef}
              dir={dir}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPh}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-0)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]"
              aria-label={searchPh}
            />
          </div>

          <div
            role="grid"
            className="max-h-64 overflow-auto px-1 pb-1"
            aria-describedby={`${id}-hint`}
          >
            <div className="grid grid-cols-8 gap-1.5">
              {filtered.map((e) => (
                <button
                  key={e.char + e.name_en}
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[var(--bg-2)] focus:bg-[var(--bg-2)] focus:outline-none"
                  aria-label={lang === "ar" ? e.name_ar : e.name_en}
                  onClick={() => {
                    onChange(e.char);
                    setOpen(false);
                  }}
                >
                  <span className="text-xl leading-none">{e.char}</span>
                </button>
              ))}
            </div>
          </div>

          <p id={`${id}-hint`} className="sr-only">
            {lang === "ar"
              ? "استخدم السهمين للتنقل واضغط إدخال للاختيار"
              : "Use arrow keys to navigate and Enter to select"}
          </p>
        </div>
      )}
    </div>
  );
}
