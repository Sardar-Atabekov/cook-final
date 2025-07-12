import { useTranslations } from 'next-intl';
import { getDefaultLocale } from '@/lib/locale-utils';

export default function NotFound() {
  const t = useTranslations('NotFound');
  const defaultLocale = getDefaultLocale();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h2>
          <p className="text-gray-600">{t('description')}</p>
        </div>

        <div className="space-y-3">
          <a
            href={`/${defaultLocale}`}
            className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            {t('home')}
          </a>
        </div>
      </div>
    </div>
  );
}
