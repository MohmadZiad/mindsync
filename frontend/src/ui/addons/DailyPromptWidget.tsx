"use client";
import { useState, useEffect } from "react";

type Lang = "en" | "ar";
const T = {
  en: {
    title: "What will you do today?",
    placeholder: "Write a small intention for today…",
    add: "Save",
    clear: "Clear",
    open: "Open focus",
    modalTitle: "Today’s focus",
    start: "Start now",
    close: "Close",
    pin: "Pin",
    unpin: "Collapse",
    delete: "Delete",
    save: "Save",
    motos: [
      "Small steps, daily.",
      "Show up. Do one thing.",
      "Progress > perfection.",
      "You got this!",
    ],
  },
  ar: {
    title: "شو رح تعمل اليوم؟",
    placeholder: "اكتب نية صغيرة لليوم…",
    add: "حفظ",
    clear: "مسح",
    open: "افتح التركيز",
    modalTitle: "تركيز اليوم",
    start: "ابدأ الآن",
    close: "إغلاق",
    pin: "تثبيت",
    unpin: "تصغير",
    delete: "حذف",
    save: "حفظ",
    motos: [
      "خطوات صغيرة كل يوم.",
      "اظهر وسوّي شغلة وحدة.",
      "التقدّم أهم من الكمال.",
      "قدّها وقدود!",
    ],
  },
} as const;

interface Props {
  lang?: Lang;
  onStart?: () => void; // مثال: فتح تسجيل سريع
}

const LS_KEY_TEXT = "__ms.intent";
const LS_KEY_COLLAPSED = "__ms.intent.collapsed";

export default function DailyPromptWidget({ lang = "en", onStart }: Props) {
  const t = T[lang as Lang];
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [motoIdx, setMotoIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [draft, setDraft] = useState(""); // ✏️ مسودة للتعديل داخل المودال

  // load saved state
  useEffect(() => {
    const v = localStorage.getItem(LS_KEY_TEXT);
    if (v) setText(v);
    const c = localStorage.getItem(LS_KEY_COLLAPSED);
    if (c) setCollapsed(c === "1");
  }, []);

  const persist = (val: string) => {
    setText(val);
    localStorage.setItem(LS_KEY_TEXT, val);
  };
  const clear = () => {
    setText("");
    localStorage.removeItem(LS_KEY_TEXT);
    setCollapsed(false);
    localStorage.setItem(LS_KEY_COLLAPSED, "0");
  };

  // fresh moto when modal opens or language changes
  useEffect(() => {
    if (open) {
      const len = T[lang as Lang].motos.length;
      setMotoIdx(Math.floor(Math.random() * len));
      setDraft(text || ""); // حمّل المسودة من النص الحالي
    }
  }, [open, lang]); // eslint-disable-line

  // helper: preview 1-line for chip
  const preview =
    (text || "").trim().slice(0, lang === "ar" ? 28 : 36) +
    ((text || "").trim().length > (lang === "ar" ? 28 : 36) ? "…" : "");

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(LS_KEY_COLLAPSED, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* ====== Collapsed chip (small) ====== */}
      {collapsed && text ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-1)] px-3 py-2 text-sm flex items-center gap-2 hover:shadow-sm transition"
          title={t.open}
        >
          <span className="text-lg">⚡</span>
          <span className="truncate flex-1">{preview || t.title}</span>
          <span className="text-xs px-2 py-1 rounded-lg bg-[var(--bg-0)] border border-[var(--line)]">
            {t.open}
          </span>
        </button>
      ) : (
        /* ====== Full card ====== */
        <div className="rounded-2xl p-4 bg-[var(--brand-card)] border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold opacity-80">{t.title}</div>
            <div className="flex items-center gap-2">
              {text && (
                <button
                  onClick={toggleCollapsed}
                  className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)] text-sm"
                >
                  {collapsed ? t.pin : t.unpin}
                </button>
              )}
              <button
                onClick={() => setOpen(true)}
                className="px-3 py-1.5 rounded-xl border bg-[var(--bg-1)] text-sm"
                title={t.open}
              >
                {t.open}
              </button>
            </div>
          </div>

          <textarea
            className="mt-3 w-full min-h-[90px] rounded-xl border border-[var(--line)] bg-[var(--bg-0)] p-3 outline-none focus:ring-2 focus:ring-[var(--brand)]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
          />

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                persist(text);
                if (text.trim()) {
                  setCollapsed(true);
                  localStorage.setItem(LS_KEY_COLLAPSED, "1");
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[var(--brand)] text-white shadow hover:opacity-90 transition"
            >
              {t.add}
            </button>
            <button
              onClick={clear}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-1)] border border-[var(--line)]"
            >
              {t.clear}
            </button>
          </div>
        </div>
      )}

      {/* ====== Centered Modal (with edit) ====== */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          {/* panel */}
          <div className="relative w-[92%] max-w-[560px] bg-[var(--bg-0)] rounded-2xl border border-[var(--line)] shadow-2xl p-6 animate-pop">
            {/* header */}
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider opacity-70">
                  {t.modalTitle}
                </div>
                <div className="mt-1 text-xl font-bold">
                  {text ||
                    (lang === "ar"
                      ? "اكتب نيتك لليوم"
                      : "Write your intention")}
                </div>
                <div className="mt-2 text-sm opacity-80">
                  {T[lang as Lang].motos[motoIdx]}
                </div>
              </div>
            </div>

            {/* gradient rule */}
            <div className="mt-4 h-[6px] rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400" />

            {/* editable draft */}
            <textarea
              className="mt-4 w-full min-h-[100px] rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.placeholder}
            />

            {/* actions */}
            <div className="mt-5 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl border bg-[var(--bg-1)]"
              >
                {t.close}
              </button>
              <button
                onClick={() => {
                  clear(); // حذف نهائي
                  setDraft("");
                  setOpen(false);
                }}
                className="px-4 py-2 rounded-xl border bg-[var(--bg-1)]"
              >
                {t.delete}
              </button>
              <button
                onClick={() => {
                  const v = (draft || "").trim();
                  persist(v);
                  if (v) {
                    setCollapsed(true);
                    localStorage.setItem(LS_KEY_COLLAPSED, "1");
                    onStart?.(); // افتح الشيء اللي بدك يا بعد الحفظ
                  } else {
                    setCollapsed(false);
                    localStorage.setItem(LS_KEY_COLLAPSED, "0");
                  }
                  setOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:brightness-110"
              >
                {t.save}
              </button>
            </div>
          </div>

          {/* tiny animation */}
          <style jsx>{`
            .animate-pop {
              animation: popIn 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            @keyframes popIn {
              from {
                transform: translateY(8px) scale(0.98);
                opacity: 0;
              }
              to {
                transform: translateY(0) scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
