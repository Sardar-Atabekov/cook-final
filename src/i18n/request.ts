const locales = ['en', 'ru', 'de', 'es', 'zh', 'ar', 'fr'];

export default async function getRequestConfig(params: {
  locale?: string;
  requestLocale?: () => string | Promise<string>;
}) {
  let locale = params.locale;

  console.log('getRequestConfig called with params:', {
    locale: params.locale,
    hasRequestLocale: typeof params.requestLocale === 'function',
  });

  // Если locale не передан — пытаемся получить из браузера
  if (!locale && typeof params.requestLocale === 'function') {
    try {
      locale = await params.requestLocale();
      console.log('Detected browser locale:', locale);
    } catch (error) {
      console.warn('Failed to detect browser locale', error);
    }
  }

  // Проверяем, что locale поддерживается
  const safeLocale = locales.includes(locale || '') ? locale : 'en';
  console.log('Final locale selected:', safeLocale);

  return {
    locale: safeLocale,
    messages: require(`../locales/${safeLocale}.json`),
  };
}
