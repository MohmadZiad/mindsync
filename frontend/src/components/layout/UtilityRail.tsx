"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, BookOpen, HelpCircle, X } from "lucide-react";

/**
 * UtilityRail
 * - desktopMode:
 *    - "fixed" (old behavior): fixed to viewport edge
 *    - "sticky": sticks while its parent section is visible
 *    - "absolute": positioned inside the parent section and scrolls away with it
 */
export default function UtilityRail({
  dir = "ltr",
  desktopMode = "absolute", // 👈 default changed so it won't stay on screen
}: {
  dir?: "ltr" | "rtl";
  desktopMode?: "fixed" | "sticky" | "absolute";
}) {
  const [open, setOpen] = useState(false);
  const side = dir === "rtl" ? "left" : "right";

  const items = [
    { href: "#features", label: "Features", icon: <BookOpen size={16} /> },
    { href: "#how", label: "How it works", icon: <HelpCircle size={16} /> },
    { href: "#pricing", label: "Pricing", icon: <Settings size={16} /> },
  ];

  // Edge alignment used by the "fixed" mode only
  const desktopSideOffset = "max((100vw - var(--wrap-max))/2 - 72px, 12px)";

  // Compute position classes for desktop
  const desktopPosition =
    desktopMode === "fixed"
      ? "fixed"
      : desktopMode === "sticky"
        ? "sticky top-28 self-start" // stick while section in view
        : "absolute top-10"; // 👈 absolute inside section; scrolls away

  const desktopSideStyle =
    desktopMode === "fixed"
      ? ({ [side]: desktopSideOffset } as any)
      : desktopMode === "absolute"
        ? ({ [side]: "min(calc((100vw - var(--wrap-max))/2), 24px)" } as any)
        : undefined;

  return (
    <>
      {/* ===== Desktop rail (lg+) ===== */}
      <aside
        aria-label="Quick actions"
        className={[
          "hidden lg:block z-30",
          desktopPosition,
          "glass rounded-2xl p-3 w-64 border-base shadow-soft",
        ].join(" ")}
        style={desktopSideStyle}
      >
        <nav className="grid gap-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="menu-card flex items-center gap-2"
            >
              <span className="text-muted">{it.icon}</span>
              <span className="text-sm font-medium">{it.label}</span>
            </Link>
          ))}

          <div className="mt-2 rounded-xl border border-[var(--line)] p-3">
            <p className="text-xs text-muted">Tip</p>
            <p className="mt-1 text-sm">
              Use the mood menu to recolor the whole page.
            </p>
          </div>
        </nav>
      </aside>

      {/* ===== Mobile FAB + Bottom Sheet (unchanged) ===== */}
      <button
        aria-label="Open quick actions"
        onClick={() => setOpen(true)}
        className={[
          "lg:hidden fixed z-40 bottom-4 safe-pb",
          side === "right" ? "right-4" : "left-4",
          "rounded-full bg-[var(--mood)] text-white shadow-soft touch px-4 py-3",
        ].join(" ")}
      >
        <Settings size={18} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-[var(--bg-1)] border-t border-[var(--line)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <p className="text-sm font-semibold">Quick actions</p>
              <button
                aria-label="Close"
                className="rounded-lg p-1 hover:bg-[var(--bg-2)]"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="grid grid-cols-1 gap-2 p-4">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="menu-card flex items-center gap-2 py-3"
                >
                  <span className="text-muted">{it.icon}</span>
                  <span className="text-sm font-medium">{it.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
