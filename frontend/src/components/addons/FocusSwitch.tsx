"use client";
import { useEffect, useState } from "react";

export default function FocusSwitch() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const root = document.querySelector("main");
    if (!root) return;
    on ? root.classList.add("focus-mode") : root.classList.remove("focus-mode");
  }, [on]);
  return (
    <button className="btn-secondary" onClick={() => setOn(v=>!v)}>
      {on ? "وضع عادي" : "وضع تركيز"}
    </button>
  );
}
