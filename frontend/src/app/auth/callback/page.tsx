"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { meThunk } from "@/redux/slices/authSlice";
import { useI18n } from "@/components/ui/i18n";

type Phase = "auth" | "redirect" | "error";

export default function OAuthCallback() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { lang } = useI18n();

  // i18n strings
  const L = useMemo(
    () =>
      ((
        {
          en: {
            title: "Completing sign-in…",
            success: "You’re all set! Taking you to your dashboard.",
            fallback:
              "If you’re not redirected automatically, click the button below.",
            go: "Go to dashboard",
            trying: "Checking your account…",
            redirecting: "Redirecting…",
            failedTitle: "Almost there",
            failedHint:
              "We couldn’t confirm the session. You’ll be taken to the dashboard to continue.",
            retry: "Try again",
          },
          ar: {
            title: "جارٍ إتمام تسجيل الدخول…",
            success: "تمام! سيتم نقلك إلى لوحة التحكم.",
            fallback: "إذا لم يتم التحويل تلقائياً، اضغط الزر بالأسفل.",
            go: "اذهب إلى لوحة التحكم",
            trying: "يتم التحقق من حسابك…",
            redirecting: "جاري التحويل…",
            failedTitle: "قاربنا نخلّص",
            failedHint:
              "لم نتمكّن من تأكيد الجلسة. سيتم نقلك إلى لوحة التحكم للمتابعة.",
            retry: "إعادة المحاولة",
          },
        } as const
      )[lang]),
    [lang]
  );

  const [phase, setPhase] = useState<Phase>("auth");
  const redirected = useRef(false); // guard: avoid multi-redirects

  const go = (path = "/dashboard") => {
    if (redirected.current) return; // idempotent
    redirected.current = true;
    router.replace(path);
  };

  useEffect(() => {
    router.prefetch("/dashboard"); // prefetch target route
  }, [router]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    (async () => {
      try {
        await dispatch(meThunk()).unwrap(); // verify session
        setPhase("redirect");
      } catch {
        setPhase("error"); // show fallback
      } finally {
        timer = setTimeout(() => go("/dashboard"), 900); // gentle auto-redirect
      }
    })();
    return () => {
      if (timer) clearTimeout(timer); // cleanup timer
    };
  }, [dispatch]); // safe: runs once (StrictMode double-invoke guarded by ref)

  return (
    <main className="min-h-[70vh] grid place-items-center px-4">
      <section className="relative w-full max-w-md rounded-2xl border bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm p-6 text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full grid place-items-center border bg-white dark:bg-zinc-900 shadow-sm">
          {phase === "auth" && <Spinner className="h-6 w-6" />}
          {phase === "redirect" && (
            <CheckIcon className="h-7 w-7 text-emerald-600" />
          )}
          {phase === "error" && (
            <AlertIcon className="h-7 w-7 text-amber-600" />
          )}
        </div>

        <h1 className="text-lg font-semibold">
          {phase === "error" ? L.failedTitle : L.title}
        </h1>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {phase === "auth" && L.trying}
          {phase === "redirect" && L.success}
          {phase === "error" && L.failedHint}
        </p>

        <div
          aria-hidden="true"
          className="mt-6 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        >
          <div className="h-full w-1/2 animate-[progress_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={() => go("/dashboard")}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            {L.go}
          </button>

          {phase === "error" && (
            <button
              onClick={async () => {
                setPhase("auth"); // UI: show checking
                try {
                  await dispatch(meThunk()).unwrap(); // retry
                  setPhase("redirect");
                } catch {
                  setPhase("error");
                } finally {
                  setTimeout(() => go("/dashboard"), 800); // graceful fallback
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700"
            >
              {L.retry}
            </button>
          )}

          <p className="text-xs text-zinc-500 mt-1">{L.fallback}</p>
        </div>

        <p className="sr-only" aria-live="polite">
          {phase === "auth" && L.trying}
          {phase === "redirect" && L.redirecting}
          {phase === "error" && L.failedHint}
        </p>
      </section>

      <style jsx global>{`
        @keyframes progress {
          0% {
            transform: translateX(-70%);
          }
          50% {
            transform: translateX(20%);
          }
          100% {
            transform: translateX(110%);
          }
        }
      `}</style>
    </main>
  );
}

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      role="status"
      aria-label="loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
function CheckIcon({
  className = "h-6 w-6 text-emerald-600",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"
      />
    </svg>
  );
}
function AlertIcon({
  className = "h-6 w-6 text-amber-600",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
      />
    </svg>
  );
}
