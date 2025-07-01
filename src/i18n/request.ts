const locales = ['en', 'ru', 'de', 'es', 'zh', 'ar', 'fr'];

export default async function getRequestConfig(params: any) {
  let locale = params.locale;
  if (!locale && typeof params.requestLocale === 'function') {
    locale = await params.requestLocale();
  }
  // fallback на en, если что-то пошло не так
  const safeLocale = locales.includes(locale) ? locale : 'en';
  console.log('locale msg', safeLocale);
  return {
    locale: safeLocale,
    messages: require(`../locales/${safeLocale}.json`),
  };
}
