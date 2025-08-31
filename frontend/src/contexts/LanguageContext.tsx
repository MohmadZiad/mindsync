"use client";
import * as React from "react";
type Lang = "en" | "ar";
const LangContext = React.createContext<{lang:Lang; setLang:(l:Lang)=>void}>({lang:"en", setLang:()=>{}});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Lang>(() =>
    typeof window !== "undefined" ? ((localStorage.getItem("lang") as Lang) || "en") : "en"
  );
  React.useEffect(() => {
    localStorage.setItem("lang", lang);
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang(){ return React.useContext(LangContext); }
