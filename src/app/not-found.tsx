'use client';

import { useEffect, useState } from 'react';
import { getLocaleFromPathname, getDefaultLocale } from '@/lib/locale-utils';

// 404 messages for different locales
const notFoundMessages = {
  en: {
    title: 'Page Not Found',
    description: "Sorry, we couldn't find the page you're looking for.",
    home: 'Go Home',
    back: 'Go Back',
  },
  ru: {
    title: 'Страница не найдена',
    description: 'Извините, мы не смогли найти страницу, которую вы ищете.',
    home: 'На главную',
    back: 'Назад',
  },
  de: {
    title: 'Seite nicht gefunden',
    description: 'Entschuldigung, wir konnten die gesuchte Seite nicht finden.',
    home: 'Zur Startseite',
    back: 'Zurück',
  },
  es: {
    title: 'Página no encontrada',
    description: 'Lo sentimos, no pudimos encontrar la página que buscas.',
    home: 'Ir al inicio',
    back: 'Volver',
  },
  zh: {
    title: '页面未找到',
    description: '抱歉，我们找不到您要查找的页面。',
    home: '返回首页',
    back: '返回',
  },
  fr: {
    title: 'Page non trouvée',
    description:
      "Désolé, nous n'avons pas pu trouver la page que vous recherchez.",
    home: 'Accueil',
    back: 'Retour',
  },
};

export default function NotFound() {
  const [locale, setLocale] = useState(getDefaultLocale());
  const [messages, setMessages] = useState(notFoundMessages.en);

  useEffect(() => {
    // Try to get locale from current pathname
    const pathname = window.location.pathname;
    const detectedLocale = getLocaleFromPathname(pathname);

    if (
      detectedLocale &&
      notFoundMessages[detectedLocale as keyof typeof notFoundMessages]
    ) {
      setLocale(detectedLocale);
      setMessages(
        notFoundMessages[detectedLocale as keyof typeof notFoundMessages]
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {messages.title}
          </h2>
          <p className="text-gray-600">{messages.description}</p>
        </div>

        <div className="space-y-3">
          <a
            href={`/${locale}`}
            className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            {messages.home}
          </a>
        </div>
      </div>
    </div>
  );
}
