"use client";

import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginThunk, meThunk, clearError } from "@/redux/slices/authSlice";

/* ========================================================================== */
/*                              Theme (2 options)                             */
/* ========================================================================== */

type DuoTheme = "serene" | "neo";
type ThemeCtx = { theme: DuoTheme; setTheme: (t: DuoTheme) => void; ready: boolean };

const ThemeContext = createContext<ThemeCtx>({ theme: "serene", setTheme: () => {}, ready: false });
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

/* ------------------------- Mouse-follow background ------------------------ */

function usePointer(ref: React.RefObject<HTMLDivElement>): { sx: MotionValue<number>; sy: MotionValue<number> } {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 90, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 90, damping: 18, mass: 0.4 });

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect(); x.set(r.width/2); y.set(r.height/2);
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      x.set(e.clientX - b.left); y.set(e.clientY - b.top);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [ref]);

  return { sx, sy };
}

function Halo({ sx, sy, size=560, a=0.12 }: { sx: MotionValue<number>; sy: MotionValue<number>; size?: number; a?: number }) {
  const x = useTransform(sx, v => v - size/2);
  const y = useTransform(sy, v => v - size/2);
  return (
    <motion.div
      aria-hidden
      className="absolute rounded-full pointer-events-none"
      style={{
        x, y, width: size, height: size,
        background: `radial-gradient(circle,
          rgba(255,255,255,${Math.min(a+.05,.2)}) 0%,
          rgba(255,255,255,${a}) 30%,
          rgba(109,94,241,${a*.45}) 55%,
          transparent 75%)`,
        filter: "blur(28px)", mixBlendMode: "soft-light" as const
      }}
    />
  );
}

/* ------------------------------ BG: Serene ------------------------------- */
function BGSerene() {
  const ref = useRef<HTMLDivElement>(null);
  const { sx, sy } = usePointer(ref);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-white" />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(1200px 800px at 75% 30%, rgba(109,94,241,0.18) 0%, rgba(109,94,241,0.10) 35%, transparent 70%)",
          filter: "blur(24px)", opacity: .7, animation: "drift1 28s ease-in-out infinite"
        }}
      />
      <div
        className="absolute inset-0 mix-blend-lighten"
        style={{
          background:
            "radial-gradient(1100px 700px at 20% 60%, rgba(241,94,204,0.10) 0%, transparent 60%), radial-gradient(1000px 650px at 65% 80%, rgba(96,165,250,0.10) 0%, transparent 60%)",
          filter: "blur(26px)", opacity: .55, animation: "drift2 36s ease-in-out infinite"
        }}
      />
      <Halo sx={sx} sy={sy} />
    </div>
  );
}

/* ------------------------------- BG: Neo -------------------------------- */
function BGNeo() {
  const ref = useRef<HTMLDivElement>(null);
  const { sx, sy } = usePointer(ref);
  const x = useTransform(sx, v => v - 200);
  const y = useTransform(sy, v => v - 200);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-white" />
      <motion.div
        className="absolute rounded-full mix-blend-screen pointer-events-none"
        style={{
          x, y, width: 400, height: 400,
          background: "conic-gradient(from 0deg, rgba(109,94,241,0.28), rgba(241,94,204,0.24), rgba(96,165,250,0.22), transparent 70%)",
          filter: "blur(26px)"
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(110deg, rgba(109,94,241,0.14) 0 10px, transparent 10px 24px)",
          animation: "lasersMove 8s linear infinite"
        }}
      />
    </div>
  );
}

/* ----------------------------- Theme Picker ----------------------------- */

function ThemePicker({ onClose }: { onClose: () => void }) {
  const { setTheme } = useDuoTheme();
  return (
    <div className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6">
        <h3 className="text-xl font-semibold">اختر الجو العام لصفحة الدخول</h3>
        <p className="text-sm text-gray-500 mb-5">كل خيار يغير الخلفية، الألوان، الظلال وطريقة التفاعل.</p>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <button
            onClick={() => { setTheme("serene"); onClose(); }}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/10 text-left"
          >
            <div className="absolute inset-0"><BGSerene/></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/10" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="rounded-lg bg-white/90 p-3 shadow">
                <div className="font-semibold">Serene Aurora</div>
                <p className="text-sm text-gray-600 mt-1">أبيض/بنفسجي هادئ، هالة تتبع الماوس وضباب لطيف.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { setTheme("neo"); onClose(); }}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/10 text-left"
          >
            <div className="absolute inset-0"><BGNeo/></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/10" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="rounded-lg bg-white/90 p-3 shadow">
                <div className="font-semibold">Neon Play</div>
                <p className="text-sm text-gray-600 mt-1">نيون/ليزر حيوي، خطوط تفاعلية وألوان جريئة.</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                               Your Login page                              */
/* ========================================================================== */

type Lang = "en" | "ar";

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
  },
} as const;

function LoginShell() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const { user, loading, error } = useAppSelector((s) => s.auth);

  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    setLang((localStorage.getItem("ms_lang") as Lang) || "en");
  }, []);
  const t = useMemo(() => STR[lang], [lang]);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

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

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    dispatch(clearError());
    const action = await dispatch(loginThunk({ email, password }));
    if (action?.meta?.requestStatus === "fulfilled") {
      router.replace(next);
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
      {/* Background according to theme */}
      {theme === "neo" ? <BGNeo/> : <BGSerene/>}

      <div className="relative z-10 min-h-screen grid place-items-center px-4">
        <div
          className="w-full max-w-md rounded-2xl p-6 shadow-xl ring-1"
          style={{
            background: "var(--card-bg)",
            color: "var(--text)",
            boxShadow: "var(--shadow)",
            borderColor: "var(--ring)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--heading)" }}>{t.title}</h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{t.welcome}</p>
            </div>

            <button
              onClick={() => setShowPicker(true)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium"
              style={{ borderColor: "var(--ring)", background: "var(--chip-bg)", color: "var(--text)", boxShadow: "var(--shadow)" }}
            >
              اختر التصميم
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t.email}</span>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--ring)", background: "#fff", color: "var(--text)", boxShadow: "var(--shadow)" }}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={!!error}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t.password}</span>
              <div className="flex items-stretch gap-2">
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{ borderColor: "var(--ring)", background: "#fff", color: "var(--text)", boxShadow: "var(--shadow)" }}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="shrink-0 rounded-lg border px-3 text-xs font-medium"
                  style={{ borderColor: "var(--ring)", background: "var(--chip-bg)", color: "var(--text)" }}
                >
                  {showPw ? STR[lang].hide : STR[lang].show}
                </button>
              </div>
            </label>

            {error && (
              <div aria-live="polite" className="rounded-lg px-3 py-2 text-xs"
                   style={{ background: "#fef2f2", color: "#991b1b" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{ background: "var(--primary)", color: "white", boxShadow: "var(--shadow)" }}
            >
              {loading ? STR[lang].loading : STR[lang].submit}
            </button>

            <div className="text-center text-xs" style={{ color: "var(--muted)" }}>
              {STR[lang].noAccount}{" "}
              <Link className="underline" style={{ color: "var(--primary)" }}
                    href={`/register?next=${encodeURIComponent(next)}`} prefetch>
                {STR[lang].createOne}
              </Link>
            </div>
          </form>
        </div>
      </div>

      {showPicker && <ThemePicker onClose={() => setShowPicker(false)} />}

      {/* theme tokens + keyframes */}
      <style jsx global>{`
        @keyframes drift1 { 0%{transform:translate(-2%,-1%) scale(1.02);} 50%{transform:translate(2%,1%) scale(1.03);} 100%{transform:translate(-2%,-1%) scale(1.02);} }
        @keyframes drift2 { 0%{transform:translate(1%,-2%) scale(1.02);} 50%{transform:translate(-1%,2%) scale(1.01);} 100%{transform:translate(1%,-2%) scale(1.02);} }
        @keyframes lasersMove { to { background-position: 120% 0; } }

        /* Serene */
        [data-theme="serene"] {
          --text: #1f2937;
          --heading: #111827;
          --muted: #6b7280;
          --primary: #635bff;
          --ring: rgba(99,102,241,0.18);
          --chip-bg: #ffffff;
          --card-bg: #ffffffcc;
          --shadow: 0 10px 30px rgba(17, 24, 39, 0.08);
        }

        /* Neo */
        [data-theme="neo"] {
          --text: #0f172a;
          --heading: #0b1220;
          --muted: #475569;
          --primary: #6d5ef1;
          --ring: rgba(109,94,241,0.28);
          --chip-bg: #ffffff;
          --card-bg: #ffffffe6;
          --shadow: 0 16px 40px rgba(109, 94, 241, 0.20);
        }
      `}</style>
    </main>
  );
}

/* Export default with ThemeProvider wrapper */
export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginShell />
    </ThemeProvider>
  );
}
