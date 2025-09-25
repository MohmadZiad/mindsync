"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./cn";

type Toast = {
  id: number;
  title?: string;
  message: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number; // ms
  action?: { label: string; onClick: () => void };
};

type Ctx = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
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
    const duration = t.duration ?? (t.variant === "error" ? 5000 : 4000);
    setToasts((prev) => [...prev, { id, variant: "default", ...t }]);

    let timeout = window.setTimeout(() => remove(id), duration);

    // pause on hover
    const onEnter = () => {
      window.clearTimeout(timeout);
    };
    const onLeave = () => {
      timeout = window.setTimeout(() => remove(id), 1000);
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
  const warning = React.useCallback(
    (message: string, title?: string) => push({ message, title, variant: "warning" }),
    [push]
  );
  const info = React.useCallback(
    (message: string, title?: string) => push({ message, title, variant: "info" }),
    [push]
  );

  return (
    <Ctx.Provider value={{ toasts, push, remove, success, error, warning, info }}>
      {children}
      <motion.div
        className="fixed bottom-4 right-4 z-[90] space-y-2 w-[min(92vw,360px)]"
        role="status"
        aria-live="polite"
        layout
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              default: "🔔",
              success: "✅", 
              error: "❌",
              warning: "⚠️",
              info: "ℹ️"
            };
            
            const borderColors = {
              default: "border-[var(--line)]",
              success: "border-[var(--success)]/30",
              error: "border-[var(--error)]/30", 
              warning: "border-[var(--warning)]/30",
              info: "border-[var(--info)]/30"
            };
            
            const bgColors = {
              default: "bg-[var(--bg-1)]",
              success: "bg-[var(--success-bg)] dark:bg-green-900/20",
              error: "bg-[var(--error-bg)] dark:bg-red-900/20",
              warning: "bg-[var(--warning-bg)] dark:bg-yellow-900/20", 
              info: "bg-[var(--info-bg)] dark:bg-blue-900/20"
            };
            
            return (
              <motion.div
                key={t.id}
                data-toast-id={t.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30 
                }}
                className={cn(
                  "relative overflow-hidden rounded-2xl p-4 shadow-lg backdrop-blur-sm border",
                  bgColors[t.variant || "default"],
                  borderColors[t.variant || "default"]
                )}
              >
                <div className="flex items-start gap-3">
                  <motion.div 
                    className="mt-0.5 text-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  >
                    {icons[t.variant || "default"]}
                  </motion.div>
                  
                  <div className="min-w-0 flex-1">
                    {t.title && (
                      <motion.div 
                        className="font-semibold mb-1 truncate text-[var(--ink-1)]"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {t.title}
                      </motion.div>
                    )}
                    <motion.div 
                      className="text-sm leading-relaxed break-words text-[var(--ink-2)]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      {t.message}
                    </motion.div>
                    
                    {t.action && (
                      <motion.button
                        className="mt-2 text-sm font-medium text-[var(--brand)] hover:underline"
                        onClick={t.action.onClick}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {t.action.label}
                      </motion.button>
                    )}
                  </div>
                  
                  <motion.button
                    className="rounded-lg p-1.5 hover:bg-[var(--bg-2)] transition-colors"
                    aria-label="Close"
                    onClick={() => remove(t.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-sm">✕</span>
                  </motion.button>
                </div>
                
                {/* Enhanced progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--bg-3)]">
                  <motion.div 
                    className="h-1 bg-[var(--brand)] rounded-r"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ 
                      duration: (t.duration ?? 4000) / 1000, 
                      ease: "linear" 
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
