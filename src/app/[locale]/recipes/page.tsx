'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeFilters, type FilterState } from '@/components/recipe-filters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { recipeApi } from '@/lib/api';
import { userRecipesApi } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIngredientStore } from '@/stores/useIngredientStore';
import type { Recipe } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';

export const config = {
  revalidate: 3600, // 1 час
};

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = useLocale();
  const { selectedIngredients } = useIngredientStore();
  const { token } = useAuthStore();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    mealType: 'all',
    country: 'all',
    dietTags: 'all', // dietTags — строка, а не массив
  });
  const [showSaved, setShowSaved] = useState(false); // true — показываем только сохранённые
  const [savedRecipes, setSavedRecipes] = useState<Recipe[] | null>(null);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<string[]>([]); // id рецептов, которые сейчас сохраняются/удаляются
  const t = useTranslations('recipes');

  // Get ingredients from URL params or store
  const urlIngredients = searchParams.get('ingredients')?.split(',') || [];
  const searchIngredients: string[] =
    urlIngredients.length > 0
      ? urlIngredients
      : selectedIngredients.map((ingredient: any) =>
          typeof ingredient === 'string'
            ? ingredient
            : (ingredient.id ?? ingredient.name)
        );

  const pageSize = 12; // Количество рецептов на странице
  const offset = (page - 1) * pageSize;

  const { data, isLoading, error } = useQuery({
    queryKey: ['recipes', searchIngredients, filters, page],
    queryFn: () =>
      recipeApi.getRecipes(
        searchIngredients.map((ingredient) => parseInt(ingredient)),
        {
          ...filters,
          offset,
          limit: pageSize,
        },
        locale // Передаём локаль
      ),
    enabled: searchIngredients.length > 0,
  });

  // Получаем сохранённые рецепты с сервера
  useEffect(() => {
    if (!showSaved || !token) return;
    setSavedLoading(true);
    setSavedError(null);
    userRecipesApi
      .getSavedRecipes(token)
      .then((data) => setSavedRecipes(data.recipes || data))
      .catch((e) => setSavedError(e?.message || 'Ошибка'))
      .finally(() => setSavedLoading(false));
  }, [showSaved, token]);

  useEffect(() => {
    setPage(1); // Reset page when filters change
  }, [filters]);

  if (searchIngredients.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('noIngredients')}
          </h1>
          <p className="text-gray-600 mb-8">{t('noIngredientsDescription')}</p>
          <Button onClick={() => window.history.back()}>{t('goBack')}</Button>
        </div>
      </div>
    );
  }

  // Функции для сохранения/удаления рецепта
  const handleSave = async (recipeId: string) => {
    if (!token) return;
    setSavingIds((ids) => [...ids, recipeId]);
    try {
      await userRecipesApi.saveRecipe(token, recipeId);
      // Обновляем сохранённые рецепты
      setSavedRecipes((prev) =>
        prev
          ? [...prev, data.recipes.find((r: Recipe) => r.id === recipeId)!]
          : prev
      );
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== recipeId));
    }
  };
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
      {/* Переключатель между всеми и сохранёнными */}
      <div className="flex gap-4 mb-8">
        <Button
          variant={!showSaved ? 'default' : 'outline'}
          onClick={() => setShowSaved(false)}
        >
          {t('allRecipes')}
        </Button>
        <Button
          variant={showSaved ? 'default' : 'outline'}
          onClick={() => setShowSaved(true)}
        >
          {t('savedRecipes')}
        </Button>
      </div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">
          {t('foundWith', { ingredients: searchIngredients.join(', ') })}
        </p>
      </div>

      {/* Filters */}
      {!showSaved && (
        <div className="mb-8">
          <RecipeFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Список рецептов */}
      {showSaved ? (
        savedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : savedError ? (
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
        )
      ) : (
        <>
          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data?.recipes.map((recipe: Recipe) => {
              const isSaved = !!(
                savedRecipes && savedRecipes.find((r) => r.id === recipe.id)
              );
              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={isSaved}
                  onSave={() =>
                    isSaved ? handleUnsave(recipe.id) : handleSave(recipe.id)
                  }
                />
              );
            })}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('previous')}
              </Button>

              <span className="text-sm text-gray-600">
                {t('page', { current: page, total: data.totalPages })}
              </span>

              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === data.totalPages}
              >
                {t('next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
