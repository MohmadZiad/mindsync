"use client";
import React from "react";

type Variant = "solid" | "glass";

export function Card({
  title,
  children,
  right,
  footer,
  variant = "glass",
}: {
  title?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: Variant;
}) {
  const cn =
    variant === "glass"
      ? "glass rounded-2xl p-4"
      : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm";
  return (
    <section className={`w-full ${cn}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          {title ? (
            <h3 className="text-base font-semibold">{title}</h3>
          ) : (
            <span />
          )}
          {right ?? null}
        </div>
      )}
      <div>{children}</div>
      {footer ? (
        <div className="mt-3 pt-3 border-t border-white/20 dark:border-white/10">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
