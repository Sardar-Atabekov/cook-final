import { getTranslations } from 'next-intl/server';
import CookClientPart from './CookClientPart';

export const revalidate = 86400; // 1 день

export default async function CookServerPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cook' });
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      </div>
      <CookClientPart />
    </div>
  );
}
