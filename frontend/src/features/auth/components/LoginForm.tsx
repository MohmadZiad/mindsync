"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Chrome, Github, Facebook, Palette } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginThunk, clearError } from "@/redux/slices/authSlice";
import { authService } from "@/services/auth";
import { useI18n } from "@/components/ui/i18n";

type LoginTheme = "minimal" | "gradient" | "aurora" | "sunset" | "ocean" | "forest" | "cosmic" | "neon";

const LOGIN_THEMES: { id: LoginTheme; name: string; nameAr: string }[] = [
  { id: "minimal", name: "Minimal", nameAr: "بسيط" },
  { id: "gradient", name: "Gradient", nameAr: "متدرج" },
  { id: "aurora", name: "Aurora", nameAr: "شفق" },
  { id: "sunset", name: "Sunset", nameAr: "غروب" },
  { id: "ocean", name: "Ocean", nameAr: "محيط" },
  { id: "forest", name: "Forest", nameAr: "غابة" },
  { id: "cosmic", name: "Cosmic", nameAr: "كوني" },
  { id: "neon", name: "Neon", nameAr: "نيون" },
];

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useI18n();
  
  const { loading, error } = useAppSelector((s) => s.auth);
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<LoginTheme>("minimal");
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("login_duo_theme") as LoginTheme;
    if (saved && LOGIN_THEMES.find(t => t.id === saved)) {
      setCurrentTheme(saved);
    }
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.body.className = `login-theme-${currentTheme}`;
    localStorage.setItem("login_duo_theme", currentTheme);
    
    return () => {
      document.body.className = "";
    };
  }, [currentTheme]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    const result = await dispatch(loginThunk({ email, password }));
    if (result.meta.requestStatus === "fulfilled") {
      router.replace(next);
    }
  };

  const handleOAuthLogin = (provider: "google" | "github" | "facebook") => {
    switch (provider) {
      case "google":
        authService.googleRedirect();
        break;
      case "github":
        // GitHub OAuth redirect
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:4000'}/auth/github`;
        break;
      case "facebook":
        // Facebook OAuth redirect
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:4000'}/auth/facebook`;
        break;
    }
  };

  const labels = {
    title: lang === "ar" ? "تسجيل الدخول" : "Sign In",
    subtitle: lang === "ar" ? "أهلاً بعودتك إلى MindSync" : "Welcome back to MindSync",
    email: lang === "ar" ? "البريد الإلكتروني" : "Email",
    password: lang === "ar" ? "كلمة المرور" : "Password",
    remember: lang === "ar" ? "تذكرني" : "Remember me",
    submit: lang === "ar" ? "تسجيل الدخول" : "Sign In",
    loading: lang === "ar" ? "جاري تسجيل الدخول..." : "Signing in...",
    noAccount: lang === "ar" ? "ليس لديك حساب؟" : "Don't have an account?",
    createAccount: lang === "ar" ? "إنشاء حساب" : "Create account",
    forgotPassword: lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?",
    orContinue: lang === "ar" ? "أو تابع مع" : "Or continue with",
    google: lang === "ar" ? "جوجل" : "Google",
    github: lang === "ar" ? "جيت هاب" : "GitHub",
    facebook: lang === "ar" ? "فيسبوك" : "Facebook",
    changeTheme: lang === "ar" ? "تغيير التصميم" : "Change Theme",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="login-floating-1" />
      <div className="login-floating-2" />
      <div className="login-floating-3" />

      {/* Theme Selector */}
      <motion.div
        className="absolute top-4 right-4 z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all"
            title={labels.changeTheme}
          >
            <Palette size={20} />
          </button>

          <AnimatePresence>
            {showThemeSelector && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute top-full right-0 mt-2 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/20 shadow-lg min-w-[200px]"
              >
                <div className="grid grid-cols-2 gap-2">
                  {LOGIN_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setCurrentTheme(theme.id);
                        setShowThemeSelector(false);
                      }}
                      className={`p-2 rounded-lg text-sm transition-all ${
                        currentTheme === theme.id
                          ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {lang === "ar" ? theme.nameAr : theme.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="login-card p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              M
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {labels.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {labels.subtitle}
            </p>
          </motion.div>

          {/* OAuth Providers */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 mb-6"
          >
            <button
              onClick={() => handleOAuthLogin("google")}
              className="oauth-btn google w-full"
            >
              <Chrome size={20} />
              {labels.google}
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin("github")}
                className="oauth-btn github"
              >
                <Github size={18} />
                {labels.github}
              </button>
              
              <button
                onClick={() => handleOAuthLogin("facebook")}
                className="oauth-btn facebook"
              >
                <Facebook size={18} />
                {labels.facebook}
              </button>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                {labels.orContinue}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <input
                type="email"
                placeholder={labels.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={labels.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {labels.remember}
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                {labels.forgotPassword}
              </Link>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!email.trim() || !password.trim() || loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? labels.loading : labels.submit}
            </button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-6"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {labels.noAccount}{" "}
            </span>
            <Link
              href={`/register?next=${encodeURIComponent(next)}`}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
            >
              {labels.createAccount}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}