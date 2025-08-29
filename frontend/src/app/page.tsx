"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";


const STRINGS = {
  en: {
    app: "MindSync",
    nav: {
      features: "Features",
      how: "How it works",
      pricing: "Pricing",
      blog: "Resources",
      login: "Login",
      getStarted: "Get Started",
      demo: "Try Demo",
    },
    hero: {
      title: "Track your mental habits, reflect, and grow",
      subtitle:
        "MindSync helps you build healthy routines with daily reflections, habit tracking, and weekly insights.",
      cta: "Start your journey",
      secondary: "Explore the demo (no signup)",
    },
    stats: {
      users: "Active users",
      habits: "Habits tracked",
      streak: "Avg. streak",
    },
    featuresTitle: "What you can do with MindSync",
    features: [
      {
        icon: "📊",
        title: "Track Habits",
        desc: "Build streaks and stay motivated daily.",
      },
      {
        icon: "📝",
        title: "Daily Journaling",
        desc: "Reflect on thoughts and emotions.",
      },
      {
        icon: "🧠",
        title: "Smart Analytics",
        desc: "Get insights from your entries.",
      },
      {
        icon: "📈",
        title: "Weekly Reports",
        desc: "Visual summaries of your progress.",
      },
      {
        icon: "🤖",
        title: "AI Suggestions",
        desc: "Smart tips based on your behavior.",
      },
      {
        icon: "🌙☀️",
        title: "Day/Night Reflections",
        desc: "Understand your moods across the day.",
      },
    ],
    howTitle: "How MindSync works",
    steps: [
      { num: 1, title: "Create your account" },
      { num: 2, title: "Add your habits" },
      { num: 3, title: "Track & reflect daily" },
    ],
    testimonialsTitle: "What our users say",
    faqsTitle: "Frequently asked questions",
    faqs: [
      {
        q: "Do I need an account to start?",
        a: "You can try a demo version without signing up.",
      },
      {
        q: "Is MindSync free?",
        a: "Yes. There's a free tier with optional premium features.",
      },
      { q: "Is my data private?", a: "Absolutely. Your data is yours only." },
    ],
    pricingTitle: "Simple pricing for everyone",
    plans: [
      {
        name: "Free",
        price: "$0",
        perks: [
          "Habit tracking",
          "Daily journaling",
          "Weekly summary",
          "Basic analytics",
        ],
        cta: "Get started",
      },
      {
        name: "Pro",
        price: "$8/mo",
        perks: [
          "Everything in Free",
          "AI suggestions",
          "Advanced analytics",
          "Priority support",
        ],
        cta: "Go Pro",
        featured: true,
      },
    ],
    blogTitle: "Guides & resources",
    blog: [
      {
        tag: "Habits",
        title: "The 2‑minute rule to start any habit",
        minutes: 4,
      },
      {
        tag: "Mindfulness",
        title: "Evening reflections that actually help",
        minutes: 6,
      },
      {
        tag: "Productivity",
        title: "How to design a week you can win",
        minutes: 5,
      },
    ],
    footer: {
      privacy: "Privacy",
      contact: "Contact",
      careers: "Careers",
      rights: (y: number) => `© ${y} MindSync. All rights reserved.`,
    },
    toggles: { theme: { light: "Light", dark: "Dark" }, lang: "العربية" },
  },
  ar: {
    app: "مايند سنك",
    nav: {
      features: "الميزات",
      how: "كيف تعمل",
      pricing: "الأسعار",
      blog: "الموارد",
      login: "تسجيل الدخول",
      getStarted: "ابدأ الآن",
      demo: "جرّب النسخة التجريبية",
    },
    hero: {
      title: "تابِع عاداتك الذهنية، اكتب تأمّلاتك، وتقدّم كل يوم",
      subtitle:
        "MindSync بيساعدك تبني روتين صحي من خلال تعليقات يومية، تتبّع للعادات، وتقارير أسبوعية ذكية.",
      cta: "ابدأ رحلتك",
      secondary: "جرّب الديمو بدون حساب",
    },
    stats: {
      users: "مستخدمون نشطون",
      habits: "عادات متتبَّعة",
      streak: "متوسط السلسلة",
    },
    featuresTitle: "شو بتقدر تعمل مع MindSync",
    features: [
      {
        icon: "📊",
        title: "تتبّع العادات",
        desc: "ابنِ سلاسل واستمر بتحفيزك يوميًا.",
      },
      { icon: "📝", title: "مذكّرات يومية", desc: "عبّر عن أفكارك ومشاعرك." },
      {
        icon: "🧠",
        title: "تحليلات ذكية",
        desc: "احصل على بصائر من تدويناتك.",
      },
      { icon: "📈", title: "تقارير أسبوعية", desc: "ملخصات مرئية لتقدّمك." },
      {
        icon: "🤖",
        title: "اقتراحات بالذكاء الاصطناعي",
        desc: "نصائح ذكية حسب سلوكك.",
      },
      {
        icon: "🌙☀️",
        title: "تأملات صباح/ليل",
        desc: "افهم مزاجك خلال اليوم.",
      },
    ],
    howTitle: "كيف تعمل MindSync",
    steps: [
      { num: 1, title: "أنشئ حسابك" },
      { num: 2, title: "أضف عاداتك" },
      { num: 3, title: "تابِع ودوّن يوميًا" },
    ],
    testimonialsTitle: "شو بحكوا مستخدمينا",
    faqsTitle: "أسئلة متكررة",
    faqs: [
      { q: "لازم حساب لأبدأ؟", a: "بتقدر تجرّب نسخة تجريبية بدون تسجيل." },
      {
        q: "هل MindSync مجاني؟",
        a: "نعم، في خطة مجانية وخيارات مدفوعة إضافية.",
      },
      { q: "هل بياناتي خاصة؟", a: "أكيد. بياناتك إلك وحدك." },
    ],
    pricingTitle: "أسعار بسيطة للجميع",
    plans: [
      {
        name: "مجاني",
        price: "0$",
        perks: [
          "تتبّع العادات",
          "مذكّرات يومية",
          "ملخص أسبوعي",
          "تحليلات أساسية",
        ],
        cta: "ابدأ الآن",
      },
      {
        name: "احترافي",
        price: "8$/شهر",
        perks: [
          "كل شي بالخطة المجانية",
          "اقتراحات بالذكاء الاصطناعي",
          "تحليلات متقدمة",
          "دعم أولوية",
        ],
        cta: "اشترك احترافي",
        featured: true,
      },
    ],
    blogTitle: "أدلة وموارد",
    blog: [
      { tag: "عادات", title: "قاعدة الدقيقتين لبدء أي عادة", minutes: 4 },
      { tag: "يقظة", title: "تأملات مسائية بتفيد فعلاً", minutes: 6 },
      { tag: "إنتاجية", title: "كيف تصمّم أسبوعًا تربح فيه", minutes: 5 },
    ],
    footer: {
      privacy: "الخصوصية",
      contact: "اتصل بنا",
      careers: "الوظائف",
      rights: (y: number) => `© ${y} مايند سنك. جميع الحقوق محفوظة.`,
    },
    toggles: { theme: { light: "نهاري", dark: "ليلي" }, lang: "English" },
  },
} as const;

const TESTIMONIALS = [
  {
    name: "Sarah A.",
    quote: "MindSync helped me stay consistent with journaling. Love it!",
  },
  {
    name: "Mohammad Z.",
    quote:
      "As a student, it gave me control over my routines and stress levels.",
  },
  {
    name: "Lina K.",
    quote:
      "The weekly summaries are magic. It’s like a therapist in my pocket!",
  },
  {
    name: "Jad R.",
    quote: "The AI suggestions are scarily accurate and super helpful.",
  },
];

export default function Home() {
  // ✅ لا نستخدم isDark ولا نخزّن الثيم يدويًا
  const { theme, setTheme } = useTheme();

  // لغة واجهة المستخدم + حفظها
  const [lang, setLang] = useState<"en" | "ar">("en");
  useEffect(() => {
    const lng = localStorage.getItem("ms_lang") as "en" | "ar" | null;
    if (lng) setLang(lng);
  }, []);
  useEffect(() => {
    localStorage.setItem("ms_lang", lang);
  }, [lang]);

  // لتجنّب mismatch أثناء الـ SSR: بنعرض أزرار الثيم بعد mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const t = useMemo(() => STRINGS[lang], [lang]);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    // ✨ ملاحظة: .dark بتنضاف على <html> من ThemeProvider تلقائيًا
    <main dir={dir}>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50 transition-colors duration-300">
        {/* Decorative background gradients */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-300/30 via-indigo-400/20 to-fuchsia-300/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-indigo-500/10 blur-2xl" />
        </div>

        {/* Navbar */}
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="MindSync logo" width={36} height={36} />
            <span className="text-lg font-bold tracking-tight">{t.app}</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm hover:underline">
              {t.nav.features}
            </a>
            <a href="#how" className="text-sm hover:underline">
              {t.nav.how}
            </a>
            <a href="#pricing" className="text-sm hover:underline">
              {t.nav.pricing}
            </a>
            <a href="#blog" className="text-sm hover:underline">
              {t.nav.blog}
            </a>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              aria-label="Toggle language"
              onClick={() => setLang((p) => (p === "en" ? "ar" : "en"))}
              className="rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-medium shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              {t.toggles.lang}
            </button>
            {/* Theme toggle (next-themes) */}
            {mounted && (
              <button
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-medium shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                {theme === "dark"
                  ? `☀️ ${t.toggles.theme.light}`
                  : `🌙 ${t.toggles.theme.dark}`}
              </button>
            )}
            <Link
              href="/login"
              className="hidden text-sm md:inline-block hover:underline"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative mx-auto grid min-h-[72vh] max-w-7xl place-items-center overflow-hidden px-6 pt-6 text-center">
          <video
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-20 dark:opacity-25"
            autoPlay
            muted
            loop
            playsInline
            src="/bg-loop.mp4"
          />

          <div className="relative z-10 max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl"
            >
              {t.hero.title}
            </motion.h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:scale-[1.02] hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {t.hero.cta}
              </Link>
              <Link
                href="/demo"
                className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                {t.hero.secondary}
              </Link>
            </div>

            {/* Hero stats */}
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 text-sm">
              <Stat value={"120k+"} label={t.stats.users} />
              <Stat value={"3.2M+"} label={t.stats.habits} />
              <Stat value={"18 days"} label={t.stats.streak} />
            </div>
          </div>
        </section>

        {/* Demo Dashboard preview */}
        <section className="mx-auto max-w-6xl px-6 pb-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-indigo-500/5 dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-4 py-2 text-left text-xs uppercase tracking-wider text-gray-500 dark:border-gray-800">
              Dashboard preview
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              {/* chart mock */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <p className="mb-3 text-sm text-gray-500">
                  Habit completion (last 7 days)
                </p>
                <div className="flex h-40 items-end gap-2">
                  {[55, 80, 62, 95, 70, 85, 60].map((h, i) => (
                    <div key={i} className="flex-1">
                      <div
                        style={{ height: `${h}%` }}
                        className="rounded-t-md bg-gradient-to-t from-indigo-600 to-cyan-400"
                        aria-hidden
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* reflection cards mock */}
              <div className="grid gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Morning reflection
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                    Today I will focus on deep work for 3 hours and take a
                    10‑minute walk.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Evening reflection
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                    I hit 2/3 habits. Energy dipped at 3pm; a short stretch
                    helped a lot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-50 py-16 dark:bg-gray-900/40">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {t.featuresTitle}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {t.features.map((f, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="text-4xl">{f.icon}</div>
                  <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-16">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t.howTitle}</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {t.steps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white">
                    {s.num}
                  </div>
                  <p className="mt-3 text-lg font-medium">{s.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Day / Night sample cards */}
        <section className="bg-indigo-50 py-16 dark:bg-indigo-950/40">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">
              🌙 / ☀️
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-xl font-semibold">Morning routine</h3>
                <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-gray-700 dark:text-gray-300">
                  <li>2‑minute breathing</li>
                  <li>Write 3 priorities</li>
                  <li>15‑minute walk</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-xl font-semibold">Evening wind‑down</h3>
                <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-gray-700 dark:text-gray-300">
                  <li>Reflect on 1 win</li>
                  <li>Rate your day (1‑5)</li>
                  <li>Plan tomorrow in 3 bullets</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {t.testimonialsTitle}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {TESTIMONIALS.map((tm, i) => (
                <motion.blockquote
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-2xl border border-gray-200 bg-white p-6 text-left italic shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <p>“{tm.quote}”</p>
                  <footer className="mt-2 not-italic">— {tm.name}</footer>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-16 dark:bg-gray-900/40">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">
              {t.faqsTitle}
            </h2>
            <div className="mt-8 divide-y divide-gray-200 dark:divide-gray-800">
              {t.faqs.map((f, i) => (
                <FAQ key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing / CTA */}
        <section id="pricing" className="py-16">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t.pricingTitle}</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {t.plans.map((p, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-6 text-left shadow-sm transition hover:shadow-md dark:border-gray-800 ${
                    (p as any).featured
                      ? "border-indigo-500/40 ring-1 ring-indigo-500/30"
                      : "border-gray-200 dark:border-gray-800"
                  } bg-white dark:bg-gray-900`}
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-semibold">{p.name}</h3>
                    <span className="text-2xl font-bold">{p.price}</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {p.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span aria-hidden>✅</span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={i === 0 ? "/register" : "/pro"}
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog / Resources */}
        <section id="blog" className="bg-gray-50 py-16 dark:bg-gray-900/40">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3ل font-bold sm:text-4xl">
              {t.blogTitle}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {t.blog.map((b, i) => (
                <article
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="text-xs uppercase tracking-wide text-indigo-600">
                    {b.tag}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {b.minutes} min read
                  </p>
                  <Link
                    href="#"
                    className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Read →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-10 text-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
            <div className="text-gray-600 dark:text-gray-300">
              {t.footer.rights(new Date().getFullYear())}
            </div>
            <div className="flex items-center gap-5 text-gray-600 dark:text-gray-300">
              <Link href="#">{t.footer.privacy}</Link>
              <Link href="#">{t.footer.contact}</Link>
              <Link href="#">{t.footer.careers}</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        {label}
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left font-medium focus:outline-none"
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <p className="overflow-hidden text-sm text-gray-600 dark:text-gray-300">
          {a}
        </p>
      </div>
    </div>
  );
}
