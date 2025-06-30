import type React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { useLocale } from 'next-intl';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  const locale = useLocale();
  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="hsl(207, 90%, 54%)" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
