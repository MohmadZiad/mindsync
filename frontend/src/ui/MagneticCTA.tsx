"use client";
import { useRef } from "react";
import Link from "next/link";

export default function MagneticCTA({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0,0)";
  };

  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition magnetic-will-move";
  const styles =
    variant === "primary"
      ? "text-white bg-indigo-600 hover:bg-indigo-500"
      : "text-slate-800 dark:text-slate-200 bg-white hover:bg-slate-50 border border-slate-200/70 dark:border-white/10";

  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`${base} ${styles} ${className}`}
    >
      <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-sky-400 blur-xl opacity-0 group-hover:opacity-60 transition"></span>
      {children}
    </Link>
  );
}
