"use client";
import * as React from "react";
import type { ReactNode } from "react";

export default function PrettyModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  dir = "ltr",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  dir?: "ltr" | "rtl";
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        dir={dir}
        className="absolute inset-0 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-white to-violet-50 dark:from-slate-900 dark:to-indigo-950 shadow-2xl">
          <div className="pointer-events-none absolute -top-16 -end-16 h-40 w-40 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -start-12 h-36 w-36 rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div className="relative p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-1 text-sm text-[var(--text-3)]">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="btn btn--ghost touch rounded-xl"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
