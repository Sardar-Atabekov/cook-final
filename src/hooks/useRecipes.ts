import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recipeApi, type Recipe } from '@/lib/api';

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

      // Проверяем, изменились ли только фильтры (не страница)
      const isOnlyPageChange =
        prevParams.page !== currentParams.page &&
        prevParams.mealType === currentParams.mealType &&
        prevParams.kitchens === currentParams.kitchens &&
        prevParams.dietTags === currentParams.dietTags &&
        prevParams.sorting === currentParams.sorting &&
        prevParams.byTime === currentParams.byTime &&
        prevParams.searchText === currentParams.searchText &&
        JSON.stringify(prevParams.ingredientIds) ===
          JSON.stringify(currentParams.ingredientIds);

      // Если изменились фильтры (не только страница), то сбрасываем рецепты
      if (!isOnlyPageChange) {
        setAllRecipes([]);
      }

      prevParamsRef.current = paramsKey;
    }
  }, [paramsKey]);

  const { data, isLoading, error, isFetching } = useQuery<{
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
    queryFn: async () => {
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

      // Специальное логирование для английского языка
      if (lang === 'en') {
        console.log('🇬🇧 English useRecipes hook:', {
          ingredientIds,
          searchText,
          lang,
          filters,
          page,
          offset,
        });
      }

      return recipeApi.getRecipes(ingredientIds, filters, lang);
    },
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
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

    console.log('🔄 useRecipes useEffect:', {
      page,
      dataRecipesLength: data.recipes?.length || 0,
      currentAllRecipesLength: allRecipes.length,
      total: data.total,
    });

    if (page === 1) {
      // Для первой страницы заменяем все рецепты
      console.log('📄 Page 1: Replacing all recipes');
      setAllRecipes(data.recipes ?? []);
    } else {
      // Для последующих страниц добавляем новые рецепты
      console.log('📄 Page > 1: Adding new recipes');
      setAllRecipes((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newRecipes = (data.recipes ?? []).filter(
          (r) => !existingIds.has(r.id)
        );

        console.log('➕ Adding recipes:', {
          existingCount: prev.length,
          newRecipesCount: newRecipes.length,
          totalAfter: prev.length + newRecipes.length,
        });

        return [...prev, ...newRecipes];
      });
    }
  }, [data, page]);

  // Вычисляем hasMore на основе текущего количества рецептов и общего количества
  // Если данных еще нет, но мы на странице > 1, то предполагаем что есть еще данные
  const hasMore = data?.total
    ? allRecipes.length < data.total
    : page > 1 || allRecipes.length > 0;

  console.log('📊 useRecipes return:', {
    allRecipesLength: allRecipes.length,
    total: data?.total || 0,
    hasMore,
    page,
    limit,
  });

  return {
    recipes: allRecipes,
    total: data?.total || 0,
    isLoading: isLoading || isFetching,
    hasMore,
    currentCount: allRecipes.length,
    error,
    isFetching,
  };
}
