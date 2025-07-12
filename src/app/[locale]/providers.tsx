'use client';

import type React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { useLocale } from 'next-intl';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useEffect } from 'react';

function SyncLocaleWithStore() {
  const locale = useLocale();
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  useEffect(() => {
    setLanguage(locale);
  }, [locale, setLanguage]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SyncLocaleWithStore />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
