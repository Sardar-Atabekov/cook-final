'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeFilters, type FilterState } from '@/components/recipe-filters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { recipeApi } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIngredientStore } from '@/stores/useIngredientStore';

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = useLocale();
  const { selectedIngredients } = useIngredientStore();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    mealType: 'all',
    country: 'all',
    dietTags: [],
  });
  const t = useTranslations('recipes');

  // Get ingredients from URL params or store
  const urlIngredients = searchParams.get('ingredients')?.split(',') || [];
  const searchIngredients: string[] =
    urlIngredients.length > 0
      ? urlIngredients
      : selectedIngredients.map((ingredient: any) =>
          typeof ingredient === 'string'
            ? ingredient
            : (ingredient.id ?? ingredient.name)
        );

  const { data, isLoading, error } = useQuery({
    queryKey: ['recipes', searchIngredients, filters, page],
    queryFn: () =>
      recipeApi.getRecipes(
        searchIngredients,
        {
          ...filters,
          page,
        },
        locale // Pass the locale as the third argument
      ),
    enabled: searchIngredients.length > 0,
  });

  useEffect(() => {
    setPage(1); // Reset page when filters change
  }, [filters]);

  if (searchIngredients.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('noIngredients')}
          </h1>
          <p className="text-gray-600 mb-8">{t('noIngredientsDescription')}</p>
          <Button onClick={() => window.history.back()}>{t('goBack')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">
          {t('foundWith', { ingredients: searchIngredients.join(', ') })}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <RecipeFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{t('error')}</p>
          <Button onClick={() => window.location.reload()}>
            {t('tryAgain')}
          </Button>
        </div>
      ) : data?.recipes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('noRecipesFound')}
          </h2>
          <p className="text-gray-600 mb-4">{t('noRecipesDescription')}</p>
          <Button
            onClick={() =>
              setFilters({ mealType: 'all', country: 'all', dietTags: [] })
            }
          >
            {t('clearFilters')}
          </Button>
        </div>
      ) : (
        <>
          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data?.recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                userIngredients={searchIngredients}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('previous')}
              </Button>

              <span className="text-sm text-gray-600">
                {t('page', { current: page, total: data.totalPages })}
              </span>

              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === data.totalPages}
              >
                {t('next')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
