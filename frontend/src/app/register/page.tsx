"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerThunk, clearError, meThunk } from "@/redux/slices/authSlice";

type Lang = "en" | "ar";

const STR = {
  en: {
    title: "Create account",
    subtitle: "It takes less than a minute ✨",
    email: "Email",
    password: "Password",
    show: "Show",
    hide: "Hide",
    submit: "Create account",
    loading: "Creating…",
    or: "or",
    withGoogle: "Continue with Google",
    haveAccount: "Already have an account?",
    login: "Login",
    redirecting: "Redirecting…",
  },
  ar: {
    title: "إنشاء حساب",
    subtitle: "رح ياخد أقل من دقيقة ✨",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    show: "عرض",
    hide: "إخفاء",
    submit: "إنشاء الحساب",
    loading: "جاري الإنشاء…",
    or: "أو",
    withGoogle: "المتابعة عبر Google",
    haveAccount: "عندك حساب؟",
    login: "تسجيل الدخول",
    redirecting: "جاري التحويل…",
  },
} as const;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const { user, loading, error } = useAppSelector((s) => s.auth);

  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    setLang((localStorage.getItem("ms_lang") as Lang) || "en"); // hydrate lang
  }, []);
  const t = useMemo(() => STR[lang], [lang]);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // OAuth URL (optional)
  const baseGoogleUrl = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL || "";
  const googleHref = useMemo(() => {
    if (!baseGoogleUrl) return "";
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = new URL(baseGoogleUrl);
      if (!url.searchParams.has("redirect_uri")) {
        url.searchParams.set("redirect_uri", `${origin}/auth/callback`); // ensure callback
      }
      return url.toString();
    } catch {
      return baseGoogleUrl; // fallback
    }
  }, [baseGoogleUrl]);

  // Prefetch likely routes
  useEffect(() => {
    router.prefetch("/login"); // prefetch alt route
    if (next) router.prefetch(next); // prefetch post-register
  }, [router, next]);

  // Avoid duplicate me() in StrictMode
  const checkedRef = useRef(false);
  useEffect(() => {
    if (user || checkedRef.current) return;
    checkedRef.current = true;
    dispatch(meThunk()); // check if already signed in
  }, [dispatch, user]);

  // Fast redirect if user exists
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, router, next]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Client guard: avoid empty submit
    if (!email.trim() || !password.trim()) return;
    dispatch(clearError());
    const action = await dispatch(registerThunk({ email, password }));
    if (action?.meta?.requestStatus === "fulfilled") {
      router.replace(next); // to dashboard (or next)
    }
  }

  if (user) {
    return (
      <main dir={dir} className="min-h-[60vh] grid place-items-center">
        <div className="text-sm text-zinc-500">{t.redirecting}</div>
      </main>
    );
  }

  return (
    <main
      dir={dir}
      className="min-h-screen grid place-items-center bg-gray-50 dark:bg-gray-950 px-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t.subtitle}
        </p>

        {/* Remove noValidate → let browser validate */}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t.email}</span>
            <input
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t.password}</span>
            <div className="flex items-stretch gap-2">
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="shrink-0 rounded-lg border border-gray-300 px-3 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {showPw ? t.hide : t.show}
              </button>
            </div>
          </label>

          {error && (
            <div
              aria-live="polite"
              className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/30"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? t.loading : t.submit}
          </button>

          {googleHref && (
            <>
              <div className="text-center text-[11px] uppercase tracking-wider text-gray-500 mt-2">
                {t.or}
              </div>
              <a
                className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                href={googleHref}
                rel="noopener noreferrer"
              >
                {t.withGoogle}
              </a>
            </>
          )}

          <div className="text-center text-xs text-gray-600 dark:text-gray-400">
            {t.haveAccount}{" "}
            <Link
              className="text-indigo-600 hover:underline"
              href={`/login?next=${encodeURIComponent(next)}`}
              prefetch
            >
              {t.login}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
