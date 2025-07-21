'use client';
import { useTranslations } from 'next-intl';
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations('recipe');
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        {t('errorLoading')}
      </h1>
      <p className="text-gray-600 mb-4">
        {error.message || t('errorLoadingDescription')}
      </p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => reset()}
      >
        {t('tryAgain')}
      </button>
    </div>
  );
}
