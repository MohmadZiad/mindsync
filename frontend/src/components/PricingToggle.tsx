"use client";
import { useId, useMemo, useState } from "react";

type Plan = {
  name: string;
  priceMonthly: number;     // السعر الشهري بالدولار (أو عملتك)
  features: string[];
  ctaHref: string;
  highlighted?: boolean;    // لتمييز الخطة (مثلاً Pro)
};

function formatPrice(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}


export default function PricingToggle({
  plans,
  percentDiscount = 20,
  currency = "USD",
  defaultYearly = true,
  className = "",
}: {
  plans: Plan[];
  percentDiscount?: number;
  currency?: string;
  defaultYearly?: boolean;
  className?: string;
}) {
  const [yearly, setYearly] = useState(defaultYearly);
  const switchId = useId();

  const computed = useMemo(() => {
    if (!yearly) return plans.map((p) => ({ ...p, price: p.priceMonthly, suffix: "/mo" }));
    const factor = (100 - percentDiscount) / 100;
    return plans.map((p) => ({
      ...p,
      price: p.priceMonthly * 12 * factor,
      suffix: "/yr",
    }));
  }, [plans, yearly, percentDiscount]);

  return (
    <section className={className}>
      {/* سويتش */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className={!yearly ? "font-semibold" : ""}>Monthly</span>
        <button
          aria-pressed={yearly}
          aria-labelledby={switchId}
          onClick={() => setYearly((v) => !v)}
          className={`relative inline-flex w-16 h-9 rounded-full transition ${yearly ? "bg-indigo-600" : "bg-slate-300"}`}
        >
          <span
            className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white transform transition ${yearly ? "translate-x-7" : ""}`}
          />
        </button>
        <span id={switchId} className={yearly ? "font-semibold" : ""}>Yearly</span>
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          Save {percentDiscount}%
        </span>
      </div>

      {/* الباقات */}
      <div className="grid md:grid-cols-2 gap-6">
        {computed.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl p-6 border glass ${p.highlighted ? "ring-2 ring-indigo-500" : ""}`}
          >
            {p.highlighted && (
              <span className="absolute -top-3 right-4 text-xs px-2 py-1 rounded-full bg-indigo-600 text-white shadow">
                Most popular
              </span>
            )}

            <h3 className="text-xl font-semibold">{p.name}</h3>
            <div className="mt-2 text-4xl font-bold">
              {formatPrice(p.price!, currency)} <span className="text-base font-medium opacity-70">{p.suffix}</span>
            </div>

            <ul className="mt-4 space-y-2 text-slate-700 dark:text-slate-300">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span aria-hidden>✅</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a href={p.ctaHref} className={`mt-6 inline-flex px-5 py-3 rounded-xl font-semibold
                ${p.highlighted ? "text-white bg-indigo-600 hover:bg-indigo-500"
                                 : "bg-white border border-slate-200/70 hover:bg-slate-50 dark:border-white/10"}`}>
              Go {p.name}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
