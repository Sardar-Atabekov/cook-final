'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
    groupedCategories,
    setGroupedCategories,
    isCacheStale,
    selectedIngredients,
    selectedIds,
    addIngredient,
    removeIngredient,
    clearIngredients,
    clearIngredientsOnLanguageChange,
  } = useIngredientStore();

  // 1. Если в zustand есть категории для текущего языка — показываем их
  // 2. Если нет — используем initialGroupedCategories (и кладём их в zustand)
  useEffect(() => {
    if (
      (groupedCategories ?? []).length === 0 &&
      (initialGroupedCategories ?? []).length > 0
    ) {
      setGroupedCategories(initialGroupedCategories, locale);
    }
  }, [
    groupedCategories,
    initialGroupedCategories,
    locale,
    setGroupedCategories,
  ]);

  // Очищаем выбранные ингредиенты при смене языка
  useEffect(() => {
    clearIngredientsOnLanguageChange(locale);
  }, [locale, clearIngredientsOnLanguageChange]);

  // 3. Если кэш устарел — делаем запрос к API и обновляем zustand
  const shouldFetch = isCacheStale(locale);

  // Получаем текущий язык из Zustand
  const currentLang = useIngredientStore.getState().language;

  // Загружаем данные если нет данных для текущего языка
  const hasDataForCurrentLang =
    (initialGroupedCategories ?? []).length > 0 ||
    ((groupedCategories ?? []).length > 0 && currentLang === locale);

  // Не делаем клиентский запрос если данные уже загружены через SSR/SSG
  const shouldFetchForLanguage = !hasDataForCurrentLang && !shouldFetch;

  useQuery({
    queryKey: ['ingredients', 'grouped', locale],
    queryFn: async () => {
      const data = await ingredientsApi.getGroupedIngredients(locale);
      setGroupedCategories(data, locale);
      return data;
    },
    enabled: shouldFetch || shouldFetchForLanguage,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
  });

  // Для отображения используем initialGroupedCategories если есть, иначе groupedCategories из zustand
  const categoriesData = useMemo(() => {
    // Если есть initialGroupedCategories - показываем их сразу
    if ((initialGroupedCategories ?? []).length > 0) {
      return initialGroupedCategories;
    }
    // Иначе используем данные из zustand только если язык совпадает
    const currentLang = useIngredientStore.getState().language;
    if (currentLang === locale) {
      return groupedCategories ?? [];
    }
    return [];
  }, [initialGroupedCategories, groupedCategories, locale]);

  // Исправленный toggleIngredient: используем addIngredient/removeIngredient
  const toggleIngredient = useCallback(
    (ingredient: any) => {
      console.log('🔧 Toggle ingredient:', {
        ingredient,
        currentSelectedIds: selectedIds,
        currentSelectedIngredients: selectedIngredients,
        locale,
      });

      if (selectedIds.includes(ingredient.id)) {
        console.log('🔧 Removing ingredient:', ingredient);
        removeIngredient(ingredient.id);
      } else {
        console.log('🔧 Adding ingredient:', ingredient);
        addIngredient(ingredient);
      }
    },
    [selectedIds, selectedIngredients, addIngredient, removeIngredient, locale]
  );

  // Очистить все ингредиенты: используем clearIngredients
  const clearAllIngredients = useCallback(() => {
    console.log('🔧 Clearing all ingredients');
    clearIngredients();
  }, [clearIngredients]);

  // Поиск ингредиентов (оставим как есть, если есть useIngredientsSearch)
  const { data: searchResults = [] } = useIngredientsSearch?.(searchQuery) || {
    data: [],
  };

  // Показываем скелетон только если нет данных вообще И идет загрузка для нового языка
  const shouldShowSkeleton =
    categoriesData.length === 0 && shouldFetchForLanguage;

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
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div> */}
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
                        selectedIds.includes(ingredient.id) &&
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
                  selectedIngredientIds={selectedIds}
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
                selectedIngredientIds={selectedIds}
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
                    onClick={() => toggleIngredient(ingredient)}
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
            onClick={clearAllIngredients}
          >
            Clear All Ingredients
          </Button>
        )}
      </div>
    </aside>
  );
}
