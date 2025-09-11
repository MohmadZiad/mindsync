"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginThunk, meThunk, clearError } from "@/redux/slices/authSlice";

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

export default function LoginPage() {
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

  // Prefetch likely routes
  useEffect(() => {
    router.prefetch("/register"); // prefetch alt route
    if (next) router.prefetch(next); // prefetch post-login
  }, [router, next]);

  // Avoid duplicate me() in StrictMode
  const checkedRef = useRef(false);
  useEffect(() => {
    if (user || checkedRef.current) return; // already known
    checkedRef.current = true;
    dispatch(meThunk()); // cheap session check
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
    dispatch(clearError()); // no await → no UI stall
    const action = await dispatch(loginThunk({ email, password }));
    if (action?.meta?.requestStatus === "fulfilled") {
      router.replace(next); // move to next
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
          {t.welcome}
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
              aria-invalid={!!error}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t.password}</span>
            <div className="flex items-stretch gap-2">
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
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

          <div className="text-center text-xs text-gray-600 dark:text-gray-400">
            {t.noAccount}{" "}
            <Link
              className="text-indigo-600 hover:underline"
              href={`/register?next=${encodeURIComponent(next)}`}
              prefetch
            >
              {t.createOne}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
