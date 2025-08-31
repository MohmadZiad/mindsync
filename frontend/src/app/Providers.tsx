"use client";

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/Toaster";
import { I18nProvider } from "@/components/ui/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
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
