import { useState } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from './recipe-card';
import { RecipeDetail } from './recipe-detail';
import { SearchBar } from './search-bar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePantry } from '@/hooks/usePantry';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/lib/api';
import type { Recipe } from '@/types/recipe';
import { useLocale } from 'next-intl';

interface RecipeGridProps {
  selectedIngredients: number[];
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

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/recipes/recipes', searchQuery],
    queryFn: () =>
      recipeApi.getRecipes(
        [],
        {
          page: 1,
          limit: 12,
          mealType: 'all',
          country: '',
          dietTags: [],
        },
        locale
      ),
    enabled: !!searchQuery,
  });

  const { recipes, total, isLoading, loadMore, hasMore, currentCount } =
    useRecipes(searchQuery ? [] : selectedIngredients);

  // Ограничиваем до 20 рецептов
  const displayRecipes =
    (searchQuery ? searchResults?.recipes : recipes)?.slice(0, 20) || [];
  const displayTotal = Math.min(
    10,
    searchQuery ? searchResults?.total || 0 : total
  );
  const displayLoading = searchQuery ? isSearching : isLoading;

  const handleSaveRecipe = (recipe: Recipe) => {
    toggleSaveRecipe(recipe.id, recipe.title);
    toast({
      title: isRecipeSaved(recipe.id) ? 'Рецепт удален' : 'Рецепт сохранен',
      description: isRecipeSaved(recipe.id)
        ? `"${recipe.title}" удален из сохраненных`
        : `"${recipe.title}" добавлен в сохраненные рецепты`,
    });
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailOpen(true);
  };

  const handleCookDish = (recipe: Recipe) => {
    const recipeIngredients =
      recipe.recipeIngredients?.map((ri) => ({
        id: ri.ingredientId,
        name: ri.ingredient?.name || `Ингредиент ${ri.ingredientId}`,
      })) || [];

    addMultipleToPantry(recipeIngredients, recipe.title);

    toast({
      title: 'Готовим блюдо!',
      description: `Ингредиенты для "${recipe.title}" добавлены в кладовую. Приятного аппетита!`,
    });

    console.log(
      'Cooking dish:',
      recipe.title,
      'Added ingredients to pantry:',
      recipeIngredients
    );
  };

  // Показываем все рецепты, если ингредиенты не выбраны
  const displayMessage = selectedIngredients.length === 0;

  return (
    <div className="flex-1">
      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                ? `Найдено ${displayTotal} рецептов`
                : selectedIngredients.length === 0
                  ? `Показано ${displayRecipes.length} из ${displayTotal} рецептов`
                  : `Показано ${displayRecipes.length} из ${displayTotal} рецептов по вашим ингредиентам`}
            </p>
          </div>

          <div className="lg:w-96">
            <SearchBar
              placeholder="Поиск рецептов..."
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      {displayLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-52 w-full rounded-lg bg-gray-300 animate-pulse" />
              <Skeleton className="h-5 w-3/4 bg-gray-300 animate-pulse" />
              <Skeleton className="h-5 w-1/2 bg-gray-300 animate-pulse" />
              <Skeleton className="h-4 w-full bg-gray-300 animate-pulse" />
              <Skeleton className="h-4 w-2/3 bg-gray-300 animate-pulse" />
            </div>
          ))}
        </div>
      ) : displayRecipes.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Рецепты не найдены' : 'Рецепты не найдены'}
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
            {displayRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe)}
                onSave={() => handleSaveRecipe(recipe)}
                isSaved={isRecipeSaved(recipe.id)}
              />
            ))}
          </div>

          {/* Load More Button - только для обычного режима */}
          {!searchQuery && hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={displayLoading}
              >
                Показать больше рецептов
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Показано {currentCount} из {displayTotal} рецептов
              </p>
            </div>
          )}
        </>
      )}

      <RecipeDetail
        recipe={selectedRecipe}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedRecipe(null);
        }}
        onCookDish={handleCookDish}
      />
    </div>
  );
}
