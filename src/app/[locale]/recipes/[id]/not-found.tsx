import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function NotFound() {
  const locale = useLocale();
  const t = useTranslations('recipe');
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">{t('notFound')}</h1>
      <p className="text-gray-600 mb-8">{t('notFoundDescription')}</p>
      <Link href={`/${locale}/recipes`}>
        <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          {t('backToRecipes')}
        </span>
      </Link>
    </div>
  );
}
