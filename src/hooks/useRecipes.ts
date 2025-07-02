import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useRecipes(ingredientIds: number[]) {
  const [offset, setOffset] = useState(0);
  const limit = 8;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/recipes', { ingredients: ingredientIds, limit, offset }],
    queryFn: () => api.getRecipes(ingredientIds, limit, offset),
  });

  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const reset = () => {
    setOffset(0);
  };

  return {
    recipes: data?.recipes || [],
    total: data?.total || 0,
    isLoading,
    error,
    loadMore,
    reset,
    hasMore: (data?.recipes.length || 0) + offset < (data?.total || 0),
    currentCount: (data?.recipes.length || 0) + offset,
  };
}

export function useRecipeSearch(query: string) {
  return useQuery({
    queryKey: ['/api/recipes', { search: query }],
    queryFn: () => api.searchRecipes(query),
    enabled: query.length > 0,
  });
}
