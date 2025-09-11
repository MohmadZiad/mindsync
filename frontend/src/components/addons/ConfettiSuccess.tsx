"use client";
import { useEffect } from "react";

export default function ConfettiSuccess() {
  useEffect(() => {
    const handler = () => {
      try {
        const duration = 600;
        const end = Date.now() + duration;

        (function frame() {
          const div = document.createElement("div");
          div.style.position = "fixed";
          div.style.left = (Math.random() * 100) + "vw";
          div.style.top = "0";
          div.style.width = "6px";
          div.style.height = "10px";
          div.style.background = "hsl(" + Math.floor(Math.random() * 360) + " 90% 60%)";
          div.style.opacity = "0.9";
          div.style.borderRadius = "2px";
          div.style.zIndex = "9999";
          document.body.appendChild(div);

          const y = window.innerHeight + 40;
          const t = 700 + Math.random() * 600;
          div.animate(
            [{ transform: "translateY(0px)" }, { transform: `translateY(${y}px)` }],
            { duration: t, easing: "cubic-bezier(.25,.7,.25,1)" }
          ).onfinish = () => div.remove();

          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      } catch {}
    };

    window.addEventListener("ms:entry-added", handler);
    return () => window.removeEventListener("ms:entry-added", handler);
  }, []);

  return null;
}
