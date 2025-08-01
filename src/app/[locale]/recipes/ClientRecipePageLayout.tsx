'use client';
import React, { useState, useEffect } from 'react';
import { IngredientSidebar } from '@/components/ingredient-sidebar';
import { SearchBar } from '@/components/search-bar';
import { RecipeFilters } from '@/components/recipe-filters';
import { SearchPageClient } from '@/components/search-page-client';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, Filter } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { usePaginationStore } from '@/stores/usePaginationStore';
import { useTranslations } from 'next-intl';
import { RecipeCardSkeleton } from '@/components/loading-spinner';

export default function ClientRecipePageLayout({
  searchQuery,
  mealType,
  kitchens,
  dietTags,
  sorting,
  byTime,
  recipes: initialRecipes,
  total: initialTotal,
  initialGroupedCategories,
  initialTags,
  locale,
}: any) {
  const t = useTranslations('search');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [previousRecipesCount, setPreviousRecipesCount] = useState(0);
  const { selectedIds } = useIngredientStore();
  const {
    mealType: currentMealType,
    country: currentKitchens,
    dietTags: currentDietTags,
    sorting: currentSorting,
    byTime: currentByTime,
    searchText: currentSearchQuery,
    setFilters,
    hasActiveFilters,
  } = useFiltersStore();
  const { currentPage, setCurrentPage, resetPage } = usePaginationStore();

  // Синхронизируем начальные параметры с состоянием фильтров
  useEffect(() => {
    setFilters({
      mealType: mealType === 'all' ? 'all' : mealType,
      country: kitchens === 'all' ? 'all' : kitchens,
      dietTags: dietTags === 'all' ? 'all' : dietTags,
      sorting: sorting === 'all' ? 'all' : sorting,
      byTime: byTime === 'all' ? 'all' : byTime,
      searchText: searchQuery || '',
    });
  }, [mealType, kitchens, dietTags, sorting, byTime, searchQuery, setFilters]);

  // Сбрасываем страницу на 1 при изменении параметров поиска
  useEffect(() => {
    console.log('🔄 Reset page effect:', {
      currentPage,
      selectedIds,
      currentSearchQuery,
      currentMealType,
      currentKitchens,
      currentDietTags,
      currentSorting,
      currentByTime,
    });

    if (currentPage > 1) {
      console.log('🔄 Resetting page from', currentPage, 'to 1');
      resetPage();
    }
  }, [
    selectedIds,
    currentSearchQuery,
    currentMealType,
    currentKitchens,
    currentDietTags,
    currentSorting,
    currentByTime,
    resetPage,
  ]);

  // Используем хук для получения рецептов
  const {
    recipes: fetchedRecipes,
    total: fetchedTotal,
    isLoading: isFetching,
    hasMore,
    error: fetchError,
  } = useRecipes({
    ingredientIds: selectedIds,
    searchText: currentSearchQuery,
    lang: locale,
    limit: 20,
    mealType: currentMealType,
    kitchens: currentKitchens,
    dietTags: currentDietTags,
    sorting: currentSorting,
    byTime: currentByTime,
    page: currentPage,
  });

  console.log('selectedIngredients', selectedIds);
  console.log('📊 ClientRecipePageLayout state:', {
    fetchedRecipesLength: fetchedRecipes.length,
    fetchedTotal,
    currentPage,
    hasMore,
    isLoadingMore,
    isFetching,
  });

  // Логика отображения данных - используем данные из хука или начальные данные
  // Показываем начальные данные только если фильтры соответствуют начальным параметрам
  const filtersMatchInitial =
    currentMealType === (mealType === 'all' ? 'all' : mealType) &&
    currentKitchens === (kitchens === 'all' ? 'all' : kitchens) &&
    currentDietTags === (dietTags === 'all' ? 'all' : dietTags) &&
    currentSorting === (sorting === 'all' ? 'all' : sorting) &&
    currentByTime === (byTime === 'all' ? 'all' : byTime) &&
    currentSearchQuery === (searchQuery || '') &&
    selectedIds.length === 0;

  const displayRecipes =
    fetchedRecipes.length > 0
      ? fetchedRecipes
      : filtersMatchInitial
        ? initialRecipes || []
        : [];
  // Сохраняем предыдущее значение total во время пагинации
  const [previousTotal, setPreviousTotal] = useState(initialTotal || 0);

  // Обновляем previousTotal когда получаем новые данные
  useEffect(() => {
    if (fetchedTotal !== undefined && fetchedTotal > 0) {
      setPreviousTotal(fetchedTotal);
    }
  }, [fetchedTotal]);

  // Инициализируем previousTotal с начальными данными
  useEffect(() => {
    if (initialTotal > 0) {
      setPreviousTotal(initialTotal);
    }
  }, [initialTotal]);

  const displayTotal =
    fetchedTotal !== undefined && fetchedTotal > 0
      ? fetchedTotal
      : filtersMatchInitial
        ? initialTotal || 0
        : previousTotal || 0;

  const displayIsLoading = isFetching;
  const displayError = fetchError;

  // Проверяем, загружаются ли данные для пагинации или для новых фильтров
  const isNewDataLoading = displayIsLoading && !isLoadingMore;

  // Показываем скелетон при загрузке новых данных (не пагинация) и когда нет данных для отображения
  // Или когда фильтры изменились и идет загрузка
  const shouldShowSkeleton =
    (isNewDataLoading && displayRecipes.length === 0) ||
    (isNewDataLoading && !filtersMatchInitial && !isLoadingMore);

  // Сбрасываем состояние загрузки кнопки "Показать еще" когда данные загрузились
  useEffect(() => {
    console.log('🔄 Loading state effect:', {
      isLoadingMore,
      isFetching,
      fetchedRecipesLength: fetchedRecipes.length,
      previousRecipesCount,
    });

    if (
      isLoadingMore &&
      !isFetching &&
      fetchedRecipes.length > previousRecipesCount
    ) {
      console.log('✅ Loading completed, resetting loading state');
      setIsLoadingMore(false);
      setPreviousRecipesCount(fetchedRecipes.length);
    }
  }, [isLoadingMore, isFetching, fetchedRecipes.length, previousRecipesCount]);

  // Сбрасываем isLoadingMore при изменении фильтров
  useEffect(() => {
    if (isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [
    currentSearchQuery,
    currentMealType,
    currentKitchens,
    currentDietTags,
    currentSorting,
    currentByTime,
    selectedIds,
  ]);

  // Дополнительная логика сброса isLoadingMore при ошибке или завершении загрузки
  useEffect(() => {
    if (isLoadingMore && !isFetching) {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isFetching]);

  // Кнопка "Показать ещё"
  const handleShowMore = async () => {
    console.log('🔄 handleShowMore clicked:', {
      currentPage,
      newPage: currentPage + 1,
      currentRecipesCount: fetchedRecipes.length,
    });

    setIsLoadingMore(true);
    setPreviousRecipesCount(fetchedRecipes.length);
    setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        <IngredientSidebar
          className="block sticky top-0 h-screen"
          initialGroupedCategories={initialGroupedCategories}
        />
        <main className="flex-1 h-full overflow-y-auto p-6 mb-10">
          {/* Header Section */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('titleDescription')}
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-4xl mx-auto mb-6">
              <SearchBar
                placeholder={t('searchPlaceholder')}
                className="w-full"
              />
            </div>

            {/* Filters Toggle */}
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Filter Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Filter className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t('filters')}
                      </h3>
                      {hasActiveFilters() && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {t('activeFilters')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                      className="flex items-center space-x-2"
                    >
                      <span>{isFiltersExpanded ? t('hide') : t('show')}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isFiltersExpanded ? 'rotate-180' : ''}`}
                      />
                    </Button>
                  </div>
                </div>

                {/* Filter Content */}
                {isFiltersExpanded && (
                  <div className="p-6">
                    <RecipeFilters initialTags={initialTags} locale={locale} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div>
            {displayError ? (
              <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    {t('errorLoading')}
                  </h3>
                  <p className="text-red-600">{t('errorLoadingDescription')}</p>
                </div>
              </div>
            ) : shouldShowSkeleton ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <RecipeCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <SearchPageClient
                initialRecipes={displayRecipes}
                initialTotal={displayTotal}
              />
            )}

            {/* Load More Button - показываем если есть данные и либо есть еще данные, либо идет загрузка */}
            {!shouldShowSkeleton &&
              displayRecipes.length > 0 &&
              (hasMore || isLoadingMore || isFetching) && (
                <div className="text-center mt-8">
                  <Button
                    onClick={handleShowMore}
                    disabled={isLoadingMore || isFetching}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    size="lg"
                  >
                    {isLoadingMore || isFetching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('loadingRecipes')}
                      </>
                    ) : (
                      <>
                        {t('showMore')}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 mt-3">
                    {t('showingCount', {
                      current: displayRecipes.length,
                      total: displayTotal,
                    })}
                  </p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
