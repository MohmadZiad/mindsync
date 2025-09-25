"use client";
export type Lang = "en" | "ar";
type Filter = "all" | "daily" | "weekly" | "archived";

const STR = {
  en: { all:"All", daily:"Daily", weekly:"Weekly", archived:"Archived" },
  ar: { all:"الكل", daily:"يومي", weekly:"أسبوعي", archived:"منتهية" },
} as const;

export default function FilterChips({
  lang="en",
  value="all",
  onChange,
}: {
  lang?: Lang;
  value: Filter;
  onChange: (f: Filter) => void;
}) {
  const t = STR[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const items: {k:Filter; label:string}[] = [
    {k:"all", label:t.all},
    {k:"daily", label:t.daily},
    {k:"weekly", label:t.weekly},
    {k:"archived", label:t.archived},
  ];

  return (
    <div dir={dir} className="flex flex-wrap gap-2">
      {items.map(it => (
        <button
          key={it.k}
          onClick={() => onChange(it.k)}
          className={[
            "chip",
            value === it.k ? "ring-2 ring-indigo-300 bg-[var(--bg-2)]" : "",
          ].join(" ")}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
