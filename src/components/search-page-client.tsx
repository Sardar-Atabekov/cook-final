'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SearchBar } from './search-bar';
import { RecipeFilters, type FilterState } from './recipe-filters';
import { SearchRecipeCard } from './search-recipe-card';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { useRecipes } from '@/hooks/useRecipes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePantry } from '@/hooks/usePantry';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { RecipeDetail } from './recipe-detail';
import type { Recipe } from '@/types/recipe';

interface SearchPageClientProps {
  locale: string;
  initialSearchQuery: string;
  initialIngredientIds: number[];
  initialMealType: string;
  initialCountry: string;
  initialDietTags: string[];
  initialPage: number;
  initialRecipes: Recipe[];
  initialTotal: number;
}

export function SearchPageClient({
  locale,
  initialSearchQuery,
  initialIngredientIds,
  initialMealType,
  initialCountry,
  initialDietTags,
  initialPage,
  initialRecipes,
  initialTotal,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('search');
  const { toast } = useToast();
  const { addMultipleToPantry } = usePantry();
  const { toggleSaveRecipe, isRecipeSaved } = useSavedRecipes();
  const { selectedIngredients } = useIngredientStore();

  // Состояние поиска
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filters, setFilters] = useState<FilterState>({
    mealType: initialMealType || 'all',
    country: initialCountry || 'all',
    dietTags: initialDietTags,
  });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Синхронизация с URL
  const updateURL = useCallback(
    (params: {
      q?: string;
      ingredients?: string;
      mealType?: string;
      country?: string;
      dietTags?: string;
      page?: number;
    }) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      if (params.q !== undefined) {
        if (params.q) {
          newSearchParams.set('q', params.q);
        } else {
          newSearchParams.delete('q');
        }
      }

      if (params.ingredients !== undefined) {
        if (params.ingredients) {
          newSearchParams.set('ingredients', params.ingredients);
        } else {
          newSearchParams.delete('ingredients');
        }
      }

      if (params.mealType !== undefined) {
        if (params.mealType && params.mealType !== 'all') {
          newSearchParams.set('mealType', params.mealType);
        } else {
          newSearchParams.delete('mealType');
        }
      }

      if (params.country !== undefined) {
        if (params.country && params.country !== 'all') {
          newSearchParams.set('country', params.country);
        } else {
          newSearchParams.delete('country');
        }
      }

      if (params.dietTags !== undefined) {
        if (
          params.dietTags &&
          Array.isArray(params.dietTags) &&
          params.dietTags.length > 0
        ) {
          newSearchParams.set('dietTags', params.dietTags.join(','));
        } else if (
          params.dietTags &&
          typeof params.dietTags === 'string' &&
          params.dietTags.length > 0
        ) {
          newSearchParams.set('dietTags', params.dietTags);
        } else {
          newSearchParams.delete('dietTags');
        }
      }

      if (params.page !== undefined) {
        if (params.page > 1) {
          newSearchParams.set('page', params.page.toString());
        } else {
          newSearchParams.delete('page');
        }
      }

      const newURL = `${window.location.pathname}?${newSearchParams.toString()}`;
      router.replace(newURL, { scroll: false });
    },
    [router, searchParams]
  );

  // Обработчики изменений
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      updateURL({ q: query, page: 1 });
    },
    [updateURL]
  );

  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      updateURL({
        mealType: newFilters.mealType,
        country: newFilters.country,
        dietTags: newFilters.dietTags.join(','),
        page: 1,
      });
    },
    [updateURL]
  );

  // Синхронизация выбранных ингредиентов с URL
  useEffect(() => {
    if (initialIngredientIds.length > 0) {
      // Здесь нужно загрузить информацию об ингредиентах по ID
      // и установить их в store
      // Это упрощенная версия - в реальности нужно загрузить данные
      const ingredientIdsString = initialIngredientIds.join(',');
      updateURL({ ingredients: ingredientIdsString });
    }
  }, [initialIngredientIds, updateURL]);

  // Получение рецептов
  const selectedIngredientIDs = selectedIngredients.map((i) => i.id);

  const { recipes, total, isLoading, loadMore, hasMore, currentCount, error } =
    useRecipes({
      ingredientIds: searchQuery.trim() ? [] : selectedIngredientIDs,
      searchText: searchQuery,
      lang: locale,
      limit: 20,
      mealType: filters.mealType,
      country: filters.country,
      dietTags: filters.dietTags,
    });

  // Используем начальные данные только для первой загрузки
  const [hasUsedInitialData, setHasUsedInitialData] = useState(false);

  useEffect(() => {
    if (initialRecipes.length > 0 && !hasUsedInitialData) {
      setHasUsedInitialData(true);
    }
  }, [initialRecipes.length, hasUsedInitialData]);

  // Сбрасываем флаг при изменении параметров поиска
  useEffect(() => {
    setHasUsedInitialData(false);
  }, [
    searchQuery,
    selectedIngredientIDs,
    filters.mealType,
    filters.country,
    filters.dietTags,
  ]);

  const displayRecipes =
    hasUsedInitialData && initialRecipes.length > 0 && !isLoading
      ? initialRecipes
      : recipes;
  const displayTotal =
    hasUsedInitialData && initialTotal > 0 && !isLoading ? initialTotal : total;

  // Показываем скелетон при загрузке и отсутствии данных
  const isInitialLoading = isLoading && displayRecipes.length === 0;

  // Показываем скелетон при изменении параметров поиска
  const shouldShowSkeleton =
    isInitialLoading || (isLoading && !hasUsedInitialData);

  // Обработчики рецептов
  const handleSaveRecipe = (recipe: Recipe) => {
    toggleSaveRecipe(recipe.id, recipe.title);
    toast({
      title: isRecipeSaved(recipe.id) ? t('recipeRemoved') : t('recipeSaved'),
      description: isRecipeSaved(recipe.id)
        ? t('recipeRemovedDesc', { title: recipe.title })
        : t('recipeSavedDesc', { title: recipe.title }),
    });
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailOpen(true);
  };

  const handleCookDish = (recipe: Recipe) => {
    const recipeIngredients =
      recipe.recipeIngredients?.map((ri: any) => ({
        id: ri.ingredientId,
        name: ri.ingredient?.name || `Ингредиент ${ri.ingredientId}`,
      })) || [];

    addMultipleToPantry(recipeIngredients, recipe.title);

    toast({
      title: t('cookingTitle'),
      description: t('cookingDesc', { title: recipe.title }),
    });
  };

  return (
    <div className="flex-1">
      {/* Заголовок и поиск */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery
              ? t('searchResultsTitle', { query: searchQuery })
              : selectedIngredients.length === 0
                ? t('allRecipesTitle')
                : t('personalizedRecipesTitle')}
          </h1>
          <p className="text-gray-600">
            {searchQuery
              ? t('searchResultsCount', { count: displayTotal })
              : selectedIngredients.length === 0
                ? t('allRecipesCount', {
                    current: currentCount,
                    total: displayTotal,
                  })
                : t('personalizedRecipesCount', {
                    current: currentCount,
                    total: displayTotal,
                  })}
          </p>
        </div>

        <div className="lg:w-96">
          <SearchBar
            placeholder={t('searchPlaceholder')}
            onSearch={handleSearchChange}
            initialValue={searchQuery}
            className="w-full"
          />
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <RecipeFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Состояния загрузки / отсутствие данных / список рецептов */}
      {error && (error as any)?.code === 'ERR_NETWORK' ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('serverUnavailable')}
          </h3>
          <p className="text-gray-600">{t('serverUnavailableDesc')}</p>
        </div>
      ) : shouldShowSkeleton ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {Array.from({ length: 20 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-52 w-full rounded-lg bg-gray-300 animate-pulse" />
              <Skeleton className="h-5 w-3/4 bg-gray-300 animate-pulse" />
              <Skeleton className="h-5 w-1/2 bg-gray-300 animate-pulse" />
              <Skeleton className="h-4 w-full bg-gray-300 animate-pulse" />
              <Skeleton className="h-4 w-2/3 bg-gray-300 animate-pulse" />
            </div>
          ))}
        </div>
      ) : !isLoading && displayTotal === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('noRecipesFound')}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? t('noRecipesFoundSearch')
              : t('noRecipesFoundIngredients')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {displayRecipes.map((recipe) => (
              <SearchRecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe)}
                onSave={() => handleSaveRecipe(recipe)}
                isSaved={isRecipeSaved(recipe.id)}
              />
            ))}
          </div>

          {/* Кнопка "Показать больше" */}
          {!searchQuery && hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {t('loadMore')}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                {t('showingCount', {
                  current: currentCount,
                  total: displayTotal,
                })}
              </p>
            </div>
          )}
        </>
      )}

      {/* Модальное окно с деталями рецепта */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onSave={() => handleSaveRecipe(selectedRecipe)}
          onCookDish={() => handleCookDish(selectedRecipe)}
          isSaved={isRecipeSaved(selectedRecipe.id)}
        />
      )}
    </div>
  );
}
