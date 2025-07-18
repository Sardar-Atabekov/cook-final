import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { RecipeCard } from '@/components/recipe-card';
import type { Recipe } from '@/lib/api';

export const revalidate = 86400; // 1 день

function getTokenFromCookie() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('auth-store')?.value;
  if (!authCookie) return null;
  try {
    const parsed = JSON.parse(authCookie);
    return parsed.state?.token || null;
  } catch {
    return authCookie;
  }
}

async function fetchCookedRecipes(token: string | null) {
  if (!token) return null;
  const res = await fetch('http://localhost:5005/api/user/cooked-recipes', {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error('Ошибка загрузки приготовленных рецептов');
  const data = await res.json();
  return data.recipes || data;
}

export default async function CookServerPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'cook' });
  const token = getTokenFromCookie();
  let cookedRecipes: Recipe[] | null = null;
  let error: string | null = null;

  if (token) {
    try {
      cookedRecipes = await fetchCookedRecipes(token);
    } catch (e: any) {
      error = e?.message || 'Ошибка';
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      </div>
      {!token ? (
        <div className="text-center py-12 text-gray-500">
          {t('loginToSeeCookings')}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : !cookedRecipes || cookedRecipes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('noCookings')}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {cookedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
