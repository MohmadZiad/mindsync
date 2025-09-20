"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, BookOpen, HelpCircle, X } from "lucide-react";

/**
 * A production-ready responsive utility rail:
 * - ≥ lg: sticky right sidebar (auto flips left in RTL)
 * - <  lg: turns into a FAB that opens a bottom sheet
 * - Uses your global tokens/utilities. Zero layout shift. Accessible.
 */
export default function UtilityRail({
  dir = "ltr",
}: {
  dir?: "ltr" | "rtl";
}) {
  const [open, setOpen] = useState(false);
  const side = dir === "rtl" ? "left" : "right";

  const items = [
    { href: "#features", label: "Features", icon: <BookOpen size={16} /> },
    { href: "#how", label: "How it works", icon: <HelpCircle size={16} /> },
    { href: "#pricing", label: "Pricing", icon: <Settings size={16} /> },
  ];

  return (
    <>
      {/* ===== Desktop rail (lg+) ===== */}
      <aside
        aria-label="Quick actions"
        className={[
          "hidden lg:block",
          "sticky top-24",
          "h-[calc(100vh-6rem)]",
          "glass rounded-2xl p-3",
          "border-base shadow-soft",
          "w-64",
          // position to the visual edge while keeping inside the wrap
          "self-start",
          // place on the logical side
          side === "right" ? "ml-auto" : "mr-auto",
        ].join(" ")}
        style={{ [side]: "0" } as any}
      >
        <nav className="stack">
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

      {/* ===== Mobile FAB + Bottom Sheet ( < lg ) ===== */}
      <button
        aria-label="Open quick actions"
        onClick={() => setOpen(true)}
        className={[
          "lg:hidden fixed z-40 bottom-4 safe-pb",
          side === "right" ? "right-4" : "left-4",
          "rounded-full bg-[var(--mood)] text-white shadow-soft",
          "touch px-4 py-3"
        ].join(" ")}
      >
        <Settings size={18} />
      </button>

      {/* Sheet overlay */}
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
