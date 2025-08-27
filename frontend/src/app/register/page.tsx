"use client";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerThunk, clearError } from "@/redux/slices/authSlice";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL;

  const submit = async () => {
    await dispatch(clearError());
    await dispatch(registerThunk({ email, password }));
  };

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Create account</h1>

      {!user && (
        <>
          <input
            className="w-full border p-2 rounded"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full p-2 rounded border disabled:opacity-50"
            disabled={loading}
            onClick={submit}
          >
            {loading ? "..." : "Register"}
          </button>

          {googleUrl && (
            <a
              className="block text-center w-full p-2 rounded border"
              href={googleUrl}
            >
              Continue with Google
            </a>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <a className="text-sm underline" href="/login">
            Already have an account? Login
          </a>
        </>
      )}

      {user && (
        <div className="p-3 border rounded bg-green-50">
          <p className="font-medium">تم إنشاء الحساب وتسجيل الدخول ✅</p>
          <p className="text-sm text-gray-600">المستخدم: {user.email}</p>
          <a className="underline text-sm" href="/login">
            الرجوع لتسجيل الدخول
          </a>
        </div>
      )}
    </div>
  );
}
