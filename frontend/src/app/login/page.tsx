"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginThunk, meThunk, clearError } from "@/redux/slices/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { dispatch(meThunk()); }, [dispatch]);

  const submit = async () => {
    await dispatch(clearError());
    await dispatch(loginThunk({ email, password }));
  };

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

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
            {loading ? "..." : "Login"}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </>
      )}

      {user && (
        <div className="p-3 border rounded bg-green-50">
          <p className="font-medium">تم تسجيل الدخول ✅</p>
          <p className="text-sm text-gray-600">المستخدم: {user.email}</p>
          <a className="underline text-sm" href="/">الانتقال للصفحة الرئيسية</a>
        </div>
      )}
    </div>
  );
}
