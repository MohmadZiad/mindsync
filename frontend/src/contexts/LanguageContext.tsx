"use client";
import * as React from "react";

type Lang = "ar" | "en";
type Dir = "rtl" | "ltr";

type Ctx = {
  lang: Lang;
  dir: Dir;
  setLang: (lang: Lang) => void;
  toggle: () => void;
};

const LanguageContext = React.createContext<Ctx | null>(null);

function resolveDir(lang: Lang): Dir {
  return lang === "ar" ? "rtl" : "ltr";
}

function loadLang(): Lang {
  try {
    const saved = localStorage.getItem("ms_lang");
    if (saved === "ar" || saved === "en") return saved;
  } catch {}
  if (typeof navigator !== "undefined") {
    if ((navigator.language || "").toLowerCase().startsWith("ar")) return "ar";
  }
  return "en";
}

function applyToHtml(lang: Lang) {
  const dir = resolveDir(lang);
  const html = document.documentElement;
  html.setAttribute("lang", lang);
  html.setAttribute("dir", dir);
  html.setAttribute("data-lang", lang);
  html.setAttribute("data-dir", dir);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en");

  React.useEffect(() => {
    const initial = loadLang();
    setLangState(initial);
    applyToHtml(initial);
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("ms_lang", l);
    } catch {}
    applyToHtml(l);
  }, []);

  const toggle = React.useCallback(
    () => setLang(lang === "ar" ? "en" : "ar"),
    [lang, setLang]
  );

  const value = React.useMemo<Ctx>(
    () => ({ lang, dir: resolveDir(lang), setLang, toggle }),
    [lang, setLang, toggle]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Ctx {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    const lang: Lang =
      (typeof document !== "undefined" &&
        (document.documentElement.lang as Lang)) ||
      "en";
    const dir: Dir =
      (typeof document !== "undefined" &&
        (document.documentElement.dir as Dir)) ||
      "ltr";
    return {
      lang,
      dir,
      setLang: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}
