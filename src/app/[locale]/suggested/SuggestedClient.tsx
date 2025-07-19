'use client';

import { useQuery } from '@tanstack/react-query';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, Coffee, Sun, Moon, RefreshCw } from 'lucide-react';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeDetail } from '@/components/recipe-detail';
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

// Helper function to convert RecipeWithIngredients to Recipe
function toRecipe(recipe: RecipeWithIngredients | null): Recipe | null {
  if (!recipe) return null;

  return {
    description: recipe.description || '',
    cookTime: (recipe as any).cookTime || 0,
    rating: recipe.rating || 0,
    prepTime: (recipe as any).prepTime || '',
    nutrition: (recipe as any).nutrition || {},
    id: String(recipe.id),
    title: recipe.title,
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
}

// Hook for determining current meal type based on time
function useCurrentMealType(): MealType {
  const [currentMealType, setCurrentMealType] = useState<MealType>('dinner');

  useEffect(() => {
    const updateMealType = () => {
      const hour = new Date().getHours();

      for (const [mealType, config] of Object.entries(MEAL_TIME_CONFIG)) {
        if (hour >= config.startHour && hour < config.endHour) {
          setCurrentMealType(mealType as MealType);
          return;
        }
      }

      // Default to dinner if no match (shouldn't happen with current ranges)
      setCurrentMealType('dinner');
    };

    updateMealType();

    // Update meal type every minute
    const interval = setInterval(updateMealType, 60000);

    return () => clearInterval(interval);
  }, []);

  return currentMealType;
}

// Custom hook for meal type queries
function useMealTypeQuery(
  mealTypeId: string | undefined,
  ingredientIds: number[],
  locale: string,
  initialData: RecipeWithIngredients[]
) {
  return useQuery({
    queryKey: ['suggested', ingredientIds, mealTypeId, locale],
    enabled: !!mealTypeId,
    queryFn: async () => {
      if (!mealTypeId) return [];

      const filters = {
        offset: 0,
        limit: 20,
        mealType: mealTypeId,
        country: '',
        dietTags: '',
      };

      const result = await recipeApi.getRecipes(ingredientIds, filters, locale);
      return result.recipes || [];
    },
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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

  const [selectedRecipe, setSelectedRecipe] =
    useState<RecipeWithIngredients | null>(null);
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

  // Queries for each meal type
  const breakfastQuery = useMealTypeQuery(
    mealTypeIds.breakfast,
    ingredientIds,
    locale,
    initialBreakfast
  );
  const lunchQuery = useMealTypeQuery(
    mealTypeIds.lunch,
    ingredientIds,
    locale,
    initialLunch
  );
  const dinnerQuery = useMealTypeQuery(
    mealTypeIds.dinner,
    ingredientIds,
    locale,
    initialDinner
  );

  // Loading and error states
  const isLoading =
    breakfastQuery.isLoading || lunchQuery.isLoading || dinnerQuery.isLoading;
  const error = breakfastQuery.error || lunchQuery.error || dinnerQuery.error;

  // Refresh function
  const handleRefresh = useCallback(() => {
    breakfastQuery.refetch();
    lunchQuery.refetch();
    dinnerQuery.refetch();
  }, [breakfastQuery, lunchQuery, dinnerQuery]);

  // Get current meal configuration
  const currentMealConfig = MEAL_TIME_CONFIG[activeTab];
  const MealIcon = currentMealConfig.icon;

  // Get current recipes based on active tab
  const currentRecipes = useMemo(() => {
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
  }, [activeTab, breakfastQuery.data, lunchQuery.data, dinnerQuery.data]);

  // Callback for recipe clicks
  const handleRecipeClick = useCallback((recipe: RecipeWithIngredients) => {
    setSelectedRecipe(recipe);
  }, []);

  // Close recipe detail
  const handleCloseRecipeDetail = useCallback(() => {
    setSelectedRecipe(null);
  }, []);

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
                    onClick={() => setActiveTab(type)}
                    className="flex items-center"
                  >
                    <Icon className={`h-4 w-4 mr-2 ${config.color}`} />
                    {t(type, {})}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Error Handling */}
          {error && (
            <Card className="mb-8 text-center">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium text-red-600 mb-2">
                  {t('failedToLoad', {})}
                </h3>
                <p className="text-slate-600 mb-4">{t('tryRefresh', {})}</p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('retry', {})}
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

            {isLoading ? (
              <RecipesGridSkeleton />
            ) : (
              <>
                {currentRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentRecipes.map((recipe: RecipeWithIngredients) => (
                      <div
                        key={recipe.id}
                        onClick={() => handleRecipeClick(recipe)}
                        className="cursor-pointer"
                      >
                        <RecipeCard recipe={toRecipe(recipe)!} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <MealIcon
                        className={`h-16 w-16 ${currentMealConfig.color} mx-auto mb-4`}
                      />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        {t('noRecipes', { mealType: t(activeTab, {}) })}
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {t('noRecipesDesc', {})}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </section>

          {/* All Day Meal Options */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {t('mealOptionsByTime', {})}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <SuggestedSection
                title={t('breakfast', {})}
                noRecipesText={t('noRecipesAvailable', {})}
                icon={<Coffee className="h-5 w-5 text-amber-600" />}
                colorClass="text-amber-600"
                recipes={breakfastQuery.data || []}
                isLoading={breakfastQuery.isLoading}
                onRecipeClick={handleRecipeClick}
              />
              <SuggestedSection
                title={t('lunch', {})}
                noRecipesText={t('noRecipesAvailable', {})}
                icon={<Sun className="h-5 w-5 text-yellow-600" />}
                colorClass="text-yellow-600"
                recipes={lunchQuery.data || []}
                isLoading={lunchQuery.isLoading}
                onRecipeClick={handleRecipeClick}
              />
              <SuggestedSection
                title={t('dinner', {})}
                noRecipesText={t('noRecipesAvailable', {})}
                icon={<Moon className="h-5 w-5 text-blue-600" />}
                colorClass="text-blue-600"
                recipes={dinnerQuery.data || []}
                isLoading={dinnerQuery.isLoading}
                onRecipeClick={handleRecipeClick}
              />
            </div>
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
                {initialRandom.map((recipe: RecipeWithIngredients) => (
                  <div
                    key={recipe.id}
                    onClick={() => handleRecipeClick(recipe)}
                    className="cursor-pointer"
                  >
                    <RecipeCard recipe={toRecipe(recipe)!} />
                  </div>
                ))}
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

        {/* Recipe Detail Modal */}
        <RecipeDetail
          recipe={toRecipe(selectedRecipe)}
          isOpen={!!selectedRecipe}
          onClose={handleCloseRecipeDetail}
          onCookDish={() => {}}
        />

        <Footer />
      </div>
    </>
  );
}

// Skeleton component for loading state
function RecipesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse"
        >
          <div className="w-full h-48 bg-slate-200 rounded-t-xl" />
          <div className="p-4">
            <div className="h-4 bg-slate-200 rounded mb-2" />
            <div className="h-3 bg-slate-200 rounded mb-4" />
            <div className="flex justify-between">
              <div className="h-3 bg-slate-200 rounded w-16" />
              <div className="h-3 bg-slate-200 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
