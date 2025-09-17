"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Users,
  LineChart,
  Flame,
  Moon,
  Sun,
  ChevronDown,
  Route,
  LogOut,
  User2,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { meThunk, logoutThunk } from "@/redux/slices/authSlice";

import MagneticCTA from "@/components/MagneticCTA";
import Counter from "@/components/Counter";
import BreathingRing from "@/components/BreathingRing";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import FAQSearch, { getFaqJsonLd, type FaqItem } from "@/components/FAQ";
import PricingToggle from "@/components/PricingToggle";
import HowItWorksScrolly from "@/components/HowItWorksScrolly";

import { useI18n } from "@/components/ui/i18n";
import SpotlightBG from "@/components/effects/SpotlightBG";

/* ===================== i18n strings (local) ===================== */
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
      dashboard: "Journey",
      account: "Account",
      logout: "Logout",
      openDashboard: "Open Journey",
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
    units: { days: "days", minRead: "min read", read: "Read →" },
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
    blogTitle: "Guides & resources",
    blog: [
      {
        tag: "Habits",
        title: "The 2-minute rule to start any habit",
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
      dashboard: "الرحلة",
      account: "الحساب",
      logout: "تسجيل الخروج",
      openDashboard: "فتح الرحلة",
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
    units: { days: "أيام", minRead: "دقيقة قراءة", read: "اقرأ →" },
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

/* ===================== helpers ===================== */
function formatCompact(n: number, lang: "en" | "ar") {
  return new Intl.NumberFormat(lang === "ar" ? "ar" : "en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
const cx = (...x: Array<string | false | null | undefined>) =>
  x.filter(Boolean).join(" ");

function truncateEmail(email?: string) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const short =
    name.length > 12 ? `${name.slice(0, 4)}…${name.slice(-2)}` : name;
  return `${short}@${domain}`;
}

/* ===== Quick toggles (Language + Theme in Navbar only) ===== */
function QuickToggles({
  lang,
  setLang,
  mounted,
  theme,
  setTheme,
  labels,
}: {
  lang: "en" | "ar";
  setLang: (l: "en" | "ar") => void;
  mounted: boolean;
  theme?: string;
  setTheme: (t: string) => void;
  labels: { themeLight: string; themeDark: string; lang: string };
}) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <button
        aria-label="Toggle language"
        onClick={() => setLang(lang === "en" ? "ar" : "en")}
        className="rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-medium shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
      >
        🌐 {labels.lang}
      </button>

      {mounted && (
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-medium shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          {theme === "dark" ? (
            <>
              <Sun size={14} className="inline -mt-0.5" /> {labels.themeLight}
            </>
          ) : (
            <>
              <Moon size={14} className="inline -mt-0.5" /> {labels.themeDark}
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* ===== User chip (email + menu) ===== */
function UserChip({
  email,
  labels,
  onLogout,
}: {
  email?: string;
  labels: { dashboard: string; account: string; logout: string };
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="userchip-menu"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-2.5 py-1 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
      >
        <div className="grid h-7 w-7 place-items-center rounded-full bg-indigo-600 text-white">
          {email?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="hidden max-w-[12ch] truncate text-sm text-gray-700 dark:text-gray-200 sm:inline">
          {truncateEmail(email)}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {open && (
        <div
          id="userchip-menu"
          role="menu"
          onMouseLeave={() => setOpen(false)}
          className={cx(
            "absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl",
            "border border-gray-200 bg-white/95 p-1 shadow-xl backdrop-blur-md ring-1 ring-black/5",
            "dark:border-gray-800 dark:bg-gray-900/95"
          )}
        >
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Route size={16} />
            {labels.dashboard}
          </Link>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <User2 size={16} />
            {labels.account}
          </Link>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut size={16} />
            {labels.logout}
          </button>
        </div>
      )}
    </div>
  );
}

/* ===================== PAGE ===================== */
export default function Home() {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const { lang, setLang } = useI18n();
  const M = STRINGS[lang];

  useEffect(() => {
    dispatch(meThunk());
  }, [dispatch]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  const FAQ_ITEMS: FaqItem[] = useMemo(
    () => M.faqs.map((f, i) => ({ q: f.q, a: f.a, id: `faq-${i + 1}` })),
    [M]
  );
  const FAQ_JSON = useMemo(() => getFaqJsonLd(FAQ_ITEMS), [FAQ_ITEMS]);

  const STEPS = useMemo(
    () => [
      {
        title: M.steps[0]?.title || "Create your account",
        desc: lang === "ar" ? "سجّل وحدد هدفك." : "Sign up and set your goal.",
        emoji: "🧭",
      },
      {
        title: M.steps[1]?.title || "Add your habits",
        desc:
          lang === "ar"
            ? "اختر عادات الصباح/المساء."
            : "Pick routines for morning & evening.",
        emoji: "📋",
      },
      {
        title: M.steps[2]?.title || "Track & reflect daily",
        desc:
          lang === "ar"
            ? "علّم العادات واكتب تأمّل قصير."
            : "Check off habits and write a short reflection.",
        emoji: "🧠",
      },
    ],
    [M, lang]
  );

  const PRICING_PLANS = useMemo(
    () => [
      {
        name: lang === "ar" ? "مجاني" : "Free",
        priceMonthly: 0,
        features:
          lang === "ar"
            ? [
                "تتبّع العادات",
                "مذكّرات يومية",
                "ملخص أسبوعي",
                "تحليلات أساسية",
              ]
            : [
                "Habit tracking",
                "Daily journaling",
                "Weekly summary",
                "Basic analytics",
              ],
        ctaHref: "/register",
      },
      {
        name: lang === "ar" ? "احترافي" : "Pro",
        priceMonthly: 8,
        features:
          lang === "ar"
            ? [
                "كل شي بالخطة المجانية",
                "اقتراحات بالذكاء الاصطناعي",
                "تحليلات متقدمة",
                "دعم أولوية",
              ]
            : [
                "Everything in Free",
                "AI suggestions",
                "Advanced analytics",
                "Priority support",
              ],
        ctaHref: "/register?plan=pro",
        highlighted: true,
      },
    ],
    [lang]
  );

  return (
    <SpotlightBG className="min-h-screen">
      <main dir={dir}>
        {/* Accessibility: skip to main content */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-lg focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-white"
        >
          {lang === "ar" ? "انتقل للمحتوى" : "Skip to content"}
        </a>

        {/* NOTE: removed solid page backgrounds so the global spotlight shows through */}
        <div className="min-h-screen text-gray-900 transition-colors duration-300 dark:text-gray-50">
          {/* ===================== NAV ===================== */}
          <header className="sticky top-0 z-50 border-b border-transparent bg-white/70 backdrop-blur-xl transition-colors dark:bg-gray-950/70 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
            <nav
              className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4"
              aria-label="Primary"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.jpg"
                  alt="MindSync"
                  width={36}
                  height={36}
                  priority
                />
                <span className="text-base font-semibold tracking-[-0.01em]">
                  {M.app}
                </span>
              </div>

              <div className="hidden items-center gap-6 md:flex">
                <a
                  href="#features"
                  className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {M.nav.features}
                </a>
                <a
                  href="#how"
                  className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {M.nav.how}
                </a>
                <a
                  href="#pricing"
                  className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {M.nav.pricing}
                </a>
                <a
                  href="#blog"
                  className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {M.nav.blog}
                </a>
              </div>

              <div className="flex items-center gap-3">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      className="hidden text-sm text-gray-700 hover:text-gray-900 md:inline-block dark:text-gray-300 dark:hover:text-white"
                    >
                      {M.nav.login}
                    </Link>
                    <MagneticCTA
                      href="/register"
                      className="hidden md:inline-flex"
                    >
                      {M.nav.getStarted}
                    </MagneticCTA>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="hidden rounded-full border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 md:inline-block"
                    >
                      {M.nav.dashboard}
                    </Link>
                    <UserChip
                      email={user.email}
                      labels={{
                        dashboard: M.nav.dashboard,
                        account: M.nav.account,
                        logout: M.nav.logout,
                      }}
                      onLogout={() => dispatch(logoutThunk())}
                    />
                  </>
                )}

                <QuickToggles
                  lang={lang}
                  setLang={setLang}
                  mounted={mounted}
                  theme={theme}
                  setTheme={setTheme}
                  labels={{
                    themeLight: M.toggles.theme.light,
                    themeDark: M.toggles.theme.dark,
                    lang: M.toggles.lang,
                  }}
                />
              </div>
            </nav>
          </header>

          {/* ===================== HERO ===================== */}
          <section className="relative overflow-hidden">
            {/* (Removed the old local gradient block to avoid double glow) */}

            <div
              id="content"
              className="mx-auto grid max-w-7xl items-center gap-12 px-6 pt-14 pb-24 md:grid-cols-2 md:pt-20 md:pb-28"
            >
              {/* Left copy */}
              <div className="text-center md:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                  className={cx(
                    "bg-[linear-gradient(90deg,#6d28d9_0%,#7c3aed_45%,#2563eb_100%)]",
                    "bg-clip-text text-transparent",
                    "text-[clamp(2.1rem,5vw,3.25rem)] font-extrabold leading-[1.07] tracking-tight",
                    "drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]"
                  )}
                >
                  {M.hero.title}
                </motion.h1>

                <p className="mx-auto mt-4 max-w-[62ch] text-[1.05rem] leading-[1.7] text-gray-700 dark:text-gray-300 md:mx-0">
                  {M.hero.subtitle}
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
                  {user ? (
                    <MagneticCTA href="/dashboard">
                      {M.nav.openDashboard}
                    </MagneticCTA>
                  ) : (
                    <MagneticCTA href="/register">{M.hero.cta}</MagneticCTA>
                  )}
                  <Link
                    href="/demo"
                    className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    {M.hero.secondary}
                  </Link>
                </div>

                {/* Stats */}
                <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 md:mx-0">
                  <Stat
                    icon={<Users size={18} />}
                    value={`${formatCompact(120000, lang)}+`}
                    label={M.stats.users}
                  />
                  <Stat
                    icon={<LineChart size={18} />}
                    value={`${formatCompact(3200000, lang)}+`}
                    label={M.stats.habits}
                  />
                  <Stat
                    icon={<Flame size={18} />}
                    value={
                      <>
                        <Counter to={18} />{" "}
                        <span className="text-sm opacity-70">
                          {M.units.days}
                        </span>
                      </>
                    }
                    label={M.stats.streak}
                  />
                </div>
              </div>

              {/* Right visual */}
              <div className="relative flex items-center justify-center md:justify-end">
                <div className="relative">
                  <BreathingRing size={320} variant="soft" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="w-[230px] rounded-2xl border border-gray-200 bg-white/85 p-5 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/85">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        {lang === "ar" ? "تأمل الصباح" : "Morning reflection"}
                      </p>
                      <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                        {lang === "ar"
                          ? "رح أركز اليوم على العمل العميق 3 ساعات وأمشي 10 دقايق."
                          : "Today I will focus on deep work for 3h and take a 10-minute walk."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust bar */}
            <div className="mx-auto max-w-7xl px-6 pb-6">
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 md:justify-between">
                {["Calm", "Notion", "Headspace", "Linear", "Slack"].map((b) => (
                  <span key={b} className="text-sm">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== DASHBOARD PREVIEW ===================== */}
          <DashboardPreviewPro lang={lang} />

          {/* ===================== FEATURES ===================== */}
          <section
            id="features"
            className="bg-gray-50 py-16 dark:bg-gray-900/40"
          >
            <div className="mx-auto max-w-7xl px-6 text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                {M.featuresTitle}
              </h2>
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {M.features.map((f, idx) => (
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

          {/* ===================== HOW IT WORKS ===================== */}
          <section id="how" className="py-16">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                {M.howTitle}
              </h2>
              <HowItWorksScrolly steps={STEPS} className="mt-10" />
            </div>
          </section>

          {/* ===================== DAY / NIGHT SAMPLES ===================== */}
          <section className="bg-indigo-50 py-16 dark:bg-indigo-950/40">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                🌙 / ☀️
              </h2>
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="text-xl font-semibold">
                    {lang === "ar" ? "روتين الصباح" : "Morning routine"}
                  </h3>
                  <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-gray-700 dark:text-gray-300">
                    <li>
                      {lang === "ar" ? "تنفّس دقيقتين" : "2-minute breathing"}
                    </li>
                    <li>
                      {lang === "ar" ? "اكتب 3 أولويات" : "Write 3 priorities"}
                    </li>
                    <li>{lang === "ar" ? "مشي 15 دقيقة" : "15-minute walk"}</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="text-xl font-semibold">
                    {lang === "ar" ? "تهدئة المساء" : "Evening wind-down"}
                  </h3>
                  <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-gray-700 dark:text-gray-300">
                    <li>
                      {lang === "ar" ? "دوّن إنجاز واحد" : "Reflect on 1 win"}
                    </li>
                    <li>
                      {lang === "ar"
                        ? "قيّم يومك (1-5)"
                        : "Rate your day (1-5)"}
                    </li>
                    <li>
                      {lang === "ar"
                        ? "خطّط بكرة بثلاث نقاط"
                        : "Plan tomorrow in 3 bullets"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ===================== TESTIMONIALS ===================== */}
          <section className="py-16">
            <div className="mx-auto max-w-5xl px-6 text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                {M.testimonialsTitle}
              </h2>
              <div className="mt-10">
                <TestimonialMarquee
                  items={[
                    {
                      name: "Sarah A.",
                      quote:
                        "MindSync helped me stay consistent with journaling. Love it!",
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
                      quote:
                        "The AI suggestions are scarily accurate and super helpful.",
                    },
                  ]}
                  speed={28}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  className="mt-10"
                />
              </div>
            </div>
          </section>

          {/* ===================== FAQ ===================== */}
          <section className="bg-gray-50 py-16 dark:bg-gray-900/40">
            <div className="mx-auto max-w-4xl px-6">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                {M.faqsTitle}
              </h2>

              <FAQSearch
                items={FAQ_ITEMS}
                className="mt-8"
                lang={lang}
                dir={dir as "ltr" | "rtl"}
                placeholder={
                  lang === "ar" ? "ابحث في الأسئلة…" : "Search FAQs…"
                }
                i18n={{
                  results: (n) =>
                    lang === "ar"
                      ? `${n} نتيجة`
                      : `${n} result${n !== 1 ? "s" : ""}`,
                  noResults: lang === "ar" ? "لا توجد نتائج" : "No results",
                  searchAriaLabel:
                    lang === "ar" ? "ابحث في الأسئلة" : "Search FAQs",
                }}
              />

              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON) }}
              />
            </div>
          </section>

          {/* ===================== PRICING ===================== */}
          <section id="pricing" className="py-16">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                {M.pricingTitle}
              </h2>
              <PricingToggle
                plans={PRICING_PLANS}
                percentDiscount={25}
                currency="USD"
                className="mt-10"
              />
            </div>
          </section>

          {/* ===================== BLOG ===================== */}
          <section id="blog" className="bg-gray-50 py-16 dark:bg-gray-900/40">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="text-center text-3xl font-bold sm:text-4xl">
                {M.blogTitle}
              </h2>
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                {M.blog.map((b, i) => (
                  <article
                    key={i}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="text-xs uppercase tracking-wide text-indigo-600">
                      {b.tag}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {b.minutes} {M.units.minRead}
                    </p>
                    <Link
                      href="#"
                      className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
                    >
                      {M.units.read}
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ===================== FOOTER ===================== */}
          <footer className="border-t border-gray-200 bg-white/80 py-10 text-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/70">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
              <div className="text-gray-600 dark:text-gray-300">
                {M.footer.rights(new Date().getFullYear())}
              </div>
              <div className="flex items-center gap-5 text-gray-600 dark:text-gray-300">
                <Link href="#">{M.footer.privacy}</Link>
                <Link href="#">{M.footer.contact}</Link>
                <Link href="#">{M.footer.careers}</Link>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </SpotlightBG>
  );
}

/* ===================== UI Helpers ===================== */
function Stat({
  icon,
  value,
  label,
}: {
  icon?: ReactNode;
  value: ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="text-gray-600 dark:text-gray-300">{icon}</span>
        ) : null}
        <div className="text-xl font-bold">{value}</div>
      </div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        {label}
      </div>
    </div>
  );
}

/* ===== Dashboard (Pro) preview card ===== */
function DashboardPreviewPro({ lang }: { lang: "en" | "ar" }) {
  const [range, setRange] = useState<"7d" | "14d" | "30d">("7d");

  const DATA: Record<"7d" | "14d" | "30d", number[]> = {
    "7d": [55, 80, 62, 95, 70, 85, 60],
    "14d": [40, 55, 62, 75, 68, 80, 60, 72, 78, 84, 66, 70, 77, 81],
    "30d": Array.from(
      { length: 30 },
      (_, i) => 42 + Math.round(50 * Math.abs(Math.sin(i / 3.8)))
    ),
  };

  const copy =
    lang === "ar"
      ? {
          title: "عرض لوحة التحكم",
          habit: "إكمال العادات",
          range: { "7d": "7 أيام", "14d": "14 يوم", "30d": "30 يوم" },
          morning: "تأمل الصباح",
          evening: "تأمل المساء",
          sampleMorning:
            "رح أركز اليوم على العمل العميق 3 ساعات وأمشي 10 دقايق.",
          sampleEvening:
            "حققت 2/3 عادات. الطاقة نزلت الساعة 3م؛ تمدّد بسيط ساعد كثير.",
          completion: "نسبة الإكمال",
          streak: "أفضل سلسلة",
          dayUnit: "يوم",
        }
      : {
          title: "Dashboard preview",
          habit: "Habit completion",
          range: { "7d": "7 days", "14d": "14 days", "30d": "30 days" },
          morning: "Morning reflection",
          evening: "Evening reflection",
          sampleMorning:
            "Today I will focus on deep work for 3h and take a 10-minute walk.",
          sampleEvening:
            "I hit 2/3 habits. Energy dipped at 3pm; a short stretch helped a lot.",
          completion: "Completion",
          streak: "Best streak",
          dayUnit: "days",
        };

  const data = DATA[range];
  const completionAvg = Math.round(
    data.reduce((a, b) => a + b, 0) / data.length
  );
  const bestStreak = 18;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200/80 px-5 py-3 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {copy.title}
          </h3>

          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 text-xs dark:border-gray-700 dark:bg-gray-950">
            {["7d", "14d", "30d"].map((k) => (
              <button
                key={k}
                onClick={() => setRange(k as "7d" | "14d" | "30d")}
                className={
                  range === (k as "7d" | "14d" | "30d")
                    ? "rounded-lg bg-indigo-600 px-2.5 py-1 text-white"
                    : "rounded-lg px-2.5 py-1 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }
              >
                {copy.range[k as keyof typeof copy.range]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* Analytics card */}
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {copy.habit} • {copy.range[range]}
              </p>
              <div className="flex items-center gap-2">
                <Chip label={`${copy.completion}: ${completionAvg}%`} />
                <Chip label={`${copy.streak}: ${bestStreak} ${copy.dayUnit}`} />
              </div>
            </div>

            <BarChart data={data} />
          </div>

          {/* Reflections */}
          <div className="grid gap-4">
            <ReflectionCard title={copy.morning} text={copy.sampleMorning} />
            <ReflectionCard title={copy.evening} text={copy.sampleEvening} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== Sub components ===== */
function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
      {label}
    </span>
  );
}

function ReflectionCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-300">
        {title}
      </p>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{text}</p>
    </div>
  );
}

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(100, ...data);
  return (
    <div
      className="relative h-48 rounded-xl bg-white p-3 dark:bg-gray-950"
      role="img"
      aria-label="Completion bars over selected period"
    >
      <div aria-hidden className="pointer-events-none absolute inset-3">
        {[25, 50, 75].map((p) => (
          <div
            key={p}
            className="absolute inset-x-0 h-px bg-gray-200 dark:bg-gray-800"
            style={{ top: `${p}%` }}
          />
        ))}
      </div>
      <div className="relative z-10 flex h-full items-end gap-2">
        {data.map((v, i) => {
          const h = Math.round((v / max) * 100);
          return (
            <div key={i} className="flex-1" aria-hidden="true">
              <div
                style={{ height: `${h}%` }}
                title={`${v}%`}
                className="rounded-md bg-[linear-gradient(to_top,#4f46e5,#06b6d4)] shadow-sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
