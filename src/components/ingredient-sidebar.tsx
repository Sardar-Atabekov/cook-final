'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search } from 'lucide-react';

import { useIngredientsSearch } from '@/hooks/useIngredients';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IngredientCategory as IngredientCategoryComponent } from './ingredientCategory';

import { ingredientsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

import type { Ingredient, IngredientCategory } from '@/types/recipe';

function SkeletonBlock() {
  return <div className="animate-pulse bg-gray-200 rounded h-8 w-full mb-2" />;
}

interface IngredientSidebarInnerProps {
  className?: string;
  initialGroupedCategories: IngredientCategory[];
}

export function IngredientSidebar({
  className,
  initialGroupedCategories,
}: IngredientSidebarInnerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('ux.sidebar');
  const locale = useLocale();

  const {
    selectedIngredients,
    addIngredient,
    removeIngredient,
    clearIngredients,
    groupedCategories,
    setGroupedCategories,
    isCacheStale,
  } = useIngredientStore();

  // ✅ 1. Инициализация стора вручную
  useEffect(() => {
    if (groupedCategories.length === 0) {
      setGroupedCategories(initialGroupedCategories, locale);
    }
  }, []);

  // ✅ 2. Вызываем запрос только если явно устарел кэш
  const shouldFetch = isCacheStale(locale);

  const {
    data: fetchedCategories,
    isLoading: categoriesLoading,
    error,
  } = useQuery({
    queryKey: ['ingredients', 'grouped', locale],
    queryFn: async () => {
      const data = await ingredientsApi.getGroupedIngredients(locale);
      setGroupedCategories(data, locale);
      return data;
    },
    enabled: shouldFetch,
    staleTime: Infinity,
    retry: (failureCount, error: any) => {
      // Don't retry on connection refused errors
      if (
        error?.code === 'ERR_NETWORK' ||
        error?.message?.includes('ERR_CONNECTION_REFUSED')
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const categoriesData = useMemo(() => {
    if (!shouldFetch && groupedCategories.length > 0) return groupedCategories;
    return fetchedCategories ?? [];
  }, [shouldFetch, groupedCategories, fetchedCategories]);

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
        'w-80 min-w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto h-screen pr-0',
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

            {/* Категории под поиском */}
            <div className="space-y-4 mb-6">
              {categoriesLoading
                ? [...Array(3)].map((_, i) => <SkeletonBlock key={i} />)
                : categoriesData.map((category: any, idx: number) => (
                    <IngredientCategoryComponent
                      key={category.id}
                      category={category}
                      ingredients={category.ingredients}
                      selectedIngredientIds={selectedIngredientIds}
                      isLoading={categoriesLoading}
                      onToggleIngredient={toggleIngredient}
                    />
                  ))}
            </div>
          </>
        )}

        {/* Категории без поиска */}
        {searchQuery.trim().length === 0 && (
          <div className="space-y-4">
            {error && (error as any)?.code === 'ERR_NETWORK' ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Сервер недоступен
                </h3>
                <p className="text-gray-600 text-sm">
                  Не удается загрузить ингредиенты. Пожалуйста, попробуйте
                  позже.
                </p>
              </div>
            ) : categoriesLoading ? (
              [...Array(5)].map((_, i) => <SkeletonBlock key={i} />)
            ) : (
              categoriesData.map((category: any, idx: number) => (
                <IngredientCategoryComponent
                  key={category.id}
                  category={category}
                  ingredients={category.ingredients}
                  selectedIngredientIds={selectedIngredientIds}
                  isLoading={categoriesLoading}
                  defaultOpen={idx === 0}
                  onToggleIngredient={toggleIngredient}
                />
              ))
            )}
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

        {/* Clear All */}
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
