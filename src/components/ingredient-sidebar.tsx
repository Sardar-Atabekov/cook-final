'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { ingredientsApi } from '@/lib/api';
import { useIngredientsSearch } from '@/hooks/useIngredients';
import { IngredientCategory as IngredientCategoryComponent } from './ingredientCategory';

function SkeletonBlock() {
  return <div className="animate-pulse bg-gray-200 rounded h-8 w-full mb-2" />;
}

export function IngredientSidebar({
  className,
  initialGroupedCategories,
}: {
  className?: string;
  initialGroupedCategories: any[];
}) {
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

  // 1. Если в zustand есть категории для текущего языка — показываем их
  // 2. Если нет — используем initialGroupedCategories (и кладём их в zustand)
  useEffect(() => {
    console.log('Hydration check:', {
      groupedCategoriesLength: groupedCategories?.length || 0,
      initialGroupedCategoriesLength: initialGroupedCategories?.length || 0,
      locale,
    });

    if (
      (groupedCategories ?? []).length === 0 &&
      (initialGroupedCategories ?? []).length > 0
    ) {
      console.log('Hydrating Zustand with initialGroupedCategories');
      setGroupedCategories(initialGroupedCategories, locale);
    }
  }, [
    groupedCategories,
    initialGroupedCategories,
    locale,
    setGroupedCategories,
  ]);

  // 3. Если кэш устарел — делаем запрос к API и обновляем zustand
  const shouldFetch = isCacheStale(locale);
  useQuery({
    queryKey: ['ingredients', 'grouped', locale],
    queryFn: async () => {
      const data = await ingredientsApi.getGroupedIngredients(locale);
      console.log('data', data);
      setGroupedCategories(data, locale);
      return data;
    },
    enabled: shouldFetch,
    staleTime: Infinity,
  });

  // Для отображения используем initialGroupedCategories если есть, иначе groupedCategories из zustand
  const categoriesData = useMemo(() => {
    // Если есть initialGroupedCategories - показываем их сразу
    if ((initialGroupedCategories ?? []).length > 0) {
      return initialGroupedCategories;
    }
    // Иначе используем данные из zustand
    return groupedCategories ?? [];
  }, [initialGroupedCategories, groupedCategories]);

  const selectedIngredientIds = useMemo(
    () => selectedIngredients.map((i) => i.id),
    [selectedIngredients]
  );

  const toggleIngredient = (ingredient: any) => {
    if (selectedIngredientIds.includes(ingredient.id)) {
      removeIngredient(ingredient.id);
    } else {
      addIngredient(ingredient);
    }
  };

  // Поиск ингредиентов (оставим как есть, если есть useIngredientsSearch)
  const { data: searchResults = [] } = useIngredientsSearch?.(searchQuery) || {
    data: [],
  };

  console.log('searchResults', searchResults);

  // Показываем скелетон только если нет данных вообще
  const shouldShowSkeleton = categoriesData.length === 0;

  console.log('Skeleton check:', {
    categoriesDataLength: categoriesData.length,
    initialGroupedCategoriesLength: initialGroupedCategories?.length || 0,
    shouldShowSkeleton,
  });

  if (shouldShowSkeleton) {
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
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="relative">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <Skeleton className="h-4 w-full mb-4" />

          {/* Скелетон категорий */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, ingredientIdx) => (
                    <Skeleton key={ingredientIdx} className="h-8 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

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
                  {searchResults.map((ingredient: any) => (
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
              {categoriesData.map((category: any, idx: number) => (
                <IngredientCategoryComponent
                  key={category.id}
                  category={category}
                  ingredients={category.ingredients}
                  selectedIngredientIds={selectedIngredientIds}
                  isLoading={false} // Always false here as we are using zustand data
                  onToggleIngredient={toggleIngredient}
                />
              ))}
            </div>
          </>
        )}

        {/* Категории без поиска */}
        {searchQuery.trim().length === 0 && (
          <div className="space-y-4">
            {categoriesData.map((category: any, idx: number) => (
              <IngredientCategoryComponent
                key={category.id}
                category={category}
                ingredients={category.ingredients}
                selectedIngredientIds={selectedIngredientIds}
                isLoading={false} // Always false here as we are using zustand data
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
              {selectedIngredients.map((ingredient: any) => (
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
