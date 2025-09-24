"use client";
import { useEffect, useMemo, useState } from "react";

export type FaqItem = { q: string; a: string; id?: string };

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export function getFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const safe = escapeRegExp(q);
  const parts = text.split(new RegExp(`(${safe})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        normalize(p) === normalize(q) ? (
          <mark
            key={i}
            className="bg-yellow-200/70 dark:bg-yellow-500/30 rounded px-0.5"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

type I18n = {
  results: (n: number) => string;
  noResults: string;
  searchAriaLabel?: string;
};

const I18N_EN: I18n = {
  results: (n) => `${n} result${n !== 1 ? "s" : ""}`,
  noResults: "No results",
  searchAriaLabel: "Search FAQs",
};

const I18N_AR: I18n = {
  results: (n) => `${n} نتيجة`,
  noResults: "لا توجد نتائج",
  searchAriaLabel: "ابحث في الأسئلة",
};

export default function FAQ({
  items,
  className = "",
  lang = "en",
  dir,
  placeholder,
  i18n,
  injectJsonLd = false,
}: {
  items: FaqItem[];
  className?: string;
  lang?: "en" | "ar";
  dir?: "ltr" | "rtl";
  placeholder?: string;
  i18n?: Partial<I18n>;
  /** حقن JSON-LD لمحركات البحث (اختياري) */
  injectJsonLd?: boolean;
}) {
  const d: "ltr" | "rtl" = dir ?? (lang === "ar" ? "rtl" : "ltr");
  const strings: I18n = {
    ...(lang === "ar" ? I18N_AR : I18N_EN),
    ...(i18n || {}),
  };
  const ph =
    placeholder ?? (lang === "ar" ? "ابحث في الأسئلة…" : "Search FAQs…");

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = normalize(q);
    if (!needle) return items;
    return items.filter((i) => normalize(i.q + " " + i.a).includes(needle));
  }, [items, q]);

  // JSON-LD injection (اختياري)
  useEffect(() => {
    if (!injectJsonLd) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "faq-jsonld";
    el.text = JSON.stringify(getFaqJsonLd(items));
    document.head.appendChild(el);
    return () => {
      document.getElementById("faq-jsonld")?.remove();
    };
  }, [injectJsonLd, items]);

  return (
    <section className={className} dir={d}>
      <label className="visually-hidden" htmlFor="faq-search">
        {strings.searchAriaLabel ?? (lang === "ar" ? "بحث" : "Search")}
      </label>
      <input
        id="faq-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={ph}
        dir={d}
        className="w-full glass rounded-xl px-4 py-3 mb-4 outline-none"
        aria-describedby="faq-count"
      />
      <div
        id="faq-count"
        className="text-sm text-slate-500 mb-3"
        aria-live="polite"
      >
        {filtered.length ? strings.results(filtered.length) : strings.noResults}
      </div>

      <div className="space-y-2">
        {filtered.map((item, idx) => {
          const anchor = item.id || `q${idx + 1}`;
          return (
            <details key={anchor} id={anchor} className="faq">
              <summary className={d === "rtl" ? "text-right" : "text-left"}>
                <Highlight text={item.q} q={q} />
              </summary>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                <Highlight text={item.a} q={q} />
              </p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
