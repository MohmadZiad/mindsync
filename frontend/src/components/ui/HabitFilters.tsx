"use client";
export type HabitFilter = "all" | "daily" | "weekly" | "archived";

export default function HabitFilters({
  value,
  onChange,
  lang = "ar",
}: {
  value: HabitFilter;
  onChange: (v: HabitFilter) => void;
  lang?: "ar" | "en";
}) {
  const L = lang === "ar"
    ? { all:"الكل", daily:"يومية", weekly:"أسبوعية", archived:"منتهية" }
    : { all:"All", daily:"Daily", weekly:"Weekly", archived:"Archived" };

  const items: HabitFilter[] = ["all","daily","weekly","archived"];
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map(k => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`chip ${value===k ? "bg-[var(--brand)] text-white border-transparent" : ""}`}
        >
          {L[k]}
        </button>
      ))}
    </div>
  );
}
