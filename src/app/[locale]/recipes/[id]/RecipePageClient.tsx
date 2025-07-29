'use client';

import { useIngredientStore } from '@/stores/useIngredientStore';
import { useLocalSavedRecipes } from '@/hooks/useLocalSavedRecipes';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecipeQuery } from '@/hooks/useRecipeQuery';
import { useRecipesQuery } from '@/hooks/useRecipesQuery';
import { calculateIngredientMatch } from '@/shared/utils/calcMatch';
import {
  ArrowLeft,
  Clock,
  MapPin,
  ChefHat,
  Check,
  X,
  Heart,
  Share2,
  BookOpen,
  ChefHat as ChefHatIcon,
  ExternalLink,
  ChefHat as ChefHatIcon2,
  Star,
  Utensils,
  Leaf,
} from 'lucide-react';

interface RecipePageClientProps {
  initialRecipe: any;
  initialSimilarRecipes: any;
  locale: string;
  isLoading?: boolean;
}

export function RecipePageClient({
  initialRecipe,
  initialSimilarRecipes,
  locale,
  isLoading = false,
}: RecipePageClientProps) {
  const { selectedIngredients: userIngredients } = useIngredientStore();
  const t = useTranslations('recipe');
  const tCommon = useTranslations('common');
  const tFilters = useTranslations('ux.filters');
  const { toast } = useToast();
  const {
    isRecipeSaved,
    toggleSaveRecipe,
    loading: saving,
  } = useLocalSavedRecipes();

  // Получаем id рецепта
  const recipeId = initialRecipe?.id;

  // Получаем данные рецепта (без передачи ингредиентов)
  const { data: recipe } = useRecipeQuery(
    recipeId,
    [], // пустой массив ингредиентов, считаем на фронте
    initialRecipe
  );

  // Похожие рецепты через React Query
  const {
    data: similarRecipes,
    isLoading: similarLoading,
    isFetching: similarFetching,
  } = useRecipesQuery(
    {
      ingredientIds: [],
      lang: locale,
      limit: 4,
      mealType: recipe?.mealTypes?.[0]?.slug || 'all',
      country: recipe?.kitchens?.[0]?.slug || 'all',
      dietTags: recipe?.diets?.[0]?.slug || 'all',
      page: 1,
    },
    initialSimilarRecipes
  );

  // Если данных нет — ничего не рендерим (loader покажет loading.tsx)
  if (!recipe || !recipe.id) {
    return null;
  }

  const hasInitialData = !!initialRecipe;
  const isRecipeReady = recipe && recipe.id === recipeId;
  const shouldShowSkeleton = (!hasInitialData && !recipe) || !isRecipeReady;

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    await toggleSaveRecipe(recipe.id);
    toast({
      title: isRecipeSaved(recipe.id)
        ? tCommon('recipeSaved') || 'Рецепт сохранён'
        : tCommon('recipeRemoved') || 'Рецепт удалён',
      description: isRecipeSaved(recipe.id)
        ? tCommon('recipeSavedDesc', { title: recipe.title }) ||
          `"${recipe.title}" добавлен в избранные`
        : tCommon('recipeRemovedDesc', { title: recipe.title }) ||
          `"${recipe.title}" удалён из избранных`,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: tCommon('linkCopied') || 'Ссылка скопирована!' });
    } catch {
      toast({ title: tCommon('copyError') || 'Ошибка копирования' });
    }
  };

  const handleOpenOriginal = () => {
    if (recipe?.sourceUrl) {
      window.open(recipe.sourceUrl, '_blank');
    }
  };

  // Расчёт совпадений ингредиентов на фронте
  const matchResult = calculateIngredientMatch(
    recipe.recipeIngredients || [],
    userIngredients
  );

  const {
    ownedIngredients,
    missingIngredients,
    matchPercentage,
    totalIngredients,
    ownedCount,
  } = matchResult;

  // Проверки на существование массивов
  const hasKitchens = recipe.kitchens && recipe.kitchens.length > 0;
  const hasMealTypes = recipe.mealTypes && recipe.mealTypes.length > 0;
  const hasDiets = recipe.diets && recipe.diets.length > 0;
  const hasRating = recipe.rating && recipe.rating > 0;
  const hasPrepTime = recipe.prepTime || recipe.cookTime;

  // Создаем массив элементов для отображения
  const infoItems = [];
  if (hasPrepTime) {
    infoItems.push({
      icon: Clock,
      color: 'text-blue-500',
      text: `${recipe.prepTime || recipe.cookTime} ${tCommon('minutes')}`,
    });
  }
  if (hasKitchens) {
    infoItems.push({
      icon: MapPin,
      color: 'text-green-500',
      text: recipe.kitchens
        .map((kitchen: any) => tFilters(kitchen.slug))
        .join(', '),
    });
  }
  if (hasMealTypes) {
    infoItems.push({
      icon: Utensils,
      color: 'text-purple-500',
      text: recipe.mealTypes
        .map((mealType: any) => tFilters(mealType.slug))
        .join(', '),
    });
  }
  if (hasDiets) {
    infoItems.push({
      icon: Leaf,
      color: 'text-emerald-500',
      text: recipe.diets.map((diet: any) => tFilters(diet.slug)).join(', '),
    });
  }
  if (hasRating) {
    infoItems.push({
      icon: Star,
      color: 'text-yellow-500',
      text: recipe.rating.toString(),
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6 group">
        <Link href={`/${locale}/recipes`}>
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('backToRecipes') || 'Вернуться к рецептам'}
        </Link>
      </Button>

      {/* Recipe Header */}
      <div className="mb-8">
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6 shadow-xl">
          <Image
            src={recipe.imageUrl || '/images/placeholder.svg'}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-all duration-200 shadow-lg hover:scale-105"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleSaveRecipe}
              disabled={saving}
              className={`p-2 rounded-full transition-all duration-200 shadow-lg hover:scale-105 ${
                isRecipeSaved(recipe.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isRecipeSaved(recipe.id) && 'fill-current'}`}
              />
            </button>
            {recipe.sourceUrl && (
              <Link
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-all duration-200 shadow-lg hover:scale-105 bg-white/90 text-gray-700 hover:bg-white`}
              >
                <ExternalLink className={`h-4 w-4`} />
              </Link>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Recipe Info - в одной строке */}
        <div className="flex flex-wrap gap-4 mb-6">
          {infoItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-gray-600 bg-gray-50 p-3 rounded-lg flex-shrink-0"
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="font-medium whitespace-nowrap">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Match Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              {t('ingredientMatch')}
            </h3>
            <Badge
              className={`${
                matchPercentage >= 80
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : matchPercentage >= 60
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-red-100 text-red-800 border-red-200'
              } text-sm font-medium px-3 py-1`}
            >
              {t('ingredientMatchPercentage', {
                percentage: matchPercentage,
              })}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            {t('ingredientMatchDescription', {
              owned: ownedCount,
              total: totalIngredients,
            })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-1 gap-8">
        {/* Ingredients */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <CardTitle className="flex items-center text-green-800">
              <ChefHatIcon className="h-5 w-5 mr-2" />
              {t('ingredients')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              {ownedIngredients.map((ingredient: any, index: number) => (
                <li
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-green-800 font-medium">
                    {ingredient.line || ingredient.matched_name}
                  </span>
                </li>
              ))}
              {missingIngredients.map((ingredient: any, index: number) => (
                <li
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">
                    {ingredient.line || ingredient.matched_name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-transform">
            <ChefHat className="w-4 h-4 mr-2" />
            {t('startCooking') || 'Приготовить блюдо'}
          </Button>
          {recipe.sourceUrl && (
            <Button
              variant="outline"
              onClick={handleOpenOriginal}
              className="flex-1 hover:scale-105 transition-transform"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('originalRecipe') || 'Оригинальный рецепт'}
            </Button>
          )}
        </div>
      </div>

      {/* Similar Recipes */}
      {(!initialSimilarRecipes &&
        (!similarRecipes || similarRecipes.length === 0)) ||
      similarLoading ||
      similarFetching ? (
        <div className="mt-12">
          <Skeleton className="h-8 w-48 mb-6 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-lg border-0">
                <Skeleton className="h-48 rounded-t-lg bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg" />
                  <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-300 shadow-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        similarRecipes &&
        similarRecipes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ChefHatIcon2 className="h-6 w-6 mr-2 text-purple-600" />
              {t('similarRecipes') || 'Похожие блюда'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarRecipes
                .filter((r: any) => r.id !== recipe.id)
                .slice(0, 4)
                .map((similarRecipe: any, _index: number) => (
                  <div key={similarRecipe.id} className="group">
                    <Link href={`/${locale}/recipes/${similarRecipe.id}`}>
                      <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
                        <div className="relative h-48">
                          <Image
                            src={
                              similarRecipe.imageUrl ||
                              '/images/placeholder.svg'
                            }
                            alt={similarRecipe.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {similarRecipe.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>
                                {tFilters('byMinutes', {
                                  count:
                                    similarRecipe.prepTime ||
                                    similarRecipe.cookTime,
                                })}
                              </span>
                            </div>
                            {similarRecipe.rating && (
                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{similarRecipe.rating}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
