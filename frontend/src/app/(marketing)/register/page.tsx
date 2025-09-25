"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import { FaFacebookF, FaGithub, FaGoogle } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerThunk, clearError, meThunk } from "@/redux/slices/authSlice";

/* ========================================================================== */
/*                                    i18n                                    */
/* ========================================================================== */

type Lang = "en" | "ar";
type DuoTheme = "serene" | "neo";

const STR = {
  en: {
    title: "Create account",
    subtitle: "It takes less than a minute ✨",
    name: "Full name",
    email: "Email",
    password: "Password",
    confirm: "Confirm password",
    show: "Show",
    hide: "Hide",
    terms: "I agree to the Terms & Privacy",
    submit: "Create account",
    loading: "Creating…",
    or: "or continue with",
    haveAccount: "Already have an account?",
    login: "Login",
    redirecting: "Redirecting…",
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
    mismatch: "Passwords don’t match",
    pickTheme: "Theme",
    successTitle: "Welcome aboard! 🎉",
    successSub: "Redirecting to your next step…",
  },
  ar: {
    title: "إنشاء حساب",
    subtitle: "رح ياخد أقل من دقيقة ✨",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirm: "تأكيد كلمة المرور",
    show: "عرض",
    hide: "إخفاء",
    terms: "أوافق على الشروط والخصوصية",
    submit: "إنشاء الحساب",
    loading: "جاري الإنشاء…",
    or: "أو تابع بواسطة",
    haveAccount: "عندك حساب؟",
    login: "تسجيل الدخول",
    redirecting: "جاري التحويل…",
    weak: "ضعيفة",
    fair: "متوسطة",
    good: "جيدة",
    strong: "قوية",
    mismatch: "كلمتا المرور غير متطابقتين",
    pickTheme: "اختر التصميم",
    successTitle: "أهلاً بك! 🎉",
    successSub: "جاري تحويلك للخطوة التالية…",
  },
} as const;

/* ========================================================================== */
/*                              Theme Provider                                 */
/* ========================================================================== */

type ThemeCtx = {
  theme: DuoTheme;
  setTheme: (t: DuoTheme) => void;
  ready: boolean;
};
const ThemeContext = createContext<ThemeCtx>({
  theme: "serene",
  setTheme: () => {},
  ready: false,
});
const useDuoTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<DuoTheme>("serene");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved =
      (localStorage.getItem("login_duo_theme") as DuoTheme) || "serene";
    setThemeState(saved);
    setReady(true);
  }, []);
  const setTheme = (t: DuoTheme) => {
    setThemeState(t);
    localStorage.setItem("login_duo_theme", t);
  };
  return (
    <ThemeContext.Provider value={{ theme, setTheme, ready }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}

/* ========================================================================== */
/*                               Pointer helper                                */
/* ========================================================================== */

function usePointer(ref: React.RefObject<HTMLDivElement | null>): {
  sx: MotionValue<number>;
  sy: MotionValue<number>;
} {
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 90, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 90, damping: 18, mass: 0.4 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(r.width / 2);
    y.set(r.height / 2);
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      x.set(e.clientX - b.left);
      y.set(e.clientY - b.top);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [ref]);

  return { sx, sy };
}

/* ========================================================================== */
/*                            Premium Backgrounds                              */
/* ========================================================================== */

function BGSerene() {
  const ref = useRef<HTMLDivElement>(null);
  const { sx, sy } = usePointer(ref);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden -z-10">
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
        transition={{ duration: 26, repeat: Infinity, repeatType: "reverse" }}
        style={{
          background: "linear-gradient(120deg,#f7f7ff,#eef2ff,#fdf2ff)",
          backgroundSize: "250% 250%",
        }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 700,
          height: 700,
          left: "-10%",
          top: "-10%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(109,94,241,.22), transparent 60%)",
        }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 650,
          height: 650,
          right: "-8%",
          bottom: "-8%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(241,94,204,.18), transparent 60%)",
        }}
      />
      <motion.div
        className="absolute rounded-full blur-2xl mix-blend-lighten"
        style={{
          width: 520,
          height: 520,
          x: useTransform(sx, (v) => v - 260),
          y: useTransform(sy, (v) => v - 260),
          background:
            "radial-gradient(circle, rgba(255,255,255,.35), rgba(99,102,241,.18) 60%, transparent 70%)",
        }}
      />
    </div>
  );
}

function BGNeo() {
  const ref = useRef<HTMLDivElement>(null);
  const { sx, sy } = usePointer(ref);
  const x = useTransform(sx, (v) => v - 220);
  const y = useTransform(sy, (v) => v - 220);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden -z-10">
      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          x,
          y,
          width: 440,
          height: 440,
          filter: "blur(28px)",
          background:
            "conic-gradient(from 0deg, rgba(109,94,241,.35), rgba(241,94,204,.28), rgba(96,165,250,.28), transparent 70%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ backgroundPosition: ["0 0", "200px 200px"] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
        style={{
          background:
            "linear-gradient(90deg, rgba(109,94,241,.06) 1px, transparent 1px), linear-gradient(0deg, rgba(109,94,241,.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}

/* ========================================================================== */
/*                                Social buttons                               */
/* ========================================================================== */

function SocialButtons() {
  const socials = [
    {
      name: "Google",
      icon: <FaGoogle />,
      href: "/api/auth/google",
      ring: "ring-red-500/40",
      fg: "text-red-600",
    },
    {
      name: "GitHub",
      icon: <FaGithub />,
      href: "/api/auth/github",
      ring: "ring-gray-700/40",
      fg: "text-gray-800",
    },
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      href: "/api/auth/facebook",
      ring: "ring-blue-600/40",
      fg: "text-blue-600",
    },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2">
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          className={`group flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium bg-white transition ring-2 ring-inset ${s.ring} hover:shadow-md`}
          style={{ borderColor: "var(--ring)", color: "var(--text)" }}
        >
          <span className={`${s.fg} text-base`}>{s.icon}</span>
          <span className="group-hover:translate-y-[-1px] transition-transform">
            {s.name}
          </span>
        </a>
      ))}
    </div>
  );
}

/* ========================================================================== */
/*                         Password strength (enhanced)                        */
/* ========================================================================== */

function scorePassword(pw: string) {
  let score = 0;
  if (!pw) return 0;
  const letters: Record<string, number> = {};
  for (let i = 0; i < pw.length; i++)
    letters[pw[i]] = (letters[pw[i]] || 0) + 1;
  score += Math.min(50, Object.keys(letters).length * 10);
  if (/[a-z]/.test(pw)) score += 10;
  if (/[A-Z]/.test(pw)) score += 10;
  if (/[0-9]/.test(pw)) score += 10;
  if (/[^A-Za-z0-9]/.test(pw)) score += 10;
  if (pw.length >= 12) score += 10;
  return Math.min(100, score);
}
function strengthLabel(score: number, t: (typeof STR)["en"]) {
  if (score < 30) return t.weak;
  if (score < 55) return t.fair;
  if (score < 80) return t.good;
  return t.strong;
}

function StrengthChips({ password }: { password: string }) {
  const checks = [
    { ok: password.length >= 8, label: "8+ chars" },
    { ok: /[a-z]/.test(password), label: "lowercase" },
    { ok: /[A-Z]/.test(password), label: "UPPERCASE" },
    { ok: /[0-9]/.test(password), label: "number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "symbol" },
  ];
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {checks.map((c, i) => (
        <motion.span
          key={c.label}
          className={`text-[11px] px-2 py-1 rounded-full ${
            c.ok
              ? "bg-emerald-500/15 text-emerald-600"
              : "bg-gray-200 text-gray-500"
          }`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.04 }}
        >
          {c.label}
        </motion.span>
      ))}
    </div>
  );
}

/* ========================================================================== */
/*                                  Register                                   */
/* ========================================================================== */

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 12s3.5-6 9-6c2.1 0 4 .7 5.6 1.7M21 12s-3.5 6-9 6c-2.1 0-4-.7-5.6-1.7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const { user, loading, error } = useAppSelector((s) => s.auth);

  const [lang, setLang] = useState<Lang>("ar");
  useEffect(() => {
    setLang((localStorage.getItem("ms_lang") as Lang) || "ar");
  }, []);
  const t = useMemo(() => STR[lang], [lang]);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  // lightweight ambient particles (client-only random to avoid SSR mismatch)
  const [particles, setParticles] = useState<
    { left: string; top: string; d: number; delay: number }[]
  >([]);
  useEffect(() => {
    const list = Array.from({ length: 24 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      d: Math.random() * 12 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(list);
  }, []);

  // prefetch
  useEffect(() => {
    router.prefetch("/login");
    if (next) router.prefetch(next);
  }, [router, next]);

  // me()
  const checkedRef = useRef(false);
  useEffect(() => {
    if (user || checkedRef.current) return;
    checkedRef.current = true;
    dispatch(meThunk());
  }, [dispatch, user]);

  // redirect if already authed
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, router, next]);

  // clear error on unmount
  useEffect(() => () => void dispatch(clearError()), [dispatch]);

  const score = scorePassword(password);
  const canSubmit =
    !!email.trim() &&
    !!password.trim() &&
    confirm === password &&
    agree &&
    !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    dispatch(clearError());
    const action = await dispatch(
      registerThunk({ email, password, name } as any)
    );
    if ((action as any)?.meta?.requestStatus === "fulfilled") {
      setJustCreated(true);
      setTimeout(() => router.replace(next), 900);
    }
  }

  const { theme, setTheme } = useDuoTheme();

  if (user) {
    return (
      <main dir={dir} className="min-h-[60vh] grid place-items-center">
        <div className="text-sm text-zinc-500">{t.redirecting}</div>
      </main>
    );
  }

  return (
    <ThemeProvider>
      <main dir={dir} className="relative min-h-screen">
        {theme === "neo" ? <BGNeo /> : <BGSerene />}

        {/* ambient particles (subtle) */}
        <div className="pointer-events-none fixed inset-0">
          {particles.map((p, i) => (
            <motion.span
              key={i}
              className="absolute block w-1 h-1 rounded-full bg-white/30"
              style={{ left: p.left, top: p.top }}
              animate={{ y: [0, -20, 0], opacity: [0, 0.6, 0] }}
              transition={{ duration: p.d, delay: p.delay, repeat: Infinity }}
            />
          ))}
        </div>

        <div className="relative z-10 min-h-screen grid place-items-center px-4">
          {/* glow ring */}
          <div
            aria-hidden
            className="absolute w-[560px] h-[560px] rounded-full blur-3xl opacity-60"
            style={{
              background:
                "radial-gradient(closest-side, rgba(109,94,241,.18), transparent)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 16 }}
            whileHover={{ y: -2 }}
            className="w-full max-w-lg rounded-3xl p-7 shadow-xl ring-1 relative"
            style={{
              background: "var(--card-bg)",
              color: "var(--text)",
              borderColor: "var(--ring)",
              boxShadow: "var(--shadow)",
            }}
          >
            {/* holo border */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl">
              <div
                className="absolute inset-0 rounded-3xl [mask:linear-gradient(white,transparent)] opacity-30"
                style={{
                  background:
                    "linear-gradient(90deg,rgba(109,94,241,.35),rgba(241,94,204,.35),rgba(96,165,250,.35))",
                  filter: "blur(20px)",
                }}
              />
            </div>

            {/* header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1
                  className="text-2xl font-extrabold"
                  style={{ color: "var(--heading)" }}
                >
                  {t.title}
                </h1>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  {t.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextLang = lang === "ar" ? "en" : "ar";
                    setLang(nextLang);
                    localStorage.setItem("ms_lang", nextLang);
                  }}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                  style={{
                    borderColor: "var(--ring)",
                    background: "var(--chip-bg)",
                    color: "var(--text)",
                  }}
                >
                  {lang === "ar" ? "EN" : "ع"}
                </button>
                <button
                  onClick={() => setTheme(theme === "neo" ? "serene" : "neo")}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                  style={{
                    borderColor: "var(--ring)",
                    background: "var(--chip-bg)",
                    color: "var(--text)",
                  }}
                >
                  {STR[lang].pickTheme}
                </button>
              </div>
            </div>

            {/* form */}
            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              {/* name */}
              <label className="block">
                <span className="sr-only">{t.name}</span>
                <div className="relative">
                  <input
                    className="peer w-full rounded-lg border px-3 pt-5 pb-2 text-sm outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--ring)",
                      background: "#fff",
                      color: "var(--text)",
                      boxShadow: "var(--shadow)",
                    }}
                    type="text"
                    placeholder=" "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                  <span className="pointer-events-none absolute start-3 top-2 text-[11px] text-gray-500 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px]">
                    {t.name}
                  </span>
                </div>
              </label>

              {/* email */}
              <label className="block">
                <span className="sr-only">{t.email}</span>
                <div className="relative">
                  <input
                    className="peer w-full rounded-lg border px-3 pt-5 pb-2 text-sm outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--ring)",
                      background: "#fff",
                      color: "var(--text)",
                      boxShadow: "var(--shadow)",
                    }}
                    type="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  <span className="pointer-events-none absolute start-3 top-2 text-[11px] text-gray-500 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px]">
                    {t.email}
                  </span>
                </div>
              </label>

              {/* password */}
              <label className="block">
                <span className="sr-only">{t.password}</span>
                <div className="relative">
                  <input
                    className="peer w-full rounded-lg border px-3 pt-5 pb-2 text-sm outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--ring)",
                      background: "#fff",
                      color: "var(--text)",
                      boxShadow: "var(--shadow)",
                    }}
                    type={showPw ? "text" : "password"}
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <span className="pointer-events-none absolute start-3 top-2 text-[11px] text-gray-500 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px]">
                    {t.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-600 hover:bg-gray-100"
                    aria-label={showPw ? STR[lang].hide : STR[lang].show}
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>

                {/* strength meter (enhanced) */}
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg,var(--p1),var(--p2))",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 18,
                      }}
                    />
                  </div>
                  <div
                    className="mt-1 text-[11px]"
                    style={{ color: "var(--muted)" }}
                  >
                    {strengthLabel(score, STR[lang])}
                  </div>

                  <StrengthChips password={password} />
                </div>
              </label>

              {/* confirm */}
              <label className="block">
                <span className="sr-only">{t.confirm}</span>
                <div className="relative">
                  <input
                    className="peer w-full rounded-lg border px-3 pt-5 pb-2 text-sm outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--ring)",
                      background: "#fff",
                      color: "var(--text)",
                      boxShadow: "var(--shadow)",
                    }}
                    type={showPw ? "text" : "password"}
                    placeholder=" "
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <span className="pointer-events-none absolute start-3 top-2 text-[11px] text-gray-500 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px]">
                    {t.confirm}
                  </span>
                </div>
                {confirm && confirm !== password && (
                  <div className="mt-1 text-[11px] text-rose-600">
                    {STR[lang].mismatch}
                  </div>
                )}
              </label>

              {/* terms */}
              <label
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--muted)" }}
              >
                <input
                  type="checkbox"
                  className="accent-[var(--p2)]"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                {t.terms}
              </label>

              {/* error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    aria-live="polite"
                    className="rounded-lg px-3 py-2 text-xs"
                    style={{ background: "#fef2f2", color: "#991b1b" }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* submit (with glow) */}
              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="w-full relative overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{
                  background: "linear-gradient(90deg,var(--p1),var(--p2))",
                  color: "#fff",
                  boxShadow:
                    "0 8px 24px rgba(109,94,241,.20), 0 2px 8px rgba(241,94,204,.12)",
                }}
                onClick={onSubmit}
              >
                <span className="relative z-10">
                  {loading ? STR[lang].loading : STR[lang].submit}
                </span>
                <motion.span
                  aria-hidden
                  className="absolute inset-0 blur-lg opacity-60"
                  animate={{ scale: [1, 1.06, 1], opacity: [0.45, 0.7, 0.45] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    background: "linear-gradient(90deg,var(--p1),var(--p2))",
                  }}
                />
              </motion.button>

              {/* socials */}
              <div className="relative text-center">
                <div
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t"
                  style={{ borderColor: "var(--ring)" }}
                />
                <span
                  className="relative bg-[var(--card-bg)] px-2 text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  {STR[lang].or}
                </span>
              </div>
              <SocialButtons />

              {/* login link */}
              <div
                className="text-center text-xs"
                style={{ color: "var(--muted)" }}
              >
                {STR[lang].haveAccount}{" "}
                <Link
                  className="underline"
                  style={{ color: "var(--p2)" }}
                  href={`/login?next=${encodeURIComponent(next)}`}
                  prefetch
                >
                  {STR[lang].login}
                </Link>
              </div>
            </form>

            {/* success overlay */}
            <AnimatePresence>
              {justCreated && (
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-white/80 grid place-items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="mx-auto mb-4 size-16 rounded-full bg-emerald-500 grid place-items-center text-white"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: "var(--heading)" }}
                    >
                      {STR[lang].successTitle}
                    </div>
                    <div
                      className="text-sm mt-1"
                      style={{ color: "var(--muted)" }}
                    >
                      {STR[lang].successSub}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* tokens */}
        <style jsx global>{`
          [data-theme="serene"] {
            --text: #1f2937;
            --heading: #111827;
            --muted: #6b7280;
            --ring: rgba(99, 102, 241, 0.16);
            --chip-bg: #fff;
            --card-bg: #ffffffcc;
            --shadow: 0 12px 30px rgba(17, 24, 39, 0.08);
            --p1: #6d5ef1;
            --p2: #60a5fa;
          }
          [data-theme="neo"] {
            --text: #0f172a;
            --heading: #0b1220;
            --muted: #475569;
            --ring: rgba(109, 94, 241, 0.26);
            --chip-bg: #fff;
            --card-bg: #ffffffe6;
            --shadow: 0 18px 44px rgba(109, 94, 241, 0.18);
            --p1: #6d5ef1;
            --p2: #f15ecc;
          }
        `}</style>
      </main>
    </ThemeProvider>
  );
}
