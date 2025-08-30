import "./globals.css";
import type { Metadata } from "next";
import Providers from "./Providers";
import { Toaster } from "react-hot-toast";
import AuthBootstrap from "@/components/AuthBootstrap"; // 👈 جديد

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
  // يضبط lang/dir قبل الـ hydration لتفادي الـ layout shift
  const code = `
    try {
      var l = localStorage.getItem('ms_lang') || 'en';
      var d = (l === 'ar') ? 'rtl' : 'ltr';
      document.documentElement.lang = (l === 'ar') ? 'ar' : 'en';
      document.documentElement.dir = d;
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <DirLangScript />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* لو بتستعمل خط خارجي */}
        {/* <link rel="preload" href="/bg-loop.mp4" as="video" /> */}
      </head>
      <body className="bg-white dark:bg-gray-950">
        <Providers>
          <AuthBootstrap /> 
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </Providers>
      </body>
    </html>
  );
}
