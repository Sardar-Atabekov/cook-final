import createMiddleware from 'next-intl/middleware';

// Get available locales from environment or use default
const getAvailableLocales = () => {
  const envLocales = process.env.NEXT_PUBLIC_AVAILABLE_LOCALES;
  if (envLocales) {
    return envLocales.split(',').map((locale) => locale.trim());
  }
  return ['en', 'ru', 'de', 'es', 'zh', 'fr'];
};

// Get default locale from environment or use 'en'
const getDefaultLocale = () => {
  return process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
};

const locales = getAvailableLocales();
const defaultLocale = getDefaultLocale();

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use the default locale for the root path
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', `/(${locales.join('|')})/:path*`],
};
