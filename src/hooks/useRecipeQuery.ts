import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/lib/api';

export function useRecipeQuery(
  id: string,
  ingredientIds: number[],
  initialData?: any
) {
  return useQuery({
    queryKey: ['recipe', id, ingredientIds],
    queryFn: async () => {
      if (!id) throw new Error('Recipe ID is required');
      return await recipeApi.getRecipe(id, ingredientIds);
    },
    enabled: !!id,
    initialData: initialData && initialData.id === id ? initialData : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if ((error as any)?.status === 404) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Don't keep previous data when recipe ID changes
    keepPreviousData: false,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });
}
