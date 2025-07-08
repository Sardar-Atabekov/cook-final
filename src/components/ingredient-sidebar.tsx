import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useIngredientsSearch } from '@/hooks/useIngredients';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { cn } from '@/lib/utils';
import { ingredientsApi } from '@/lib/api';
import { useIngredientStore } from '@/stores/useIngredientStore';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { Ingredient } from '@/types/recipe';
import { IngredientCategory } from './ingredientCategory';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

function SkeletonBlock() {
  return <div className="animate-pulse bg-gray-200 rounded h-8 w-full mb-2" />;
}

interface IngredientSidebarProps {
  className?: string;
}

export function IngredientSidebar({ className }: IngredientSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { language, version } = useLanguageStore();
  const {
    selectedIngredients,
    addIngredient,
    removeIngredient,
    groupedCategories,
    setGroupedCategories,
    isCacheStale,
    clearIngredients,
  } = useIngredientStore();
  const {
    data: categoriesData = groupedCategories,
    isLoading: categoriesLoading,
  } = useQuery<IngredientCategory[]>({
    queryKey: ['ingredients', 'grouped', language, version],
    queryFn: async () => {
      if (!isCacheStale(language) && groupedCategories.length > 0) {
        return groupedCategories;
      }
      const data = await ingredientsApi.getGroupedIngredients(language);
      setGroupedCategories(data, language);
      return data;
    },
    staleTime: 3 * 24 * 60 * 60 * 1000,
  });
  const t = useTranslations('ux.sidebar');
  // id выбранных ингредиентов для подсветки
  const selectedIngredientIds = useMemo(
    () => selectedIngredients.map((i) => i.id),
    [selectedIngredients]
  );

  const toggleIngredient = (ingredient: Ingredient) => {
    if (selectedIngredientIds.includes(ingredient.id)) {
      removeIngredient(ingredient.id);
    } else {
      addIngredient(ingredient);
    }
  };

  const { data: searchResults = [] } = useIngredientsSearch(searchQuery);

  return (
    <aside
      className={cn(
        'w-80 min-w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto h-screen  pr-0',
        className
      )}
    >
      <div className="p-6 pr-1">
        {/* Заголовок и поиск */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('yourIngredients')}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">{t('textDescription')}</div>

        {/* Поиск */}
        {searchQuery.trim().length > 0 && (
          <>
            {searchResults.length > 0 ? (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('searchResults')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {searchResults.map((ingredient) => (
                    <Button
                      key={ingredient.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'justify-start text-left h-auto p-2 text-sm hover:bg-blue-100',
                        selectedIngredientIds.includes(ingredient.id) &&
                          'bg-blue-100 text-blue-700'
                      )}
                      onClick={() => toggleIngredient(ingredient)}
                    >
                      {ingredient.name}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 text-center text-gray-600">
                {t('noResults', { searchQuery })}
              </div>
            )}

            {/* Категории под поиском для структуры */}
            <div className="space-y-4 mb-6">
              {categoriesLoading
                ? [...Array(3)].map((_, i) => <SkeletonBlock key={i} />)
                : categoriesData.map((category, idx) => (
                    <IngredientCategory
                      key={category.id}
                      category={category}
                      ingredients={category.ingredients}
                      selectedIngredientIds={selectedIngredientIds}
                      isLoading={categoriesLoading}
                      // defaultOpen={idx === 0}
                      onToggleIngredient={toggleIngredient}
                    />
                  ))}
            </div>
          </>
        )}

        {/* Категории без поиска */}
        {searchQuery.trim().length === 0 && (
          <div className="space-y-4">
            {categoriesLoading
              ? [...Array(5)].map((_, i) => <SkeletonBlock key={i} />)
              : categoriesData.map((category, idx) => (
                  <IngredientCategory
                    key={category.id}
                    category={category}
                    ingredients={category.ingredients}
                    selectedIngredientIds={selectedIngredientIds}
                    isLoading={categoriesLoading}
                    defaultOpen={idx === 0}
                    onToggleIngredient={toggleIngredient}
                  />
                ))}
          </div>
        )}

        {/* Выбранные ингредиенты */}
        {selectedIngredients.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              {t('selected', { count: selectedIngredients.length })}
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <Badge
                  key={ingredient.id}
                  variant="default"
                  className="bg-blue-600 text-white flex items-center"
                >
                  {ingredient.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0 hover:text-gray-200"
                    onClick={() => removeIngredient(ingredient.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Clear All Button */}
        {selectedIngredients.length > 0 && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={clearIngredients}
          >
            Clear All Ingredients
          </Button>
        )}
      </div>
    </aside>
  );
}
