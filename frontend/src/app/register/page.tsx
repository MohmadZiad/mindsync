"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
    success: "Account created & signed in ✅",
    youAre: "User",
    goHome: "Go to homepage",
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
    success: "تم إنشاء الحساب وتسجيل الدخول ✅",
    youAre: "المستخدم",
    goHome: "الانتقال للرئيسية",
  },
} as const;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, error } = useAppSelector((s) => s.auth);

  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const l =
      (typeof window !== "undefined"
        ? (localStorage.getItem("ms_lang") as Lang | null)
        : null) || "en";
    setLang(l);
  }, []);
  const t = useMemo(() => STR[lang], [lang]);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL;

  useEffect(() => {
    dispatch(meThunk());
  }, [dispatch]);

  useEffect(() => {
    if (user) router.push("/#dashboard");
  }, [user, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await dispatch(clearError());
    const action = await dispatch(registerThunk({ email, password }));
    if (action?.meta?.requestStatus === "fulfilled") {
      router.push("/#dashboard");
    }
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

        {!user ? (
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
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
              <span className="mb-1 block text-sm font-medium">
                {t.password}
              </span>
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

            {googleUrl && (
              <>
                <div className="text-center text-[11px] uppercase tracking-wider text-gray-500">
                  {" "}
                  {t.or}{" "}
                </div>
                <a
                  className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  href={googleUrl}
                  rel="noopener noreferrer"
                >
                  {t.withGoogle}
                </a>
              </>
            )}

            <div className="text-center text-xs text-gray-600 dark:text-gray-400">
              {t.haveAccount}{" "}
              <a className="text-indigo-600 hover:underline" href="/login">
                {t.login}
              </a>
            </div>
          </form>
        ) : (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm dark:border-green-900/40 dark:bg-green-900/20">
            <p className="font-medium">{t.success}</p>
            <p className="text-gray-700 dark:text-gray-300 mt-1">
              {t.youAre}: {user.email}
            </p>
            <a
              className="mt-2 inline-block text-indigo-600 hover:underline"
              href="/#dashboard"
            >
              {t.goHome}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
