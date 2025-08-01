'use client';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect, useState } from 'react';
import { RecipeCard } from '@/components/recipe-card';
import type { Recipe } from '@/lib/api';
import { baseUrl } from '@/lib/api';
import { useTranslations } from 'next-intl';
export default function CookClientPart() {
  const t = useTranslations('cook');
  const { token, hydrated } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !token) return;
    setLoading(true);
    setError(null);
    fetch(`${baseUrl}user/cooked-recipes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(t('error'));
        return res.json();
      })
      .then((data) => setRecipes(data.recipes || data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, hydrated]);

  if (!hydrated) return <div className="text-center py-12">{t('loading')}</div>;
  if (!token)
    return (
      <div className="text-center py-12 text-gray-500">
        {t('loginToSeeCookings')}
      </div>
    );
  if (loading) return <div className="text-center py-12">{t('loading')}</div>;
  if (error)
    return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!recipes || recipes.length === 0)
    return (
      <div className="text-center py-12 text-gray-500">{t('noCookings')}</div>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mb-8">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
