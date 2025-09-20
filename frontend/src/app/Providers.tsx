  "use client";

  import React, { useEffect } from "react";
  import { Provider as ReduxProvider } from "react-redux";
  import { store } from "@/redux/store";
  import { ThemeProvider } from "next-themes";
  import { ToastProvider } from "@/components/ui/Toaster";
  import { I18nProvider } from "@/components/ui/i18n";

  export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
      const apply = () => {
        try {
          const on = localStorage.getItem("ms_focus") === "1";
          const root = document.documentElement;
          if (on) root.setAttribute("data-focus", "true");
          else root.removeAttribute("data-focus");
        } catch {}
      };
      apply();
      const handler = (e: StorageEvent | Event) => {
        if (e instanceof StorageEvent && e.key && e.key !== "ms_focus") return;
        apply();
      };
      window.addEventListener("storage", handler as any);
      return () => window.removeEventListener("storage", handler as any);
    }, []);

    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
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
