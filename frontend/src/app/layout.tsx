import "./globals.css";
import type { Metadata } from "next";
import Providers from "./Providers";
import { Toaster } from "react-hot-toast";
import AuthBootstrap from "@/components/AuthBootstrap";
import { I18nProvider } from "@/components/i18n";

export const metadata: Metadata = {
  title: "MindSync",
  description: "Track your mental habits and grow.",
  openGraph: {
    title: "MindSync — Track, Reflect, Grow",
    description:
      "Build healthy routines with daily reflections and smart insights.",
    url: "https://your-domain.com",
    siteName: "MindSync",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MindSync" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindSync — Track, Reflect, Grow",
    description:
      "Build healthy routines with daily reflections and smart insights.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.ico" },
};

function DirLangScript() {
  // يقرر اللغة قبل الـ hydration (ويحفظها إذا مش محفوظة)
  const code = `
    try {
      var stored = localStorage.getItem('ms_lang');
      var guess = (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
      var l = stored || guess || 'ar';
      var d = (l === 'ar') ? 'rtl' : 'ltr';
      document.documentElement.lang = (l === 'ar') ? 'ar' : 'en';
      document.documentElement.dir  = d;
      if (!stored) localStorage.setItem('ms_lang', l);
    } catch (e) {}
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <DirLangScript />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
      </head>
      <body className="bg-white dark:bg-gray-950">
        <I18nProvider>
          <Providers>
            <AuthBootstrap />
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
