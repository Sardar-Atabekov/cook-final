import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/lib/api';
import type { Recipe } from '@/types/recipe';

interface UseRecipesParams {
  ingredientIds: number[];
  searchText: string;
  lang: string;
  limit: number;
  mealType?: string;
  kitchens?: string;
  dietTags?: string;
  sorting?: string;
  byTime?: string;
  page?: number;
}

export function useRecipes({
  ingredientIds,
  searchText,
  lang,
  limit,
  mealType = 'all',
  kitchens = 'all',
  dietTags = 'all',
  sorting = 'all',
  byTime = 'all',
  page = 1,
}: UseRecipesParams) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  const prevParamsRef = useRef<string>('');

  const paramsKey = JSON.stringify({
    ingredientIds,
    searchText,
    lang,
    limit,
    mealType,
    kitchens,
    dietTags,
    sorting,
    byTime,
    page,
  });

  // если параметры поменялись — сбрасываем рецепты только если это не пагинация
  useEffect(() => {
    if (prevParamsRef.current !== paramsKey) {
      const prevParams = prevParamsRef.current
        ? JSON.parse(prevParamsRef.current)
        : {};
      const currentParams = JSON.parse(paramsKey);

      // Сбрасываем рецепты только если изменились фильтры, а не страница
      const isPageChange =
        prevParams.page !== currentParams.page &&
        prevParams.mealType === currentParams.mealType &&
        prevParams.kitchens === currentParams.kitchens &&
        prevParams.dietTags === currentParams.dietTags &&
        prevParams.sorting === currentParams.sorting &&
        prevParams.byTime === currentParams.byTime &&
        prevParams.searchText === currentParams.searchText &&
        JSON.stringify(prevParams.ingredientIds) ===
          JSON.stringify(currentParams.ingredientIds);

      // Если это не изменение страницы, то сбрасываем рецепты
      if (!isPageChange) {
        console.log('Resetting recipes due to filter change:', {
          prevParams,
          currentParams,
          isPageChange,
        });
        setAllRecipes([]);
      }

      prevParamsRef.current = paramsKey;
    }
  }, [paramsKey]);

  const { data, isLoading, error, isFetching, isPreviousData } = useQuery<{
    recipes: Recipe[];
    total: number;
  }>({
    queryKey: [
      'recipes',
      {
        ingredientIds,
        searchText,
        lang,
        limit,
        mealType,
        kitchens,
        dietTags,
        sorting,
        byTime,
        page,
      },
    ],
    queryFn: () => {
      const offset = (page - 1) * limit;
      const filters = {
        offset,
        limit,
        mealType: mealType === 'all' ? '' : mealType || '',
        kitchens: kitchens === 'all' ? '' : kitchens || '',
        dietTags: dietTags === 'all' ? '' : dietTags || '',
        sorting: sorting === 'all' ? '' : sorting || '',
        byTime: byTime === 'all' ? '' : byTime || '',
        search: searchText.trim() || undefined,
      };
      console.log('useRecipes queryFn params:', {
        ingredientIds,
        filters,
        lang,
        page,
        mealType,
        kitchens,
        dietTags,
        sorting,
        byTime,
      });
      return recipeApi.getRecipes(ingredientIds, filters, lang);
    },
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
    keepPreviousData: ingredientIds.length === 0, // Только если нет ингредиентов
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 дней для рецептов
    retry: (failureCount, error: any) => {
      // Don't retry on connection refused errors
      if (
        error?.code === 'ERR_NETWORK' ||
        error?.message?.includes('ERR_CONNECTION_REFUSED')
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (!data) return;

    if (page === 1) {
      // Для первой страницы заменяем все рецепты
      setAllRecipes(data.recipes ?? []);
    } else {
      // Для последующих страниц добавляем новые рецепты
      setAllRecipes((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newRecipes = (data.recipes ?? []).filter(
          (r) => !existingIds.has(r.id)
        );
        return [...prev, ...newRecipes];
      });
    }
  }, [data, page]);

  // Отладочная информация
  console.log('useRecipes return:', {
    recipes: allRecipes.length,
    total: data?.total || 0,
    dataTotal: data?.total,
    hasData: !!data,
    dataRecipesLength: data?.recipes?.length || 0,
    isLoading,
    isFetching,
    isPreviousData,
  });

  return {
    recipes: allRecipes,
    total: data?.total || 0,
    isLoading: isLoading || isFetching,
    hasMore:
      (page - 1) * limit + (data?.recipes?.length || 0) <
      (data?.total || Infinity),
    currentCount: allRecipes.length,
    error,
    isFetching,
    isPreviousData,
  };
}
