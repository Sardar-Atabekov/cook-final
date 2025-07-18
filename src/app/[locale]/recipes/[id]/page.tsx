'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { recipeApi } from '@/lib/api';
import { useStore } from '@/lib/store';
import {
  Clock,
  MapPin,
  Users,
  ChefHat,
  ArrowLeft,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { useLocalSavedRecipes } from '@/hooks/useLocalSavedRecipes';
import { useToast } from '@/hooks/use-toast';
export default function RecipePage() {
  const params = useParams();
  const { selectedIngredients: userIngredients } = useIngredientStore();
  const recipeId = params.id as string;
  const locale = useLocale();
  const t = useTranslations('recipe');
  const tCommon = useTranslations('common');
  const { toast } = useToast();
  const {
    isRecipeSaved,
    toggleSaveRecipe,
    loading: saving,
  } = useLocalSavedRecipes();
  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () =>
      recipeApi.getRecipe(
        recipeId,
        userIngredients.map((ingredient) => ingredient.id)
      ),
  });

  console.log('recipe', recipe);
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('notFound')}
          </h1>
          <p className="text-gray-600 mb-8">{t('notFoundDescription')}</p>
          <Button asChild>
            <Link href={`/${locale}/recipes`}>{t('backToRecipes')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Исправленная проверка наличия ингредиента у пользователя
  const hasIngredient = (ingredientId: number) =>
    userIngredients.some((userIng) => userIng.id === ingredientId);

  // Разделение ингредиентов
  const ownedIngredients = recipe.recipeIngredients.filter((ri: any) =>
    hasIngredient(ri.ingredientId)
  );
  const missingIngredients = recipe.recipeIngredients.filter(
    (ri: any) => !hasIngredient(ri.ingredientId)
  );

  // Обработчик сохранения рецепта
  const handleSaveRecipe = async () => {
    await toggleSaveRecipe(recipe.id);
    toast({
      title: isRecipeSaved(recipe.id)
        ? tCommon('recipeSaved') || 'Рецепт сохранён'
        : tCommon('recipeRemoved') || 'Рецепт удалён',
      description: isRecipeSaved(recipe.id)
        ? tCommon('recipeSavedDescription') ||
          `"${recipe.title}" добавлен в избранные`
        : tCommon('recipeRemovedDescription') ||
          `"${recipe.title}" удалён из избранных`,
    });
  };

  // Обработчик копирования ссылки
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: tCommon('linkCopied') || 'Ссылка скопирована!' });
    } catch {
      toast({ title: tCommon('copyError') || 'Ошибка копирования' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/${locale}/search`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToRecipes')}
        </Link>
      </Button>

      {/* Recipe Header */}
      <div className="mb-8">
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
          <Image
            src={recipe.imageUrl || '/images/placeholder.svg'}
            alt={recipe.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {recipe.title}
            </h1>
            <div className="flex flex-wrap gap-2"></div>
          </div>
        </div>

        {/* Recipe Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-5 w-5" />
            <span>{recipe.prepTime} mins</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-5 w-5" />
            <span>{recipe.country}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <ChefHat className="h-5 w-5" />
            <span>{recipe.mealType}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="h-5 w-5" />
            <span>4 servings</span>
          </div>
        </div>

        {/* Match Status */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Ingredient Match</h3>
            <Badge
              className={`${
                recipe.matchPercentage >= 80
                  ? 'bg-green-100 text-green-800'
                  : recipe.matchPercentage >= 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {recipe.matchPercentage}% Match
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            You have{' '}
            {recipe.recipeIngredients.length - recipe.missingIngredients.length}{' '}
            of {recipe.recipeIngredients.length} ingredients
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-1 gap-8">
        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {ownedIngredients.map((ingredient: any, index: number) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-green-800">
                    {ingredient.line || ingredient.ingredient?.name}
                  </span>
                </li>
              ))}
              {missingIngredients.map((ingredient: any, index: number) => (
                <li key={index} className="flex items-center space-x-3">
                  <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-900">
                    {ingredient.line || ingredient.ingredient?.name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Инструкции */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('instructions') || 'Instructions'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 list-decimal list-inside">
                {recipe.instructions.map((step: string, index: number) => (
                  <li key={index} className="flex space-x-3">
                    <span className="font-bold text-brand-blue">
                      {index + 1}.
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
          <ChefHat className="w-4 h-4 mr-2" />
          {tCommon('cookDish')}
        </Button>
        <Button
          variant={isRecipeSaved(recipe.id) ? 'default' : 'outline'}
          size="lg"
          onClick={handleSaveRecipe}
          disabled={saving}
        >
          {isRecipeSaved(recipe.id)
            ? tCommon('saved') || 'Сохранено'
            : tCommon('saveRecipe') || 'Сохранить рецепт'}
        </Button>
        <Button variant="outline" size="lg" onClick={handleShare}>
          {tCommon('shareRecipe') || 'Поделиться'}
        </Button>
        {recipe.sourceUrl && (
          <Button
            variant="outline"
            onClick={() => window.open(recipe.sourceUrl, '_blank')}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {tCommon('originalRecipe')}
          </Button>
        )}
      </div>
    </div>
  );
}
