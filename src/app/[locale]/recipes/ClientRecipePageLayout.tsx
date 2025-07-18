'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IngredientSidebar } from '@/components/ingredient-sidebar';
import { SearchBar } from '@/components/search-bar';
import { RecipeFilters } from '@/components/recipe-filters';
import { SearchPageClient } from '@/components/search-page-client';

export default function ClientRecipePageLayout({
  searchQuery,
  mealType,
  country,
  dietTags,
  recipes,
  total,
  isLoading,
  error,
  initialGroupedCategories,
  initialTags,
  locale,
  page,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accumulatedRecipes, setAccumulatedRecipes] = useState(recipes);
  const [currentPage, setCurrentPage] = useState(page);

  // Аккумулируем рецепты при увеличении страницы
  useEffect(() => {
    if (page > 1) {
      setAccumulatedRecipes((prev: any[]) => {
        // Не дублируем рецепты
        const ids = new Set(prev.map((r) => r.id));
        const newOnes = recipes.filter((r: any) => !ids.has(r.id));
        return [...prev, ...newOnes];
      });
    } else {
      setAccumulatedRecipes(recipes);
    }
    setCurrentPage(page);
  }, [recipes, page]);

  // Обработка поиска
  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (query) newParams.set('q', query);
    else newParams.delete('q');
    newParams.delete('page'); // сбрасываем страницу при новом поиске
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  // Обработка фильтров
  const handleFiltersChange = (newFilters: any) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('mealType', newFilters.mealType);
    newParams.set('country', newFilters.country);
    newParams.set('dietTags', newFilters.dietTags);
    newParams.set('sorting', newFilters.sorting);
    newParams.set('byTime', newFilters.byTime);
    newParams.delete('page'); // сбрасываем страницу при новых фильтрах
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  // Кнопка "Показать ещё"
  const handleShowMore = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(currentPage + 1));
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <IngredientSidebar
          className="hidden md:block sticky top-0 h-screen"
          initialGroupedCategories={initialGroupedCategories}
        />
        <main className="flex-1 h-full overflow-y-auto p-6 mb-10">
          {/* Адаптивный поиск и фильтры */}
          <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8">
            <div className="flex-1 w-full">
              <SearchBar
                placeholder="Поиск рецептов..."
                className="w-full text-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />
            </div>
            <div className="flex-1 w-full">
              <RecipeFilters initialTags={initialTags} locale={locale} />
            </div>
          </div>
          <SearchPageClient
            initialRecipes={recipes}
            initialTotal={total}
            locale={locale}
          />
          {/* Кнопка "Показать ещё" */}
          {accumulatedRecipes.length < total && (
            <div className="text-center mt-8">
              <button
                onClick={handleShowMore}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow transition-colors duration-200"
                disabled={isLoading}
              >
                Показать ещё
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Показано {accumulatedRecipes.length} из {total}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
