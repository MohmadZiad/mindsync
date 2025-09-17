// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./Providers";
import PageTransition from "@/components/layout/PageTransition";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://your-domain.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "MindSync",
  description: "Track your mental habits and grow.",
  openGraph: {
    title: "MindSync — Track, Reflect, Grow",
    description:
      "Build healthy routines with daily reflections and smart insights.",
    url: APP_URL,
    siteName: "MindSync",
    images: [
      { url: `${APP_URL}/og.png`, width: 1200, height: 630, alt: "MindSync" },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindSync — Track, Reflect, Grow",
    images: [`${APP_URL}/og.png`],
  },
  icons: { icon: "/favicon.ico" },
  alternates: { canonical: APP_URL },
};

export const viewport: Viewport = {
  themeColor: "#111827",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var d = document.documentElement;
    var saved = localStorage.getItem('theme'); 
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) d.classList.add('dark');
    else d.classList.remove('dark');
  } catch (e) {}
})();`.trim(),
          }}
        />
      </head>
      <body className="bg-page text-[var(--ink-1)] antialiased overflow-x-hidden">
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
