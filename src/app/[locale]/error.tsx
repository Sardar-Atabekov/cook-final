'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getAvailableLocales, getDefaultLocale } from '@/lib/locale-utils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');
  const availableLocales = getAvailableLocales();
  const defaultLocale = getDefaultLocale();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Localized error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('refresh')}
          </button>

          <button
            onClick={() => (window.location.href = `/${defaultLocale}`)}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            {t('home')}
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
