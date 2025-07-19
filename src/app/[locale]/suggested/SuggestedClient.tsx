'use client';
import { useQuery } from '@tanstack/react-query';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { useState, useEffect, useMemo } from 'react';
import { Clock, Coffee, Sun, Moon, RefreshCw } from 'lucide-react';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeDetail } from '@/components/recipe-detail';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { RecipeWithIngredients } from '@/types/recipe';
import type { Recipe } from '@/lib/api';
import Head from 'next/head';
import { recipeApi } from '@/lib/api';
import { SuggestedSection } from '@/components/suggested-section';
import { useTags } from '@/hooks/useTags';
import { useTagsStore } from '@/stores/useTagsStore';

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

interface SuggestedClientProps {
  locale: string;
  initialTags: any[];
  initialBreakfast: RecipeWithIngredients[];
  initialLunch: RecipeWithIngredients[];
  initialDinner: RecipeWithIngredients[];
  initialRandom: RecipeWithIngredients[];
}

export function SuggestedClient({
  locale,
  initialTags,
  initialBreakfast,
  initialLunch,
  initialDinner,
  initialRandom,
}: SuggestedClientProps) {
  const { selectedIngredients } = useIngredientStore();
  const ingredientIds = selectedIngredients.map((i) => i.id);
  const [selectedRecipe, setSelectedRecipe] =
    useState<RecipeWithIngredients | null>(null);
  const t = useTranslations('suggested');
  const { tags } = useTags(locale, initialTags);
  const setTags = useTagsStore((state) => state.setTags);

  // Сохраняем initialTags в глобальный store при первом рендере
  useEffect(() => {
    if (initialTags && initialTags.length > 0) {
      setTags(initialTags, locale);
    }
  }, [initialTags, locale]);

  // Получаем mealTypes (теги) с initialData
  const mealTypes = Array.isArray(tags)
    ? tags.filter((t: any) => t.type === 'meal_type')
    : [];

  function getMealTypeId(type: string): string | undefined {
    const found = mealTypes.find(
      (t: any) => t.slug === type || t.name.toLowerCase() === type
    );
    return found ? found.id.toString() : undefined;
  }

  const breakfastId = getMealTypeId('breakfast');
  const lunchId = getMealTypeId('lunch');
  const dinnerId = getMealTypeId('main');

  // Получаем рецепты для каждого типа с initialData
  const {
    data: breakfastRecipes = [],
    isLoading: isBreakfastLoading,
    error: breakfastError,
    refetch: refetchBreakfast,
  } = useQuery({
    queryKey: ['suggested', ingredientIds, breakfastId, locale],
    enabled: !!breakfastId,
    queryFn: async () => {
      const filters = {
        offset: 0,
        limit: 20,
        mealType: breakfastId!,
        country: '',
        dietTags: '',
      };
      const result = await recipeApi.getRecipes(ingredientIds, filters, locale);
      return result.recipes || [];
    },
    initialData: initialBreakfast,
  });
  const {
    data: lunchRecipes = [],
    isLoading: isLunchLoading,
    error: lunchError,
    refetch: refetchLunch,
  } = useQuery({
    queryKey: ['suggested', ingredientIds, lunchId, locale],
    enabled: !!lunchId,
    queryFn: async () => {
      const filters = {
        offset: 0,
        limit: 20,
        mealType: lunchId!,
        country: '',
        dietTags: '',
      };
      const result = await recipeApi.getRecipes(ingredientIds, filters, locale);
      return result.recipes || [];
    },
    initialData: initialLunch,
  });
  const {
    data: dinnerRecipes = [],
    isLoading: isDinnerLoading,
    error: dinnerError,
    refetch: refetchDinner,
  } = useQuery({
    queryKey: ['suggested', ingredientIds, dinnerId, locale],
    enabled: !!dinnerId,
    queryFn: async () => {
      const filters = {
        offset: 0,
        limit: 20,
        mealType: dinnerId!,
        country: '',
        dietTags: '',
      };
      const result = await recipeApi.getRecipes(ingredientIds, filters, locale);
      return result.recipes || [];
    },
    initialData: initialDinner,
  });

  const isLoading = isBreakfastLoading || isLunchLoading || isDinnerLoading;
  const error = breakfastError || lunchError || dinnerError;
  const handleRefresh = () => {
    refetchBreakfast();
    refetchLunch();
    refetchDinner();
  };

  // --- Определяем mealType по локальному времени пользователя ---
  const [localMealType, setLocalMealType] = useState<
    'breakfast' | 'lunch' | 'dinner'
  >('dinner');
  const [mealIcon, setMealIcon] = useState<'coffee' | 'sun' | 'moon'>('moon');
  const [mealColor, setMealColor] = useState('text-slate-600');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour > 6 && hour < 12) {
      setLocalMealType('breakfast');
      setMealIcon('coffee');
      setMealColor('text-amber-600');
    } else if (hour > 12 && hour < 16) {
      setLocalMealType('lunch');
      setMealIcon('sun');
      setMealColor('text-yellow-600');
    } else {
      setLocalMealType('dinner');
      setMealIcon('moon');
      setMealColor('text-blue-600');
    }
  }, []);
  const MealIcon =
    mealIcon === 'coffee' ? Coffee : mealIcon === 'sun' ? Sun : Moon;

  // --- Мемоизация списков рецептов ---
  const memoBreakfastRecipes = useMemo(
    () => breakfastRecipes,
    [breakfastRecipes]
  );
  const memoLunchRecipes = useMemo(() => lunchRecipes, [lunchRecipes]);
  const memoDinnerRecipes = useMemo(() => dinnerRecipes, [dinnerRecipes]);
  const memoRandomRecipes = useMemo(() => initialRandom, [initialRandom]);

  // --- Табы для выбора времени суток ---
  const [activeTab, setActiveTab] = useState<'breakfast' | 'lunch' | 'dinner'>(
    localMealType
  );
  useEffect(() => {
    setActiveTab(localMealType);
  }, [localMealType]);

  // --- Главный блок ---
  let currentRecipes: RecipeWithIngredients[] = [];
  if (activeTab === 'breakfast') currentRecipes = memoBreakfastRecipes;
  else if (activeTab === 'lunch') currentRecipes = memoLunchRecipes;
  else if (activeTab === 'dinner') currentRecipes = memoDinnerRecipes;

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
              <MealIcon className={`h-12 w-12 ${mealColor} mr-3`} />
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
            {/* Табы для выбора времени суток */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant={activeTab === 'breakfast' ? 'default' : 'outline'}
                onClick={() => setActiveTab('breakfast')}
                className="flex items-center"
              >
                <Coffee className="h-4 w-4 mr-2 text-amber-600" />
                {t('breakfast', {})}
              </Button>
              <Button
                variant={activeTab === 'lunch' ? 'default' : 'outline'}
                onClick={() => setActiveTab('lunch')}
                className="flex items-center"
              >
                <Sun className="h-4 w-4 mr-2 text-yellow-600" />
                {t('lunch', {})}
              </Button>
              <Button
                variant={activeTab === 'dinner' ? 'default' : 'outline'}
                onClick={() => setActiveTab('dinner')}
                className="flex items-center"
              >
                <Moon className="h-4 w-4 mr-2 text-blue-600" />
                {t('dinner', {})}
              </Button>
            </div>
          </div>

          {/* Error Handling */}
          {error && (
            <Card className="mb-8 text-center">
              <CardContent>
                <h3 className="text-lg font-medium text-red-600 mb-2">
                  {t('failedToLoad', {})}
                </h3>
                <p className="text-slate-600 mb-4">{t('tryRefresh', {})}</p>
                <Button onClick={handleRefresh} variant="outline">
                  {t('retry', {})}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Meal Type Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <MealIcon className={`h-6 w-6 ${mealColor} mr-2`} />
                {t('perfectFor', { mealType: t(activeTab, {}) })}
              </h2>
              {selectedIngredients.length > 0 && (
                <Link href={`/${locale}/recipes`} legacyBehavior>
                  <Button size="sm" className="bg-brand-blue hover:bg-blue-700">
                    {t('searchWithIngredients')}
                  </Button>
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse"
                  >
                    <div className="w-full h-48 bg-slate-200 rounded-t-xl"></div>
                    <div className="p-4">
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-slate-200 rounded w-16"></div>
                        <div className="h-3 bg-slate-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {currentRecipes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentRecipes.map((recipe: RecipeWithIngredients) => (
                      <div
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <RecipeCard recipe={toRecipe(recipe)!} />
                      </div>
                    ))}
                  </div>
                )}

                {currentRecipes.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <MealIcon
                        className={`h-16 w-16 ${mealColor} mx-auto mb-4`}
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
              {/* Breakfast */}
              <SuggestedSection
                title={t('breakfast', {})}
                noRecipesText={t('noRecipesAvailable', {})}
                icon={<Coffee className="h-5 w-5 text-amber-600" />}
                colorClass="text-amber-600"
                recipes={memoBreakfastRecipes}
                isLoading={isBreakfastLoading}
                onRecipeClick={setSelectedRecipe}
              />
              {/* Lunch */}
              <SuggestedSection
                title={t('lunch', {})}
                noRecipesText={t('noRecipesAvailable', {})}
                icon={<Sun className="h-5 w-5 text-yellow-600" />}
                colorClass="text-yellow-600"
                recipes={memoLunchRecipes}
                isLoading={isLunchLoading}
                onRecipeClick={setSelectedRecipe}
              />
              {/* Dinner */}
              <SuggestedSection
                title={t('dinner', {})}
                noRecipesText={t('noRecipesAvailable', {})}
                icon={<Moon className="h-5 w-5 text-blue-600" />}
                colorClass="text-blue-600"
                recipes={memoDinnerRecipes}
                isLoading={isDinnerLoading}
                onRecipeClick={setSelectedRecipe}
              />
            </div>
          </section>

          {/* More Inspiration */}
          {memoRandomRecipes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {t('moreInspiration', {})}
                </h2>
                <Link href={`/${locale}/recipes`} legacyBehavior>
                  <Button variant="outline">{t('browseAll', {})}</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memoRandomRecipes.map((recipe: RecipeWithIngredients) => (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
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
                <Link href={`/${locale}/recipes`} legacyBehavior>
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
          onClose={() => setSelectedRecipe(null)}
          onCookDish={() => {}}
        />

        <Footer />
      </div>
    </>
  );
}
