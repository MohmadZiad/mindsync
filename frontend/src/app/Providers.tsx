// app/Providers.tsx
"use client";

import React, { useEffect } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/Toaster";
import { I18nProvider } from "@/components/ui/i18n";

const FOCUS_KEY = "ms-focus"; // "1" | "0"

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      try {
        const on = localStorage.getItem(FOCUS_KEY) === "1";
        const root = document.documentElement;
        if (on) root.setAttribute("data-focus", "true");
        else root.removeAttribute("data-focus");
      } catch {}
    };

    apply(); // once

    // Cross-tab updates
    const onStorage = (e: StorageEvent) => {
      if (e.key !== FOCUS_KEY) return;
      apply();
    };

    // Same-tab instant updates (يُطلق من FocusModeToggle)
    const onCustom = () => apply();

    window.addEventListener("storage", onStorage);
    window.addEventListener("ms:focus", onCustom as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ms:focus", onCustom as EventListener);
    };
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="ms-theme"
      disableTransitionOnChange
    >
      <I18nProvider>
        <ToastProvider>
          <ReduxProvider store={store}>{children}</ReduxProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
