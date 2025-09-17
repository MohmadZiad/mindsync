"use client";
import * as React from "react";

type Lang = "en" | "ar";
type Variant = "chip" | "button";

export interface FocusModeToggleProps {
  lang?: Lang;
  variant?: Variant; // chip (افتراضي) أو button
  className?: string;
}

export default function FocusModeToggle({
  lang = "ar",
  variant = "chip",
  className,
}: FocusModeToggleProps) {
  const [on, setOn] = React.useState<boolean>(false);
  const dir = lang === "ar" ? "rtl" : "ltr";

  // اقرأ الحالة المحفوظة
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("ms_focus");
      if (saved) setOn(saved === "1");
    } catch {}
  }, []);

  // طبّق الحالة على <html> وخزّنها
  React.useEffect(() => {
    const root = document.documentElement;
    if (on) root.setAttribute("data-focus", "true");
    else root.removeAttribute("data-focus");
    try {
      localStorage.setItem("ms_focus", on ? "1" : "0");
      // خلي Providers أو تبويبات ثانية تتزامن
      window.dispatchEvent(new StorageEvent("storage", { key: "ms_focus" }));
    } catch {}
  }, [on]);

  const labelOn = lang === "ar" ? "وضع التركيز مفعّل" : "Focus mode ON";
  const labelOff = lang === "ar" ? "تفعيل وضع التركيز" : "Enable focus mode";
  const aria = on ? labelOn : labelOff;

  const base = variant === "button" ? "btn-secondary" : "chip"; // استخدم كلاساتك الجاهزة من globals.css

  return (
    <button
      type="button"
      dir={dir}
      className={`${base} ${className || ""}`}
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      aria-label={aria}
      title={aria}
    >
      <span className={lang === "ar" ? "ml-1" : "mr-1"}>
        {on ? "🧘" : "🎛️"}
      </span>
      {lang === "ar"
        ? on
          ? "وضع التركيز"
          : "تفعيل التركيز"
        : on
        ? "Focus"
        : "Focus Mode"}
    </button>
  );
}
