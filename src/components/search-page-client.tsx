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
import type { Recipe } from '@/lib/api';
import { Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { userRecipesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';

interface SearchPageClientProps {
  locale: string;
  initialSearchQuery: string;
  initialIngredientIds: number[];
  initialMealType: string;
  initialCountry: string;
  initialDietTags: string;
  initialPage: number;
  initialRecipes: Recipe[];
  initialTotal: number;
  initialTags?: any[];
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
  initialTags = [],
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('search');
  const { toast } = useToast();
  const { addMultipleToPantry } = usePantry();
  const { toggleSaveRecipeServer, isRecipeSavedServer } = useSavedRecipes();
  const { selectedIngredients } = useIngredientStore();

  // Состояние поиска
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filters, setFilters] = useState<FilterState>({
    mealType: initialMealType || 'all',
    country: initialCountry || 'all',
    dietTags: initialDietTags || 'all',
  });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [savedRecipeIds, setSavedRecipeIds] = useState<number[]>([]);

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
        if (params.dietTags && params.dietTags !== 'all') {
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

  // Синхронизация page с URL
  useEffect(() => {
    updateURL({ page: 1 }); // Always set page to 1 for initial load
  }, [updateURL]);

  // При смене страницы скроллим вверх, кроме случая 'Показать еще'
  const [wasPageIncrementedByLoadMore, setWasPageIncrementedByLoadMore] =
    useState(false);
  // useEffect(() => {
  //   if (!wasPageIncrementedByLoadMore) {
  //     window.scrollTo({ top: 0, behavior: 'smooth' });
  //   }
  //   setWasPageIncrementedByLoadMore(false);
  // }, [page]); // Scroll only when page changes

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
        dietTags: newFilters.dietTags,
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

  // Получение рецептов с учетом page
  const selectedIngredientIDs = selectedIngredients.map((i) => i.id);

  const {
    recipes,
    total,
    isLoading,
    hasMore,
    currentCount: _currentCount,
    error,
  } = useRecipes({
    ingredientIds: searchQuery.trim() ? [] : selectedIngredientIDs,
    searchText: searchQuery,
    lang: locale,
    limit: 20,
    mealType: filters.mealType,
    country: filters.country,
    dietTags: filters.dietTags,
    page: page, // Always fetch from page 1
  });

  // --- Накопление рецептов для пагинации ---
  const [accumulatedRecipes, setAccumulatedRecipes] =
    useState<Recipe[]>(initialRecipes);

  // Сброс page при изменении фильтров, поиска, ингредиентов
  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    filters.mealType,
    filters.country,
    filters.dietTags,
    selectedIngredients,
  ]);

  // Сброс accumulatedRecipes при page === 1
  useEffect(() => {
    if (page === 1) {
      if (initialRecipes.length > 0) {
        setAccumulatedRecipes(
          initialRecipes as unknown as import('@/lib/api').Recipe[]
        );
      } else {
        setAccumulatedRecipes(
          recipes as unknown as import('@/lib/api').Recipe[]
        );
      }
    } else if (!isLoading && recipes.length > 0) {
      setAccumulatedRecipes((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newRecipes = (
          recipes as unknown as import('@/lib/api').Recipe[]
        ).filter((r) => !existingIds.has(r.id));
        return [...prev, ...newRecipes];
      });
    }
    // eslint-disable-next-line
  }, [page, initialRecipes, recipes, isLoading]);

  // accumulatedRecipes всегда содержит все загруженные рецепты (без дублирования)

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

  // Загрузка сохранённых рецептов в фоне
  useEffect(() => {
    let ignore = false;
    async function fetchSaved() {
      try {
        const token = useAuthStore.getState().token;
        if (!token) {
          setSavedRecipeIds([]);
          return;
        }
        const data = await userRecipesApi.getSavedRecipes(token);
        const ids = (data.recipes || data).map((r: any) =>
          typeof r.id === 'string' ? parseInt(r.id, 10) : r.id
        );
        if (!ignore) setSavedRecipeIds(ids);
      } catch {
        console.error('Error fetching saved recipes');
      }
    }
    fetchSaved();
    return () => {
      ignore = true;
    };
  }, []); // Можно добавить зависимости, если нужно обновлять при смене пользователя/языка

  // Обработчики рецептов
  const handleSaveRecipe = async (recipe: Recipe) => {
    const id = Number(recipe.id);
    const isSaved = savedRecipeIds.includes(id);
    // Оптимистично обновляем локальный список
    setSavedRecipeIds((prev) => {
      if (isSaved) {
        return prev.filter((rid) => rid !== id);
      } else {
        return [...prev, id];
      }
    });
    toast({
      title: isSaved ? t('recipeRemoved') : t('recipeSaved'),
      description: isSaved
        ? t('recipeRemovedDesc', { title: recipe.title })
        : t('recipeSavedDesc', { title: recipe.title }),
    });
    await toggleSaveRecipeServer(recipe.id);
    // Фоново обновляем с сервера (на случай ошибок)
    try {
      const token = useAuthStore.getState().token;
      if (token) {
        const data = await userRecipesApi.getSavedRecipes(token);
        const ids = (data.recipes || data).map((r: any) => Number(r.id));
        setSavedRecipeIds(ids);
      }
    } catch {
      console.error('Error fetching saved recipes');
    }
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

  // --- Используем accumulatedRecipes для отображения и currentCount ---
  const displayRecipes = accumulatedRecipes;
  let displayTotal = 0;
  if (typeof total === 'string') {
    displayTotal = parseInt(total, 10) || accumulatedRecipes.length;
  } else if (typeof total === 'number') {
    displayTotal = total;
  } else {
    displayTotal = accumulatedRecipes.length;
  }
  const currentCount = accumulatedRecipes.length;

  // Показываем скелетон при загрузке и отсутствии данных
  const isInitialLoading = isLoading && displayRecipes.length === 0;

  // Показываем скелетон при изменении параметров поиска
  const shouldShowSkeleton =
    isInitialLoading || (isLoading && !hasUsedInitialData);

  // Улучшенные скелетоны
  const skeletonCount = 20;

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
          initialTags={initialTags}
          locale={locale}
        />
      </div>

      {/* Состояния загрузки / отсутствие данных / список рецептов */}
      {error ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {typeof error === 'object' &&
            error &&
            'code' in error &&
            (error as any).code === 'ERR_NETWORK'
              ? t('serverUnavailable')
              : t('errorTitle')}
          </h3>
          <p className="text-gray-600">
            {typeof error === 'object' &&
            error &&
            'code' in error &&
            (error as any).code === 'ERR_NETWORK'
              ? t('serverUnavailableDesc')
              : error.message || t('errorDesc')}
          </p>
        </div>
      ) : shouldShowSkeleton ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
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
        <div className="text-center py-16 flex flex-col items-center justify-center">
          <SearchIcon className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('noRecipesFound')}
          </h3>
          <p className="text-gray-600 mb-2">
            {searchQuery
              ? t('noRecipesFoundSearch')
              : t('noRecipesFoundIngredients')}
          </p>
          <p className="text-gray-500 text-sm">{t('noRecipesFoundHint')}</p>
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
                isSaved={savedRecipeIds.includes(Number(recipe.id))}
              />
            ))}
          </div>

          {/* Кнопка "Показать еще" */}
          {hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={() => setPage((p) => p + 1)}
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

          {/*
          // Пагинация (оставлено в комментарии)
          {displayTotal > 20 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('previous')}
              </Button>
              <span className="text-sm text-gray-600">
                {t('page', { current: page, total: Math.ceil(displayTotal / 20) })}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(displayTotal / 20) || isLoading}
              >
                {t('next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
          */}
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
          isSaved={savedRecipeIds.includes(Number(selectedRecipe.id))}
        />
      )}
    </div>
  );
}
