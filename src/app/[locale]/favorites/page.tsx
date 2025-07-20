'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RecipeCard } from '@/components/recipe-card';
import { userRecipesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Recipe } from '@/lib/api';

export default function FavoritesPage() {
  const { token } = useAuthStore();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[] | null>(null);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const t = useTranslations('favorites');

  // Получаем сохранённые рецепты с сервера
  useEffect(() => {
    if (!token) return;
    setSavedError(null);
    userRecipesApi
      .getSavedRecipes(token)
      .then((data) => setSavedRecipes(data.recipes || data))
      .catch((e) => setSavedError(e?.message || 'Ошибка'));
  }, [token]);

  // Функция для удаления рецепта из избранного
  const handleUnsave = async (recipeId: string) => {
    if (!token) return;
    setSavingIds((ids) => [...ids, recipeId]);
    try {
      await userRecipesApi.unsaveRecipe(token, recipeId);
      setSavedRecipes((prev) =>
        prev ? prev.filter((r) => r.id !== recipeId) : prev
      );
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== recipeId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      </div>
      {savedError ? (
        <div className="text-center py-12 text-red-600">{savedError}</div>
      ) : !token ? (
        <div className="text-center py-12">{t('loginToSeeSaved')}</div>
      ) : !savedRecipes || savedRecipes.length === 0 ? (
        <div className="text-center py-12">{t('noSavedRecipes')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {savedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSaved={true}
              onSave={() => handleUnsave(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
