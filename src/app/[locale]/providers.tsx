'use client';

import type React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { queryClient } from '@/lib/queryClient';
import { useLocale } from 'next-intl';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useEffect } from 'react';

const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then(
      (mod) => mod.ReactQueryDevtools
    ),
  { ssr: false, loading: () => null }
);

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
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
