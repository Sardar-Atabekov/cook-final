// Get available locales from environment or use default
export const getAvailableLocales = () => {
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
export const getDefaultLocale = () => {
  return process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
};

// Extract locale from pathname
export const getLocaleFromPathname = (pathname: string): string | null => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const potentialLocale = segments[0];
    const availableLocales = getAvailableLocales();
    if (availableLocales.includes(potentialLocale)) {
      return potentialLocale;
    }
  }
  return null;
};

// Get locale from headers (Accept-Language)
export const getLocaleFromHeaders = (headers: Headers): string => {
  const acceptLanguage = headers.get('accept-language');
  if (!acceptLanguage) return getDefaultLocale();

  const availableLocales = getAvailableLocales();

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [language, quality = '1'] = lang.trim().split(';q=');
      return { language: language.split('-')[0], quality: parseFloat(quality) };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find the first matching locale
  for (const { language } of languages) {
    if (availableLocales.includes(language)) {
      return language;
    }
  }

  return getDefaultLocale();
};
