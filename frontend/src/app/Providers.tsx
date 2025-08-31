"use client";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/Toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <LanguageProvider>
        <ToastProvider>
          <ReduxProvider store={store}>{children}</ReduxProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
