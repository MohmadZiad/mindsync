"use client";
import { useMemo, useState } from "react";

export default function HeaderSearch({
  onSelect,
  placeholder = "ابحث عن عادة أو تقرير…",
}: {
  onSelect?: (q: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const ready = useMemo(() => q.trim().length >= 2, [q]);
  return (
    <div className="hidden md:flex items-center gap-2">
      <div className="relative">
        <input
          className="input w-72 pe-9"
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="absolute end-2 top-2.5 opacity-60">⌘K</span>
      </div>
      <button
        disabled={!ready}
        onClick={() => onSelect?.(q.trim())}
        className="btn-secondary disabled:opacity-50"
      >
        بحث
      </button>
    </div>
  );
}
