"use client";
import React from "react";

export function Card({
  title,
  children,
  right,
}: {
  title?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        {title ? <h3 className="text-base font-semibold">{title}</h3> : <span />}
        {right ?? null}
      </div>
      <div>{children}</div>
    </section>
  );
}
