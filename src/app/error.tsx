'use client';

import { useEffect, useState } from 'react';
import { getLocaleFromPathname, getDefaultLocale } from '@/lib/locale-utils';

// Error messages for different locales
const errorMessages = {
  en: {
    title: 'Something went wrong!',
    description:
      'An unexpected error occurred. Please try refreshing the page.',
    refresh: 'Refresh Page',
    home: 'Go Home',
  },
  ru: {
    title: 'Что-то пошло не так!',
    description:
      'Произошла непредвиденная ошибка. Попробуйте обновить страницу.',
    refresh: 'Обновить страницу',
    home: 'На главную',
  },
  de: {
    title: 'Etwas ist schiefgelaufen!',
    description:
      'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie, die Seite zu aktualisieren.',
    refresh: 'Seite aktualisieren',
    home: 'Zur Startseite',
  },
  es: {
    title: '¡Algo salió mal!',
    description: 'Ocurrió un error inesperado. Intente actualizar la página.',
    refresh: 'Actualizar página',
    home: 'Ir al inicio',
  },
  zh: {
    title: '出现错误！',
    description: '发生意外错误。请尝试刷新页面。',
    refresh: '刷新页面',
    home: '返回首页',
  },
  fr: {
    title: "Quelque chose s'est mal passé !",
    description:
      "Une erreur inattendue s'est produite. Veuillez essayer de rafraîchir la page.",
    refresh: 'Actualiser la page',
    home: 'Accueil',
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState(getDefaultLocale());
  const [messages, setMessages] = useState(errorMessages.en);

  useEffect(() => {
    // Try to get locale from current pathname
    const pathname = window.location.pathname;
    const detectedLocale = getLocaleFromPathname(pathname);

    if (
      detectedLocale &&
      errorMessages[detectedLocale as keyof typeof errorMessages]
    ) {
      setLocale(detectedLocale);
      setMessages(errorMessages[detectedLocale as keyof typeof errorMessages]);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {messages.title}
          </h1>
          <p className="text-gray-600">{messages.description}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {messages.refresh}
          </button>

          <button
            onClick={() => (window.location.href = `/${locale}`)}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            {messages.home}
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
