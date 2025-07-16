/* eslint-disable prettier/prettier */
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Get available locales from environment or use default
const getAvailableLocales = () => {
  const envLocales = process.env.NEXT_PUBLIC_AVAILABLE_LOCALES;
  if (envLocales) {
    return envLocales.split(',').map((locale) => locale.trim());
  }
  // Updated: include all 25 supported languages
  return [
    'en',
    'ru',
    'de',
    'es',
    'zh',
    'fr',
    'ro',
    'sk',
    'tr',
    'sv',
    'sr',
    'pt',
    'pl',
    'nl',
    'ja',
    'it',
    'id',
    'hu',
    'hi',
    'he',
    'fi',
    'el',
    'da',
    'cs',
    'bg',
    'be',
  ];
};

// Get default locale from environment or use 'en'
const getDefaultLocale = () => {
  return process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
};

const locales = getAvailableLocales();
const defaultLocale = getDefaultLocale();

export default getRequestConfig(async ({ locale }) => {
  // Only log in development to reduce noise
  if (process.env.NODE_ENV === 'development') {
    console.log('getRequestConfig called with locale:', locale);
  }

  // Handle undefined locale by using default
  if (!locale) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Locale is undefined, using default:', defaultLocale);
    }
    locale = defaultLocale;
  }

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Locale not found or invalid:', locale);
    }
    // Fallback to default locale instead of notFound to avoid hydration issues
    locale = defaultLocale;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Loading messages for locale:', locale);
  }

  try {
    const messages = (await import(`./locales/${locale}.json`)).default;
    if (process.env.NODE_ENV === 'development') {
      console.log('Messages loaded successfully for locale:', locale);
    }

    return {
      messages,
      locale,
      timeZone: 'Europe/Moscow',
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Error loading messages for locale:', locale, error);
    }
    // Fallback to default locale if messages can't be loaded
    if (locale !== defaultLocale) {
      try {
        const fallbackMessages = (
          await import(`./locales/${defaultLocale}.json`)
        ).default;
        if (process.env.NODE_ENV === 'development') {
          console.log('Using fallback messages for locale:', defaultLocale);
        }
        return {
          messages: fallbackMessages,
          locale: defaultLocale,
          timeZone: 'Europe/Moscow',
        };
      } catch (fallbackError) {
        notFound();
      }
    }
    notFound();
  }
});

export { locales, defaultLocale };
