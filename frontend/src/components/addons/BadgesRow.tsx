"use client";
export default function BadgesRow({
  lang="en",
  streak=0,
  weekCount=0,
  consistency=0, // 0..100
}: {
  lang?: "en"|"ar";
  streak?: number;
  weekCount?: number;
  consistency?: number;
}) {
  const items = [
    { icon:"🔥", key:"streak", ok: streak>=7,  en:"Streak Master", ar:"سيد السلسلة" },
    { icon:"🎯", key:"focus",  ok: weekCount>=5, en:"Focused", ar:"مركّز" },
    { icon:"🌱", key:"consis", ok: consistency>=80, en:"Consistency", ar:"الاستمرارية" },
  ];
  const dir = lang==="ar"?"rtl":"ltr";
  return (
    <div dir={dir} className="flex flex-wrap gap-2">
      {items.map(b => (
        <div
          key={b.key}
          className={[
            "px-3 py-1 rounded-full text-sm border",
            b.ok ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                 : "bg-[var(--bg-1)] border-[var(--line)] opacity-70",
          ].join(" ")}
          title={b.ok ? "Unlocked" : "Locked"}
        >
          <span className="me-1">{b.icon}</span>
          {lang==="ar" ? b.ar : b.en}
        </div>
      ))}
    </div>
  );
}
