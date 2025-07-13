'use client';

import { useState } from 'react';
import { RecipeCard } from './recipe-card';
import { RecipeDetail } from './recipe-detail';
import { SearchBar } from './search-bar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePantry } from '@/hooks/usePantry';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useLocale } from 'next-intl';
import { useRecipes } from '@/hooks/useRecipes';
import type { Recipe } from '@/types/recipe';
import { RecipeFilters, type FilterState } from '@/components/recipe-filters';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';

interface RecipeGridProps {
  selectedIngredients: Array<{ id: number; name: string }>;
}

export function RecipeGrid({ selectedIngredients }: RecipeGridProps) {
  const [dishTypeFilter, setDishTypeFilter] = useState('all');
  const [prepTimeFilter, setPrepTimeFilter] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();
  const { addMultipleToPantry } = usePantry();
  const { toggleSaveRecipe, isRecipeSaved } = useSavedRecipes();
  const locale = useLocale();

  const selectedIngredientIDs = selectedIngredients.map((i) => i.id);

  const { recipes, total, isLoading, loadMore, hasMore, currentCount, error } =
    useRecipes({
      ingredientIds: searchQuery.trim() ? [] : selectedIngredientIDs,
      searchText: searchQuery,
      lang: locale,
      limit: 20,
    });

  const isInitialLoading = isLoading && recipes.length === 0;

  const handleSaveRecipe = (recipe: Recipe) => {
    toggleSaveRecipe(recipe.id, recipe.title);
    toast({
      title: isRecipeSaved(recipe.id) ? 'Рецепт удален' : 'Рецепт сохранен',
      description: isRecipeSaved(recipe.id)
        ? `"${recipe.title}" удален из избранных`
        : `"${recipe.title}" добавлен в избранные`,
    });
  };
  const [filters, setFilters] = useState<FilterState>({
    mealType: 'all',
    country: 'all',
    dietTags: [],
  });
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailOpen(true);
  };

  const handleCookDish = (recipe: Recipe) => {
    const recipeIngredients =
      recipe.recipeIngredients?.map((ri: any) => ({
        id: ri.ingredientId,
        name: ri.ingredient?.name || `Ингредиент ${ri.ingredientId}`,
      })) || [];

    addMultipleToPantry(recipeIngredients, recipe.title);

    toast({
      title: 'Готовим блюдо!',
      description: `Ингредиенты для "${recipe.title}" добавлены в кладовую. Приятного аппетита!`,
    });
  };

  return (
    <div className="flex-1">
      {/* Заголовок и поиск */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {searchQuery
              ? `Результаты поиска: "${searchQuery}"`
              : selectedIngredients.length === 0
                ? 'Все рецепты'
                : 'Рецепты для вас'}
          </h2>
          <p className="text-gray-600">
            {searchQuery
              ? `Найдено ${total} рецептов`
              : selectedIngredients.length === 0
                ? `Показано ${currentCount} из ${total} рецептов`
                : `Показано ${currentCount} из ${total} рецептов по вашим ингредиентам`}
          </p>
        </div>

        <div className="lg:w-96">
          <SearchBar
            placeholder="Поиск рецептов..."
            onSearch={setSearchQuery}
            className="w-full"
          />
        </div>
        <div className="mb-8">
          <RecipeFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      {/* Состояния загрузки / отсутствие данных / список рецептов */}
      {error && (error as any)?.code === 'ERR_NETWORK' ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Сервер недоступен
          </h3>
          <p className="text-gray-600">
            Не удается подключиться к серверу рецептов. Пожалуйста, попробуйте
            позже.
          </p>
        </div>
      ) : isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {Array.from({ length: 20 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-52 w-full rounded-lg bg-gray-300 animate-pulse" />
              <Skeleton className="h-5 w-3/4 bg-gray-300 animate-pulse" />
              <Skeleton className="h-5 w-1/2 bg-gray-300 animate-pulse" />
              <Skeleton className="h-4 w-full bg-gray-300 animate-pulse" />
              <Skeleton className="h-4 w-2/3 bg-gray-300 animate-pulse" />
            </div>
          ))}
        </div>
      ) : !isLoading && total === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Рецепты не найдены
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Попробуйте изменить поисковый запрос'
              : 'Попробуйте выбрать другие ингредиенты или изменить фильтры'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe as any}
                onClick={() => handleRecipeClick(recipe)}
                onSave={() => handleSaveRecipe(recipe)}
                isSaved={isRecipeSaved(recipe.id)}
              />
            ))}
          </div>

          {/* Кнопка "Показать больше" */}
          {!searchQuery && hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                Показать больше рецептов
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Показано {currentCount} из {total} рецептов
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
