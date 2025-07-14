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
  country?: string;
  dietTags?: string;
}

export function useRecipes({
  ingredientIds,
  searchText,
  lang,
  limit,
  mealType = 'all',
  country = 'all',
  dietTags = 'all',
}: UseRecipesParams) {
  const [page, setPage] = useState(1);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  const prevParamsRef = useRef<string>('');

  const paramsKey = JSON.stringify({
    ingredientIds,
    searchText,
    lang,
    limit,
    mealType,
    country,
    dietTags,
  });

  // если параметры поменялись — сбрасываем страницу и рецепты
  useEffect(() => {
    if (prevParamsRef.current !== paramsKey) {
      prevParamsRef.current = paramsKey;
      setPage(1);
      setAllRecipes([]);
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
        country,
        dietTags,
        page,
      },
    ],
    queryFn: () => {
      const offset = (page - 1) * limit;
      const filters = {
        offset,
        limit,
        mealType: mealType === 'all' ? '' : mealType || '',
        country: country === 'all' ? '' : country || '',
        dietTags: dietTags === 'all' ? '' : dietTags || '',
        search: searchText.trim() || undefined,
      };
      const ingredients = searchText.trim() ? [] : ingredientIds;
      return recipeApi.getRecipes(ingredients, filters, lang);
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
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
      setAllRecipes(data.recipes ?? []);
    } else {
      const newRecipes = (data.recipes ?? []).filter(
        (r) => !allRecipes.some((pr) => pr.id === r.id)
      );
      setAllRecipes((prev) => [...prev, ...newRecipes]);
    }
  }, [data, page]);

  const loadMore = () => {
    if ((page - 1) * limit + (data?.recipes.length || 0) < (data?.total || 0)) {
      setPage((prev) => prev + 1);
    }
  };

  return {
    recipes: allRecipes,
    total: data?.total || 0,
    isLoading: isLoading || isFetching,
    loadMore,
    hasMore:
      (page - 1) * limit + (data?.recipes?.length || 0) <
      (data?.total || Infinity),
    currentCount: allRecipes.length,
    error,
  };
}
