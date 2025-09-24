"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, X } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerThunk, clearError } from "@/redux/slices/authSlice";
import { useI18n } from "@/components/ui/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AuthProviders from "./AuthProviders";

function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", test: (p: string) => p.length >= 8 },
    { label: "Lowercase", test: (p: string) => /[a-z]/.test(p) },
    { label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Number", test: (p: string) => /[0-9]/.test(p) },
    { label: "Special char", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const score = checks.reduce((acc, check) => acc + (check.test(password) ? 1 : 0), 0);
  const strength = score < 2 ? "weak" : score < 4 ? "medium" : "strong";
  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? strengthColors[strength] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        {checks.map((check, i) => (
          <div
            key={i}
            className={`flex items-center space-x-1 ${
              check.test(password) ? "text-green-600" : "text-gray-400"
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

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
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
        name: formData.name,
      })
    );
    
    if (result.meta.requestStatus === "fulfilled") {
      router.replace(next);
    }
  };

  const labels = {
    title: lang === "ar" ? "إنشاء حساب" : "Create Account",
    subtitle: lang === "ar" ? "انضم إلينا اليوم" : "Join us today",
    name: lang === "ar" ? "الاسم الكامل" : "Full Name",
    email: lang === "ar" ? "البريد الإلكتروني" : "Email",
    password: lang === "ar" ? "كلمة المرور" : "Password",
    confirmPassword: lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password",
    terms: lang === "ar" ? "أوافق على الشروط والأحكام" : "I agree to the Terms and Conditions",
    submit: lang === "ar" ? "إنشاء الحساب" : "Create Account",
    loading: lang === "ar" ? "جاري الإنشاء..." : "Creating account...",
    haveAccount: lang === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?",
    signIn: lang === "ar" ? "تسجيل الدخول" : "Sign in",
    passwordMismatch: lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords don't match",
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
        <Input
          type="text"
          placeholder={labels.name}
          value={formData.name}
          onChange={handleChange("name")}
          required
          autoComplete="name"
        />

        <Input
          type="email"
          placeholder={labels.email}
          value={formData.email}
          onChange={handleChange("email")}
          required
          autoComplete="email"
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
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          {formData.password && (
            <PasswordStrengthIndicator password={formData.password} />
          )}
        </div>

        <div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={labels.confirmPassword}
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            required
            autoComplete="new-password"
            error={
              formData.confirmPassword && !passwordsMatch
                ? labels.passwordMismatch
                : false
            }
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {labels.terms}
          </label>
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
          disabled={!canSubmit}
        >
          {loading ? labels.loading : labels.submit}
        </Button>

        <AuthProviders />

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {labels.haveAccount}{" "}
          </span>
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
          >
            {labels.signIn}
          </Link>
        </div>
      </form>
    </motion.div>
  );
}