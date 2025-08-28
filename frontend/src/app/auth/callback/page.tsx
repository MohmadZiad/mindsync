"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { meThunk } from "@/redux/slices/authSlice";

export default function OAuthCallback() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      try {
        await dispatch(meThunk()).unwrap();
      } catch {
      }
      router.replace("/dashboard");
    })();
  }, [dispatch, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg">جارٍ إتمام تسجيل الدخول...</div>
        <div className="text-sm text-zinc-500">سيتم تحويلك تلقائياً</div>
      </div>
    </div>
  );
}
