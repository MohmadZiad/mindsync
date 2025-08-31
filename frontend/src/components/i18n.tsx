"use client";
import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

export type Lang = "ar" | "en";

export const T = {
  en: {
    prev: "Previous",
    next: "Next",
    aiReflection: "AI Reflection (quick options)",
    days: "Days",
    language: "Language",
    generate: "Generate",
    overview: "Overview",
    habits: "Habits",
    entries: "Entries",
    reports: "Reports",
  },
  ar: {
    prev: "السابق",
    next: "التالي",
    aiReflection: "AI Reflection (خيارات سريعة)",
    days: "الأيام",
    language: "اللغة",
    generate: "توليد",
    overview: "تعريف وملخص",
    habits: "العادات",
    entries: "الإدخالات",
    reports: "التقارير",
  },
} as const;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: typeof T["en"];
};

function pickLang(): Lang {
  try {
    const ls = (typeof window !== "undefined"
      ? (localStorage.getItem("ms_lang") as Lang | null)
      : null) as Lang | null;
    const html =
      typeof document !== "undefined"
        ? (document.documentElement.getAttribute("lang") || "").toLowerCase()
        : "";
    const nav =
      typeof navigator !== "undefined"
        ? (navigator.language || "").toLowerCase()
        : "";

    if (ls === "ar" || ls === "en") return ls;
    if (html.startsWith("ar")) return "ar";
    if (html.startsWith("en")) return "en";
    if (nav.startsWith("ar")) return "ar";
    return "en";
  } catch {
    return "en";
  }
}

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(pickLang);

  // غيّر html/lang + dir واحفظ باللوكل ستوريج
  function apply(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("ms_lang", l);
      document.documentElement.lang = l === "ar" ? "ar" : "en";
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    } catch {}
  }

  // API خارجي نظيف
  const setLang = (l: Lang) => apply(l);
  const toggleLang = () => apply(lang === "ar" ? "en" : "ar");

  // sync عند تحميل
  useEffect(() => {
    apply(pickLang());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // اسمع تغييرات localStorage (تبويب آخر/سكريبت خارجي)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ms_lang") apply(pickLang());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // راقب تغييرات <html lang> (لو سكربت خارجي بدّلها)
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const obs = new MutationObserver(() => {
      const current = pickLang();
      setLangState((prev) => (prev === current ? prev : current));
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "dir"],
    });
    return () => obs.disconnect();
  }, []);

  const t = useMemo(() => T[lang], [lang]);
  const ctx = useMemo<Ctx>(() => ({ lang, setLang, toggleLang, t }), [lang, t]);

  return <I18nCtx.Provider value={ctx}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
