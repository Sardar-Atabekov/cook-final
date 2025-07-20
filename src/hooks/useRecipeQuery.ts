import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/lib/api';

export function useRecipeQuery(
  id: string,
  ingredientIds: number[],
  initialData?: any
) {
  return useQuery({
    queryKey: ['recipe', id, ingredientIds],
    queryFn: () => recipeApi.getRecipe(id, ingredientIds),
    enabled: !!id,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}
