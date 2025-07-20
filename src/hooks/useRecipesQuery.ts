import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/lib/api';

export function useRecipesQuery(
  params: {
    ingredientIds?: number[];
    lang: string;
    limit: number;
    mealType?: string;
    country?: string;
    dietTags?: string;
    page?: number;
  },
  initialData?: any
) {
  return useQuery({
    queryKey: [
      'recipes',
      params.ingredientIds || [],
      params.lang,
      params.limit,
      params.mealType,
      params.country,
      params.dietTags,
      params.page,
    ],
    queryFn: () =>
      recipeApi.getRecipes(
        params.ingredientIds || [],
        {
          offset: ((params.page || 1) - 1) * params.limit,
          limit: params.limit,
          mealType: params.mealType || 'all',
          country: params.country || 'all',
          dietTags: params.dietTags || 'all',
        },
        params.lang
      ),
    enabled: !!params.lang && !!params.limit,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}
