import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ingredientsApi } from '@/lib/api';

export function useIngredients() {
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/ingredient/categories'],
    queryFn: () => ingredientsApi.getByCategoryAll(),
  });

  const toggleIngredient = useCallback((ingredientId: number) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientId)
        ? prev.filter((id) => id !== ingredientId)
        : [...prev, ingredientId]
    );
  }, []);

  const removeIngredient = useCallback((ingredientId: number) => {
    setSelectedIngredients((prev) => prev.filter((id) => id !== ingredientId));
  }, []);

  const clearIngredients = useCallback(() => {
    setSelectedIngredients([]);
  }, []);

  const { data: allIngredients = [] } = useQuery({
    queryKey: ['/api/ingredients'],
    queryFn: () => ingredientsApi.getIngredients(),
  });

  const getIngredientName = useCallback(
    (id: number) => {
      const ingredient = allIngredients.find((ing) => ing.id === id);
      return ingredient?.name || `Ingredient ${id}`;
    },
    [allIngredients]
  );

  return {
    categories,
    categoriesLoading,
    selectedIngredients,
    toggleIngredient,
    removeIngredient,
    clearIngredients,
    getIngredientName,
  };
}

export function useIngredientsSearch(query: string) {
  return useQuery({
    queryKey: ['/api/ingredients', { search: query }],
    queryFn: () => ingredientsApi.getIngredients(undefined, query),
    enabled: query.length > 0,
  });
}

export function useCategoryIngredients(categoryId: number) {
  return useQuery({
    queryKey: ['/api/ingredients', { categoryId }],
    queryFn: () => ingredientsApi.getIngredients(categoryId),
  });
}
