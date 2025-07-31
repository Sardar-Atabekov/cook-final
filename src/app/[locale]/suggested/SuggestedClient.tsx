'use client';

import { useQuery } from '@tanstack/react-query';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Clock, Coffee, Sun, Moon, RefreshCw, AlertCircle } from 'lucide-react';
import { RecipeCard } from '@/components/recipe-card';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Head from 'next/head';
import { recipeApi } from '@/lib/api';
import { SuggestedSection } from '@/components/suggested-section';
import type { RecipeWithIngredients } from '@/types/recipe';
import type { Recipe } from '@/lib/api';

// Constants
const MEAL_TIME_CONFIG = {
  breakfast: {
    startHour: 6,
    endHour: 12,
    icon: Coffee,
    color: 'text-amber-600',
    slug: 'breakfast',
    id: '2',
  },
  lunch: {
    startHour: 12,
    endHour: 16,
    icon: Sun,
    color: 'text-yellow-600',
    slug: 'lunch',
    id: '3',
  },
  dinner: {
    startHour: 16,
    endHour: 24,
    icon: Moon,
    color: 'text-blue-600',
    slug: 'main',
    id: '7',
  },
} as const;

type MealType = keyof typeof MEAL_TIME_CONFIG;

// Optimized toRecipe function with error handling
function toRecipe(recipe: RecipeWithIngredients | null): Recipe | null {
  if (!recipe) return null;

  try {
    return {
      description: recipe.description || '',
      cookTime: (recipe as any).cookTime || 0,
      rating: recipe.rating || 0,
      prepTime: (recipe as any).prepTime || '',
      nutrition: (recipe as any).nutrition || {},
      id: String(recipe.id),
      title: recipe.title || 'Untitled Recipe',
      cookingTime: recipe.cookingTime || 0,
      country: recipe.country || '',
      mealType: (recipe as any).mealType || recipe.type || '',
      dietTags: (recipe as any).dietTags || [],
      ingredients: (recipe.ingredients || []).map(
        (i) => i.ingredient?.name || ''
      ),
      steps: (recipe as any).steps || recipe.instructions || [],
      loading: false,
      servings: (recipe as any).servings || 1,
      difficulty: (recipe as any).difficulty || '',
      imageUrl: recipe.imageUrl || '',
      instructions: recipe.instructions || [],
      sourceUrl: recipe.sourceUrl,
      recipeIngredients: recipe.ingredients || [],
      matchPercentage: recipe.matchPercentage
        ? String(recipe.matchPercentage)
        : undefined,
      missingIngredients: recipe.missingIngredients as any,
    };
  } catch (error) {
    console.error('Error converting recipe:', error);
    return null;
  }
}

// Hook for determining current meal type based on time
function useCurrentMealType(): MealType {
  const [currentMealType, setCurrentMealType] = useState<MealType>(() => {
    // Initialize with correct meal type immediately
    const hour = new Date().getHours();
    for (const [mealType, config] of Object.entries(MEAL_TIME_CONFIG)) {
      if (hour >= config.startHour && hour < config.endHour) {
        return mealType as MealType;
      }
    }
    return 'dinner';
  });

  useEffect(() => {
    const updateMealType = () => {
      const hour = new Date().getHours();

      for (const [mealType, config] of Object.entries(MEAL_TIME_CONFIG)) {
        if (hour >= config.startHour && hour < config.endHour) {
          setCurrentMealType(mealType as MealType);
          return;
        }
      }
      setCurrentMealType('dinner');
    };

    // Update meal type every 30 seconds instead of every minute for better UX
    const interval = setInterval(updateMealType, 30000);
    return () => clearInterval(interval);
  }, []);

  return currentMealType;
}

// Optimized hook for meal type queries with better error handling and caching
function useMealTypeQuery(
  mealTypeId: string | undefined,
  ingredientIds: number[],
  locale: string,
  initialData: RecipeWithIngredients[],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['suggested', ingredientIds, mealTypeId, locale],
    enabled: !!mealTypeId && enabled,
    queryFn: async () => {
      if (!mealTypeId) return [];

      try {
        const filters = {
          offset: 0,
          limit: 20,
          mealType: mealTypeId,
          kitchens: '',
          dietTags: '',
        };

        const result = await recipeApi.getRecipes(
          ingredientIds,
          filters,
          locale
        );
        return result?.recipes || [];
      } catch (error) {
        return initialData || [];
      }
    },
    initialData,
    staleTime: 1000 * 60 * 1000, // 10 minutes
    gcTime: 1500 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      // Retry up to 2 times with exponential backoff
      if (failureCount < 2) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

interface SuggestedClientProps {
  locale: string;
  initialBreakfast: RecipeWithIngredients[];
  initialLunch: RecipeWithIngredients[];
  initialDinner: RecipeWithIngredients[];
  initialRandom: RecipeWithIngredients[];
}

export function SuggestedClient({
  locale,
  initialBreakfast,
  initialLunch,
  initialDinner,
  initialRandom,
}: SuggestedClientProps) {
  const { selectedIngredients } = useIngredientStore();
  const ingredientIds = useMemo(
    () => selectedIngredients.map((i) => i.id),
    [selectedIngredients]
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const t = useTranslations('suggested');
  const currentMealType = useCurrentMealType();
  const [activeTab, setActiveTab] = useState<MealType>(currentMealType);

  // Update active tab when current meal type changes
  useEffect(() => {
    setActiveTab(currentMealType);
  }, [currentMealType]);

  // Get meal type IDs directly from config
  const mealTypeIds = useMemo(
    () => ({
      breakfast: MEAL_TIME_CONFIG.breakfast.id,
      lunch: MEAL_TIME_CONFIG.lunch.id,
      dinner: MEAL_TIME_CONFIG.dinner.id,
    }),
    []
  );

  // Queries for each meal type with lazy loading for non-active tabs
  const breakfastQuery = useMealTypeQuery(
    mealTypeIds.breakfast,
    ingredientIds,
    locale,
    initialBreakfast,
    activeTab === 'breakfast' || ingredientIds.length > 0
  );

  const lunchQuery = useMealTypeQuery(
    mealTypeIds.lunch,
    ingredientIds,
    locale,
    initialLunch,
    activeTab === 'lunch' || ingredientIds.length > 0
  );

  const dinnerQuery = useMealTypeQuery(
    mealTypeIds.dinner,
    ingredientIds,
    locale,
    initialDinner,
    activeTab === 'dinner' || ingredientIds.length > 0
  );

  // Loading and error states
  const isLoading = useMemo(() => {
    switch (activeTab) {
      case 'breakfast':
        return breakfastQuery.isLoading;
      case 'lunch':
        return lunchQuery.isLoading;
      case 'dinner':
        return dinnerQuery.isLoading;
      default:
        return false;
    }
  }, [
    activeTab,
    breakfastQuery.isLoading,
    lunchQuery.isLoading,
    dinnerQuery.isLoading,
  ]);

  const error = useMemo(() => {
    switch (activeTab) {
      case 'breakfast':
        return breakfastQuery.error;
      case 'lunch':
        return lunchQuery.error;
      case 'dinner':
        return dinnerQuery.error;
      default:
        return null;
    }
  }, [activeTab, breakfastQuery.error, lunchQuery.error, dinnerQuery.error]);

  // Optimized refresh function with loading state
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        breakfastQuery.refetch(),
        lunchQuery.refetch(),
        dinnerQuery.refetch(),
      ]);
    } catch (error) {
      console.error('Error refreshing recipes:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [breakfastQuery, lunchQuery, dinnerQuery]);

  // Get current meal configuration
  const currentMealConfig = MEAL_TIME_CONFIG[activeTab];
  const MealIcon = currentMealConfig.icon;

  // Get current recipes based on active tab with error handling
  const currentRecipes = useMemo(() => {
    try {
      switch (activeTab) {
        case 'breakfast':
          return breakfastQuery.data || [];
        case 'lunch':
          return lunchQuery.data || [];
        case 'dinner':
          return dinnerQuery.data || [];
        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting current recipes:', error);
      return [];
    }
  }, [activeTab, breakfastQuery.data, lunchQuery.data, dinnerQuery.data]);

  const handleTabChange = useCallback(
    (type: MealType) => {
      setActiveTab(type);

      // Prefetch data for the selected tab if not already loaded
      switch (type) {
        case 'breakfast':
          if (!breakfastQuery.data?.length) {
            breakfastQuery.refetch();
          }
          break;
        case 'lunch':
          if (!lunchQuery.data?.length) {
            lunchQuery.refetch();
          }
          break;
        case 'dinner':
          if (!dinnerQuery.data?.length) {
            dinnerQuery.refetch();
          }
          break;
      }
    },
    [breakfastQuery, lunchQuery, dinnerQuery]
  );

  return (
    <>
      <Head>
        <title>
          {t('suggestedFor', { mealType: t(activeTab, {}) })} | RecipeMatch
        </title>
        <meta name="description" content={t('basedOnTime', {})} />
        <meta
          property="og:title"
          content={
            t('suggestedFor', { mealType: t(activeTab, {}) }) + ' | RecipeMatch'
          }
        />
        <meta property="og:description" content={t('basedOnTime', {})} />
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <MealIcon
                className={`h-12 w-12 ${currentMealConfig.color} mr-3`}
              />
              <h1 className="text-3xl font-bold text-slate-900">
                {t('suggestedFor', { mealType: t(activeTab, {}) })}
              </h1>
            </div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('basedOnTime', {})}
              {selectedIngredients.length > 0 &&
                ' ' +
                  t('withIngredients', { count: selectedIngredients.length })}
            </p>

            {/* Meal type tabs */}
            <div className="flex justify-center gap-4 mt-6">
              {(
                Object.entries(MEAL_TIME_CONFIG) as [
                  MealType,
                  (typeof MEAL_TIME_CONFIG)[MealType],
                ][]
              ).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={type}
                    variant={activeTab === type ? 'default' : 'outline'}
                    onClick={() => handleTabChange(type)}
                    className="flex items-center"
                    disabled={isRefreshing}
                  >
                    <Icon className={`h-4 w-4 mr-2 ${config.color}`} />
                    {t(type, {})}
                  </Button>
                );
              })}
            </div>

            {/* Refresh button */}
            {/* <div className="flex justify-center mt-4">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={isRefreshing}
                className="flex items-center"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </Button>
            </div> */}
          </div>

          {/* Error Handling */}
          {error && (
            <Card className="mb-8 text-center border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-red-600 mb-2">
                  {t('failedToLoad', {}) || 'Failed to load recipes'}
                </h3>
                <p className="text-slate-600 mb-4">
                  {t('tryRefresh', {}) || 'Please try refreshing the page'}
                </p>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  disabled={isRefreshing}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  {t('retry', {}) || 'Retry'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Meal Type Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <MealIcon
                  className={`h-6 w-6 ${currentMealConfig.color} mr-2`}
                />
                {t('perfectFor', { mealType: t(activeTab, {}) })}
              </h2>
              {selectedIngredients.length > 0 && (
                <Link href={`/${locale}/recipes`}>
                  <Button size="sm" className="bg-brand-blue hover:bg-blue-700">
                    {t('searchWithIngredients')}
                  </Button>
                </Link>
              )}
            </div>

            <Suspense fallback={<RecipesGridSkeleton />}>
              {isLoading ? (
                <RecipesGridSkeleton />
              ) : (
                <>
                  {currentRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentRecipes.map((recipe: RecipeWithIngredients) => {
                        const convertedRecipe = toRecipe(recipe);
                        if (!convertedRecipe) return null;

                        return (
                          <div
                            key={recipe.id}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            <RecipeCard recipe={convertedRecipe} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="text-center py-12">
                      <CardContent>
                        <MealIcon
                          className={`h-16 w-16 ${currentMealConfig.color} mx-auto mb-4 opacity-50`}
                        />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          {t('noRecipes', { mealType: t(activeTab, {}) })}
                        </h3>
                        <p className="text-slate-600 mb-4">
                          {t('noRecipesDesc', {})}
                        </p>
                        <Button
                          onClick={handleRefresh}
                          variant="outline"
                          disabled={isRefreshing}
                        >
                          <RefreshCw
                            className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                          />
                          {t('tryAgain', {}) || 'Try Again'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </Suspense>
          </section>

          {/* More Inspiration */}
          {initialRandom.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {t('moreInspiration', {})}
                </h2>
                <Link href={`/${locale}/recipes`}>
                  <Button variant="outline">{t('browseAll', {})}</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialRandom.map((recipe: RecipeWithIngredients) => {
                  const convertedRecipe = toRecipe(recipe);
                  if (!convertedRecipe) return null;

                  return (
                    <div
                      key={recipe.id}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <RecipeCard recipe={convertedRecipe} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Call to Action */}
          {selectedIngredients.length === 0 && (
            <Card className="mt-12 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-center text-slate-900">
                  {t('getPersonalized', {})}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 mb-4">
                  {t('addIngredientsCta', {})}
                </p>
                <Link href={`/${locale}/recipes`}>
                  <Button className="bg-brand-blue hover:bg-blue-700">
                    {t('addIngredients', {})}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}

// Optimized skeleton component
function RecipesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse"
        >
          <div className="w-full h-40 bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-xl" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4" />
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-full" />
            <div className="flex justify-between pt-2">
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16" />
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
