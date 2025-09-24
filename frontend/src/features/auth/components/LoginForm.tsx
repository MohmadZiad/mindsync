"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginThunk, clearError } from "@/redux/slices/authSlice";
import { useI18n } from "@/components/ui/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();
  
  const { loading, error } = useAppSelector((s) => s.auth);
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    const result = await dispatch(loginThunk({ email, password, remember } as any));
    if (result.meta.requestStatus === "fulfilled") {
      router.replace(next);
    }
  };

  const labels = {
    title: lang === "ar" ? "تسجيل الدخول" : "Sign In",
    subtitle: lang === "ar" ? "أهلاً بعودتك" : "Welcome back",
    email: lang === "ar" ? "البريد الإلكتروني" : "Email",
    password: lang === "ar" ? "كلمة المرور" : "Password",
    remember: lang === "ar" ? "تذكرني" : "Remember me",
    submit: lang === "ar" ? "تسجيل الدخول" : "Sign In",
    loading: lang === "ar" ? "جاري تسجيل الدخول..." : "Signing in...",
    noAccount: lang === "ar" ? "ليس لديك حساب؟" : "Don't have an account?",
    createAccount: lang === "ar" ? "إنشاء حساب" : "Create account",
    forgotPassword: lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {labels.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {labels.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            type="email"
            placeholder={labels.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            error={error && "Invalid credentials"}
          />
        </div>

        <div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={labels.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
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
            className="text-sm text-indigo-600 hover:text-indigo-500"
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
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={!email.trim() || !password.trim()}
        >
          {loading ? labels.loading : labels.submit}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {labels.noAccount}{" "}
          </span>
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
          >
            {labels.createAccount}
          </Link>
        </div>
      </form>
    </motion.div>
  );
}