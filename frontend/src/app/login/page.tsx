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
import { loginThunk, meThunk, clearError } from "@/redux/slices/authSlice";

/* ========================================================================== */
/*                                   Types                                    */
/* ========================================================================== */

type DuoTheme = "serene" | "neo";
type Lang = "en" | "ar";

type ThemeCtx = {
  theme: DuoTheme;
  setTheme: (t: DuoTheme) => void;
  ready: boolean;
};

const STR = {
  en: {
    title: "Login",
    welcome: "Welcome back 👋",
    email: "Email",
    password: "Password",
    show: "Show",
    hide: "Hide",
    submit: "Login",
    loading: "Logging in…",
    noAccount: "No account?",
    createOne: "Create one",
    redirecting: "Redirecting…",
    remember: "Remember me",
    forgot: "Forgot password?",
    or: "or continue with",
    pickTheme: "Theme",
  },
  ar: {
    title: "تسجيل الدخول",
    welcome: "أهلاً بعودتك 👋",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    show: "عرض",
    hide: "إخفاء",
    submit: "تسجيل الدخول",
    loading: "جاري تسجيل الدخول…",
    noAccount: "ما عندك حساب؟",
    createOne: "أنشئ حسابًا",
    redirecting: "جاري التحويل…",
    remember: "تذكرني",
    forgot: "نسيت كلمة المرور؟",
    or: "أو تابع بواسطة",
    pickTheme: "اختر التصميم",
  },
} as const;

/* ========================================================================== */
/*                               Theme Context                                 */
/* ========================================================================== */

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
    const saved = (localStorage.getItem("login_duo_theme") as DuoTheme) || "serene";
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
/*                               Mouse Helpers                                */
/* ========================================================================== */

function usePointer(
  ref: React.RefObject<HTMLDivElement>
): { sx: MotionValue<number>; sy: MotionValue<number> } {
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
/*                            Premium Backgrounds 2026                         */
/* ========================================================================== */

function BGSerene() {
  const ref = useRef<HTMLDivElement>(null);
  const { sx, sy } = usePointer(ref);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden -z-10">
      {/* silky animated gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
        transition={{ duration: 26, repeat: Infinity, repeatType: "reverse" }}
        style={{
          background: "linear-gradient(120deg,#f7f7ff,#eef2ff,#fdf2ff)",
          backgroundSize: "250% 250%",
        }}
      />
      {/* soft aurora blobs */}
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
      {/* mouse-follow halo */}
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
      {/* conic neon cloud */}
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
      {/* animated laser grid */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ backgroundPosition: ["0 0", "200px 200px"] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
        style={{
          background:
            "repeating-linear-gradient(115deg, rgba(109,94,241,.14) 0 12px, transparent 12px 28px)",
        }}
      />
    </div>
  );
}

/* ========================================================================== */
/*                        Holographic Theme Picker (3D)                        */
/* ========================================================================== */

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { sx, sy } = usePointer(ref);
  const rx = useTransform(sy, [0, 320], [10, -10]);
  const ry = useTransform(sx, [0, 480], [-12, 12]);
  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rx, rotateY: ry }}
      className="[transform-style:preserve-3d] will-change-transform"
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
    >
      {children}
    </motion.div>
  );
}

function ThemeCard({
  active,
  title,
  desc,
  gradient,
  onClick,
}: {
  active?: boolean;
  title: string;
  desc: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, rotate: 0.5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-1 ring-2 ${
        active ? "ring-violet-500" : "ring-transparent"
      }`}
      style={{ background: gradient }}
    >
      <TiltCard>
        {/* live mini preview layer */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-xl p-4 text-start h-full flex flex-col justify-between shadow-xl">
          <div>
            <h4 className="font-bold text-lg flex items-center gap-2">
              <span className="inline-block size-2.5 rounded-full bg-violet-500" />{" "}
              {title}
              {active && <span className="text-xs text-violet-600">(مختار)</span>}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{desc}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 opacity-90">
            <div className="h-8 rounded bg-white shadow-inner" />
            <div className="h-8 rounded bg-white shadow-inner" />
            <div className="col-span-2 h-9 rounded-xl bg-gradient-to-r from-violet-500 to-blue-400" />
          </div>
        </div>
        {/* glossy sweep */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(110deg,transparent 0%,rgba(255,255,255,.18) 30%,transparent 60%)",
            transform: "translateX(-40%)",
          }}
        />
      </TiltCard>
    </motion.button>
  );
}

function ThemePicker({
  onClose,
  tPick,
}: {
  onClose: () => void;
  tPick: string;
}) {
  const { theme, setTheme } = useDuoTheme();

  return (
    <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-md p-6 flex items-center justify-center">
      <motion.div
        initial={{ y: 16, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 10, opacity: 0, scale: 0.98 }}
        className="relative w-full max-w-6xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 p-8 overflow-hidden"
        role="dialog"
        aria-modal
      >
        <h3 className="text-2xl font-extrabold tracking-tight">
          {tPick} – Premium Modes
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          كل خيار يغير الخلفية، الألوان، الظلال والتفاعل. حرّك الماوس فوق
          البطاقات لتجربة المعاينة الحية.
        </p>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          <ThemeCard
            active={theme === "serene"}
            title="Serene Aurora"
            desc="أبيض/بنفسجي هادئ، هالة تتبع الماوس وضباب لطيف."
            gradient="linear-gradient(135deg,#6d5ef1,#60a5fa,#f15ecc)"
            onClick={() => {
              setTheme("serene");
              onClose();
            }}
          />
          <ThemeCard
            active={theme === "neo"}
            title="Neon Play"
            desc="نيون/ليزر حيوي، خطوط تفاعلية وألوان جريئة."
            gradient="linear-gradient(135deg,#f15ecc,#6d5ef1,#60a5fa)"
            onClick={() => {
              setTheme("neo");
              onClose();
            }}
          />
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ========================================================================== */
/*                               Social Buttons                               */
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
          className={`group flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium bg-white transition
            ring-2 ring-inset ${s.ring} hover:shadow-md`}
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
/*                                   Login                                     */
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

function LoginShell() {
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    router.prefetch("/register");
    if (next) router.prefetch(next);
  }, [router, next]);

  const checkedRef = useRef(false);
  useEffect(() => {
    if (user || checkedRef.current) return;
    checkedRef.current = true;
    dispatch(meThunk());
  }, [dispatch, user]);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, router, next]);

  useEffect(() => () => void dispatch(clearError()), [dispatch]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    dispatch(clearError());
    const action = await dispatch(
      loginThunk({ email, password, remember } as any)
    );
    if ((action as any)?.meta?.requestStatus === "fulfilled") {
      setJustLogged(true);
      setTimeout(() => router.replace(next), 650);
    }
  }

  const { theme } = useDuoTheme();

  if (user) {
    return (
      <main dir={dir} className="min-h-[60vh] grid place-items-center">
        <div className="text-sm text-zinc-500">{t.redirecting}</div>
      </main>
    );
  }

  return (
    <main dir={dir} className="relative min-h-screen">
      {theme === "neo" ? <BGNeo /> : <BGSerene />}

      <div className="relative z-10 min-h-screen grid place-items-center px-4">
        {/* premium glow ring behind the card */}
        <div
          aria-hidden
          className="absolute w-[520px] h-[520px] rounded-full blur-3xl opacity-60"
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
          className="w-full max-w-md rounded-3xl p-6 shadow-xl ring-1 relative"
          style={{
            background: "var(--card-bg)",
            color: "var(--text)",
            boxShadow: "var(--shadow)",
            borderColor: "var(--ring)",
          }}
        >
          {/* holographic border */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl">
            <div className="absolute inset-0 rounded-3xl [mask:linear-gradient(white,transparent)] opacity-30"
              style={{
                background:
                  "linear-gradient(90deg,rgba(109,94,241,.35),rgba(241,94,204,.35),rgba(96,165,250,.35))",
                filter: "blur(20px)",
              }}
            />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="size-9 rounded-xl grid place-items-center text-white"
                aria-hidden
                style={{
                  background: "linear-gradient(135deg, var(--p1), var(--p2))",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, .25)",
                }}
              >
                <span className="text-sm font-semibold">MS</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold" style={{ color: "var(--heading)" }}>
                  {t.title}
                </h1>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  {t.welcome}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <button
                aria-label="Toggle language"
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
                onClick={() => setShowPicker(true)}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                style={{
                  borderColor: "var(--ring)",
                  background: "var(--chip-bg)",
                  color: "var(--text)",
                  boxShadow: "var(--shadow)",
                }}
              >
                {t.pickTheme}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
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
                  inputMode="email"
                  autoComplete="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-invalid={!!error}
                />
                <span className="pointer-events-none absolute start-3 top-2 text-[11px] text-gray-500 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[11px]">
                  {t.email}
                </span>
              </div>
            </label>

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
                  autoComplete="current-password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </label>

            {/* Remember + Forgot */}
            <div
              className="flex items-center justify-between text-xs"
              style={{ color: "var(--muted)" }}
            >
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[var(--p2)]"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                {t.remember}
              </label>
              <Link
                href="/forgot"
                className="underline"
                style={{ color: "var(--p2)" }}
              >
                {t.forgot}
              </Link>
            </div>

            {/* Error */}
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

            {/* CTA */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2"
              style={{
                background: "linear-gradient(90deg,var(--p1),var(--p2))",
                color: "white",
                boxShadow:
                  "0 8px 24px rgba(109,94,241,.20), 0 2px 8px rgba(241,94,204,.12)",
              }}
            >
              {loading ? STR[lang].loading : STR[lang].submit}
            </motion.button>

            {/* Socials */}
            <div className="relative text-center">
              <div
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t"
                style={{ borderColor: "var(--ring)" }}
              />
              <span
                className="relative bg-[var(--card-bg)] px-2 text-[11px]"
                style={{ color: "var(--muted)" }}
              >
                {t.or}
              </span>
            </div>
            <SocialButtons />

            {/* Register */}
            <div className="text-center text-xs" style={{ color: "var(--muted)" }}>
              {STR[lang].noAccount}{" "}
              <Link
                className="underline"
                style={{ color: "var(--p2)" }}
                href={`/register?next=${encodeURIComponent(next)}`}
                prefetch
              >
                {STR[lang].createOne}
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      {/* post-login sparkles */}
      <AnimatePresence>
        {justLogged && (
          <motion.div
            className="pointer-events-none fixed inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_30%,rgba(255,255,255,.8)_0_2px,transparent_3px),radial-gradient(circle_at_80%_60%,rgba(255,255,255,.75)_0_2px,transparent_3px)] [background-size:10px_10px] mix-blend-screen" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPicker && (
          <ThemePicker onClose={() => setShowPicker(false)} tPick={t.pickTheme} />
        )}
      </AnimatePresence>

      {/* tokens + keyframes */}
      <style jsx global>{`
        @keyframes lasersMove {
          to {
            background-position: 120% 0;
          }
        }

        /* Serene */
        [data-theme="serene"] {
          --text: #1f2937;
          --heading: #111827;
          --muted: #6b7280;
          --ring: rgba(99, 102, 241, 0.16);
          --chip-bg: #ffffff;
          --card-bg: #ffffffcc;
          --shadow: 0 12px 30px rgba(17, 24, 39, 0.08);
          --p1: #6d5ef1;
          --p2: #60a5fa;
        }

        /* Neo */
        [data-theme="neo"] {
          --text: #0f172a;
          --heading: #0b1220;
          --muted: #475569;
          --ring: rgba(109, 94, 241, 0.26);
          --chip-bg: #ffffff;
          --card-bg: #ffffffe6;
          --shadow: 0 18px 44px rgba(109, 94, 241, 0.18);
          --p1: #6d5ef1;
          --p2: #f15ecc;
        }
      `}</style>
    </main>
  );
}

/* ========================================================================== */
/*                                Export Default                              */
/* ========================================================================== */

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginShell />
    </ThemeProvider>
  );
}
