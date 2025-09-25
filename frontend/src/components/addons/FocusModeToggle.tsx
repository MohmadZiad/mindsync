// components/addons/FocusModeToggle.tsx
"use client";

import * as React from "react";

type Lang = "en" | "ar";
type Variant = "chip" | "button";

export interface FocusModeToggleProps {
  lang?: Lang;
  variant?: Variant; // "chip" (default) or "button"
  className?: string;
}

const KEY = "ms-focus"; // ✅ نفس المفتاح الذي يقرأه RootLayout/Providers

export default function FocusModeToggle({
  lang = "ar",
  variant = "chip",
  className,
}: FocusModeToggleProps) {
  const [on, setOn] = React.useState(false);
  const dir = lang === "ar" ? "rtl" : "ltr";

  // اقرأ الحالة مرة بعد الماونت (بدون لمس DOM أثناء render)
  React.useEffect(() => {
    try {
      setOn(localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  // طبّق + خزّن + بلّغ بقية الأجزاء بعد أي تغيير
  React.useEffect(() => {
    const root = document.documentElement;
    if (on) root.setAttribute("data-focus", "true");
    else root.removeAttribute("data-focus");
    try {
      localStorage.setItem(KEY, on ? "1" : "0");
      window.dispatchEvent(new CustomEvent("ms:focus", { detail: on }));
    } catch {}
  }, [on]);

  const labelOn = lang === "ar" ? "وضع التركيز مفعّل" : "Focus mode ON";
  const labelOff = lang === "ar" ? "تفعيل وضع التركيز" : "Enable focus mode";
  const aria = on ? labelOn : labelOff;
  const base = variant === "button" ? "btn-secondary" : "chip";

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
