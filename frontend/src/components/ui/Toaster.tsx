"use client";
import * as React from "react";
import { cn } from "./cn";

type Toast = {
  id: number;
  title?: string;
  message: string;
  variant?: "default" | "success" | "error";
  duration?: number; // ms
};

type Ctx = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
};

const Ctx = React.createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(1);

  const remove = React.useCallback((id: number) => {
    setToasts((ts) => ts.filter((x) => x.id !== id));
  }, []);

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = idRef.current++;
    const duration = t.duration ?? 3500;
    setToasts((prev) => [...prev, { id, variant: "default", ...t }]);

    let timeout = window.setTimeout(() => remove(id), duration);

    // pause on hover
    const onEnter = () => {
      window.clearTimeout(timeout);
    };
    const onLeave = () => {
      timeout = window.setTimeout(() => remove(id), 900);
    };

    // attach listeners later via dataset
    queueMicrotask(() => {
      const el = document.querySelector<HTMLElement>(`[data-toast-id="${id}"]`);
      if (el) {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      }
    });
  }, [remove]);

  const success = React.useCallback(
    (message: string, title?: string) => push({ message, title, variant: "success" }),
    [push]
  );
  const error = React.useCallback(
    (message: string, title?: string) => push({ message, title, variant: "error" }),
    [push]
  );

  return (
    <Ctx.Provider value={{ toasts, push, remove, success, error }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[90] space-y-2 w-[min(92vw,360px)]"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            data-toast-id={t.id}
            className={cn(
              "cardish p-3 shadow-xl theme-smooth bg-[var(--bg-1)]",
              t.variant === "success" && "border-[hsl(var(--success))]/50",
              t.variant === "error" && "border-[hsl(var(--danger))]/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {t.variant === "success" ? "✅" : t.variant === "error" ? "⚠️" : "🔔"}
              </div>
              <div className="min-w-0 flex-1">
                {t.title && <div className="font-semibold mb-0.5 truncate">{t.title}</div>}
                <div className="text-sm leading-5 break-words">{t.message}</div>
              </div>
              <button
                className="rounded-lg p-1 hover:bg-[var(--bg-2)]"
                aria-label="Close"
                onClick={() => remove(t.id)}
              >
                ✕
              </button>
            </div>
            {/* progress bar */}
            <div className="mt-2 h-1 bg-[var(--bg-2)] rounded">
              <div className="h-1 bg-[var(--brand)] rounded animate-[toastbar_3.5s_linear_forwards]" />
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
