import type React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from './providers';
import { Navigation } from '@/components/navigation';
import { Toaster } from '@/components/ui/toaster';
import { PreloadCategories } from '@/components/preload-categories';

const locales = ['en', 'ru', 'de', 'es', 'zh', 'fr'];

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { children, params } = props;
  const { locale } = await Promise.resolve(params);

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Providers>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>{children}</main>
          <Toaster />
          <PreloadCategories />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
