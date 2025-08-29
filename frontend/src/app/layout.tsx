
import "./globals.css";
import type { Metadata } from "next";
import Providers from "./Providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "MindSync",
  description: "Track your mental habits and grow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950">
        <Providers>
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </Providers>
      </body>
    </html>
  );
}
