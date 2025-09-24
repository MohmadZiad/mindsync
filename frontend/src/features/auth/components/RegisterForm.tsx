"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
<<<<<<< HEAD
import { Eye, EyeOff, Check, X, Chrome, Github, Facebook, Palette } from "lucide-react";
=======
import {
  Eye,
  EyeOff,
  Check,
  X,
  Chrome,
  Github,
  Facebook,
  Palette,
} from "lucide-react";
>>>>>>> ceff6d8 (E)

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerThunk, clearError } from "@/redux/slices/authSlice";
import { authService } from "@/services/auth";
import { useI18n } from "@/components/ui/i18n";

<<<<<<< HEAD
type LoginTheme = "minimal" | "gradient" | "aurora" | "sunset" | "ocean" | "forest" | "cosmic" | "neon";
=======
type LoginTheme =
  | "minimal"
  | "gradient"
  | "aurora"
  | "sunset"
  | "ocean"
  | "forest"
  | "cosmic"
  | "neon";
>>>>>>> ceff6d8 (E)

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

<<<<<<< HEAD
function PasswordStrengthIndicator({ password, lang }: { password: string; lang: "en" | "ar" }) {
  const checks = [
    { 
      label: lang === "ar" ? "8+ أحرف" : "8+ characters", 
      test: (p: string) => p.length >= 8 
    },
    { 
      label: lang === "ar" ? "حرف صغير" : "Lowercase", 
      test: (p: string) => /[a-z]/.test(p) 
    },
    { 
      label: lang === "ar" ? "حرف كبير" : "Uppercase", 
      test: (p: string) => /[A-Z]/.test(p) 
    },
    { 
      label: lang === "ar" ? "رقم" : "Number", 
      test: (p: string) => /[0-9]/.test(p) 
    },
    { 
      label: lang === "ar" ? "رمز خاص" : "Special char", 
      test: (p: string) => /[^A-Za-z0-9]/.test(p) 
=======
function PasswordStrengthIndicator({
  password,
  lang,
}: {
  password: string;
  lang: "en" | "ar";
}) {
  const checks = [
    {
      label: lang === "ar" ? "8+ أحرف" : "8+ characters",
      test: (p: string) => p.length >= 8,
    },
    {
      label: lang === "ar" ? "حرف صغير" : "Lowercase",
      test: (p: string) => /[a-z]/.test(p),
    },
    {
      label: lang === "ar" ? "حرف كبير" : "Uppercase",
      test: (p: string) => /[A-Z]/.test(p),
    },
    {
      label: lang === "ar" ? "رقم" : "Number",
      test: (p: string) => /[0-9]/.test(p),
    },
    {
      label: lang === "ar" ? "رمز خاص" : "Special char",
      test: (p: string) => /[^A-Za-z0-9]/.test(p),
>>>>>>> ceff6d8 (E)
    },
  ];

  const score = checks.reduce(
    (acc, check) => acc + (check.test(password) ? 1 : 0),
    0
  );
  const strength = score < 2 ? "weak" : score < 4 ? "medium" : "strong";
  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500", 
    strong: "bg-green-500",
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
<<<<<<< HEAD
              i <= score ? strengthColors[strength] : "bg-gray-200 dark:bg-gray-700"
=======
              i <= score
                ? strengthColors[strength]
                : "bg-gray-200 dark:bg-gray-700"
>>>>>>> ceff6d8 (E)
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        {checks.map((check, i) => (
          <div
            key={i}
            className={`flex items-center space-x-1 ${
<<<<<<< HEAD
              check.test(password) ? "text-green-600 dark:text-green-400" : "text-gray-400"
=======
              check.test(password)
                ? "text-green-600 dark:text-green-400"
                : "text-gray-400"
>>>>>>> ceff6d8 (E)
            }`}
          >
            {check.test(password) ? <Check size={12} /> : <X size={12} />}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useI18n();

  const { loading, error } = useAppSelector((s) => s.auth);
  const next = searchParams.get("next") || "/dashboard";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<LoginTheme>("gradient");
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Load saved theme
  useEffect(() => {
<<<<<<< HEAD
    const saved = localStorage.getItem("login_duo_theme") as LoginTheme;
    if (saved && LOGIN_THEMES.find(t => t.id === saved)) {
=======
    const saved = localStorage.getItem("login_theme") as LoginTheme;
    if (saved && LOGIN_THEMES.find((t) => t.id === saved)) {
>>>>>>> ceff6d8 (E)
      setCurrentTheme(saved);
    }
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.body.className = `login-theme-${currentTheme}`;
<<<<<<< HEAD
    localStorage.setItem("login_duo_theme", currentTheme);
    
=======
    localStorage.setItem("login_theme", currentTheme);

>>>>>>> ceff6d8 (E)
    return () => {
      document.body.className = "";
    };
  }, [currentTheme]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleOAuthRegister = (provider: "google" | "github" | "facebook") => {
    switch (provider) {
      case "google":
        authService.googleRedirect();
        break;
      case "github":
        window.location.href = "/auth/github";
        break;
      case "facebook":
        window.location.href = "/auth/facebook";
        break;
    }
  };

  const handleOAuthRegister = (provider: "google" | "github" | "facebook") => {
    switch (provider) {
      case "google":
        authService.googleRedirect();
        break;
      case "github":
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:4000'}/auth/github`;
        break;
      case "facebook":
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:4000'}/auth/facebook`;
        break;
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const canSubmit =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    passwordsMatch &&
    agreeToTerms &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const result = await dispatch(
      registerThunk({
        email: formData.email,
        password: formData.password,
      })
    );

    if (result.meta.requestStatus === "fulfilled") {
      router.replace(next);
    }
  };

  const labels = {
    title: lang === "ar" ? "إنشاء حساب" : "Create Account",
    subtitle: lang === "ar" ? "انضم إلى MindSync اليوم" : "Join MindSync today",
    name: lang === "ar" ? "الاسم الكامل" : "Full Name",
    email: lang === "ar" ? "البريد الإلكتروني" : "Email",
    password: lang === "ar" ? "كلمة المرور" : "Password",
    confirmPassword: lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password",
    terms:
      lang === "ar"
        ? "أوافق على الشروط والأحكام"
        : "I agree to the Terms and Conditions",
    submit: lang === "ar" ? "إنشاء الحساب" : "Create Account",
    loading: lang === "ar" ? "جاري الإنشاء..." : "Creating account...",
    haveAccount:
      lang === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?",
    signIn: lang === "ar" ? "تسجيل الدخول" : "Sign in",
<<<<<<< HEAD
    passwordMismatch: lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords don't match",
=======
    passwordMismatch:
      lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords don't match",
>>>>>>> ceff6d8 (E)
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

      {/* Main Register Card */}
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
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
              onClick={() => handleOAuthRegister("google")}
              className="oauth-btn google w-full"
            >
              <Chrome size={20} />
              {labels.google}
            </button>
<<<<<<< HEAD
            
=======

>>>>>>> ceff6d8 (E)
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthRegister("github")}
                className="oauth-btn github"
              >
                <Github size={18} />
                {labels.github}
              </button>
<<<<<<< HEAD
              
=======

>>>>>>> ceff6d8 (E)
              <button
                onClick={() => handleOAuthRegister("facebook")}
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

          {/* Registration Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
<<<<<<< HEAD
            <input
=======
            <Input
>>>>>>> ceff6d8 (E)
              type="text"
              placeholder={labels.name}
              value={formData.name}
              onChange={handleChange("name")}
              required
              autoComplete="name"
<<<<<<< HEAD
              className="input"
            />

            <input
=======
            />

            <Input
>>>>>>> ceff6d8 (E)
              type="email"
              placeholder={labels.email}
              value={formData.email}
              onChange={handleChange("email")}
              required
              autoComplete="email"
<<<<<<< HEAD
              className="input"
            />

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={labels.password}
                  value={formData.password}
                  onChange={handleChange("password")}
                  required
                  autoComplete="new-password"
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
              {formData.password && (
                <PasswordStrengthIndicator password={formData.password} lang={lang} />
=======
            />

            <div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={labels.password}
                value={formData.password}
                onChange={handleChange("password")}
                required
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              {formData.password && (
                <PasswordStrengthIndicator
                  password={formData.password}
                  lang={lang}
                />
>>>>>>> ceff6d8 (E)
              )}
            </div>

            <div>
<<<<<<< HEAD
              <input
=======
              <Input
>>>>>>> ceff6d8 (E)
                type={showPassword ? "text" : "password"}
                placeholder={labels.confirmPassword}
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                required
                autoComplete="new-password"
<<<<<<< HEAD
                className={`input ${
                  formData.confirmPassword && !passwordsMatch
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              />
              {formData.confirmPassword && !passwordsMatch && (
                <div className="form-error">{labels.passwordMismatch}</div>
              )}
=======
                error={
                  formData.confirmPassword && !passwordsMatch
                    ? labels.passwordMismatch
                    : false
                }
              />
>>>>>>> ceff6d8 (E)
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
<<<<<<< HEAD
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
=======
              <label
                htmlFor="terms"
                className="ml-2 text-sm text-gray-600 dark:text-gray-400"
              >
>>>>>>> ceff6d8 (E)
                {labels.terms}
              </label>
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

<<<<<<< HEAD
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary w-full mt-6"
            >
              {loading ? labels.loading : labels.submit}
            </button>
=======
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={!canSubmit}
              className="mt-6"
            >
              {loading ? labels.loading : labels.submit}
            </Button>
>>>>>>> ceff6d8 (E)
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-6"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {labels.haveAccount}{" "}
            </span>
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
            >
              {labels.signIn}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
