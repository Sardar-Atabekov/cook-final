import type React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from './providers';
import { Navigation } from '@/components/navigation';
import { Toaster } from '@/components/ui/toaster';

const locales = ['en', 'ru', 'de', 'es', 'zh', 'ar', 'fr'];

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { children, params } = props;
  const { locale } = await Promise.resolve(params);

  if (!locales.includes(locale)) {
    notFound();
  }

  console.log('locale', locale);
  const messages = await getMessages({ locale });
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Providers>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>{children}</main>
          <Toaster />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
