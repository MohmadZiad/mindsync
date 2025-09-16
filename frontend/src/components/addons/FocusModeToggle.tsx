"use client";
import { useEffect, useState } from "react";

export default function FocusModeToggle({
  lang="en",
}: { lang?: "en"|"ar" }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    document.documentElement.toggleAttribute("data-focus", on);
  }, [on]);

  return (
    <button className="chip" onClick={() => setOn(v=>!v)}>
      {on ? "🧘 " : "🎛️ "}
      {lang==="ar" ? (on ? "وضع التركيز مفعل" : "تفعيل وضع التركيز")
                   : (on ? "Focus mode ON" : "Enable focus mode")}
    </button>
  );
}
