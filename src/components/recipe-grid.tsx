import { useState } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from './recipe-card';
import { RecipeDetail } from './recipe-detail';
import { SearchBar } from './search-bar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBasket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePantry } from '@/hooks/usePantry';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useQuery } from '@tanstack/react-query';
// import { api } from '@/lib/api';
import type { Recipe } from '@/types/recipe';

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

  // Используем поиск вместо обычных рецептов если есть запрос
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/recipes/search', searchQuery],
    queryFn: () => api.searchRecipes(searchQuery),
    enabled: !!searchQuery,
  });

  const { recipes, total, isLoading, loadMore, hasMore, currentCount } =
    useRecipes(searchQuery ? [] : selectedIngredients);

  // Определяем какие рецепты показывать
  const displayRecipes = searchQuery ? searchResults?.recipes || [] : recipes;
  const displayTotal = searchQuery ? searchResults?.total || 0 : total;
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
    // Получаем все ингредиенты рецепта
    const recipeIngredients =
      recipe.recipeIngredients?.map((ri) => ({
        id: ri.ingredientId,
        name: ri.ingredient?.name || `Ингредиент ${ri.ingredientId}`,
      })) || [];

    // Добавляем ингредиенты в кладовую
    addMultipleToPantry(recipeIngredients, recipe.title);

    // Показываем уведомление
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
                  ? `Показано ${Math.min(currentCount, displayTotal)} из ${displayTotal} рецептов`
                  : `Показано ${Math.min(currentCount, displayTotal)} из ${displayTotal} рецептов по вашим ингредиентам`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="lg:w-96">
            <SearchBar
              placeholder="Поиск рецептов..."
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* <Select value={dishTypeFilter} onValueChange={setDishTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Dish Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dish Types</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
              </SelectContent>
            </Select> */}

            {/* <Select value={prepTimeFilter} onValueChange={setPrepTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Any Prep Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Prep Time</SelectItem>
                <SelectItem value="quick">Under 15 min</SelectItem>
                <SelectItem value="medium">15-30 min</SelectItem>
                <SelectItem value="long">30-60 min</SelectItem>
                <SelectItem value="extended">Over 1 hour</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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

      {/* Recipe Detail Modal */}
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
