import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MindSync',
  description: 'Track your mental habits and grow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
