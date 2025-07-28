'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IngredientSidebar } from '@/components/ingredient-sidebar';
import { SearchBar } from '@/components/search-bar';
import { RecipeFilters } from '@/components/recipe-filters';
import { SearchPageClient } from '@/components/search-page-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, Search, Filter } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { useFiltersStore } from '@/stores/useFiltersStore';
import { useTranslations } from 'next-intl';
import { RecipeCardSkeleton } from '@/components/loading-spinner';

export default function ClientRecipePageLayout({
  searchQuery,
  mealType,
  kitchens,
  dietTags,
  sorting,
  byTime,
  recipes,
  total,
  isLoading,
  error,
  initialGroupedCategories,
  initialTags,
  locale,
  page,
}: any) {
  const t = useTranslations('search');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const { selectedIngredients } = useIngredientStore();
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

  // Получаем текущую страницу из URL (только для пагинации)
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Используем хук для получения рецептов только если параметры изменились
  const {
    recipes: fetchedRecipes,
    total: fetchedTotal,
    isLoading: isFetching,
    error: fetchError,
  } = useRecipes({
    ingredientIds: selectedIngredients.map((i) => i.id),
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

  // Универсальная логика отображения
  const isClientLoaded =
    !isFetching && (fetchedTotal !== undefined || fetchError);
  const isExactMatch = isClientLoaded && fetchedTotal > 0;
  const isSimilar = isClientLoaded && fetchedTotal === 0 && recipes.length > 0;
  const isNothing =
    isClientLoaded && fetchedTotal === 0 && recipes.length === 0;

  const displayRecipes = isExactMatch
    ? fetchedRecipes
    : isSimilar
      ? recipes
      : [];

  const displayTotal = isClientLoaded ? fetchedTotal : total;

  const displayIsLoading = isFetching || isLoading;
  const displayError = fetchError || error;

  // Отладочная информация
  console.log('=== DEBUG INFO ===');
  console.log('isClientLoaded:', isClientLoaded);
  console.log('isExactMatch:', isExactMatch);
  console.log('isSimilar:', isSimilar);
  console.log('isNothing:', isNothing);
  console.log('displayRecipes', displayRecipes.length);
  console.log('displayTotal', displayTotal);
  console.log('displayIsLoading', displayIsLoading);
  console.log('displayError', displayError);
  console.log('fetchedRecipes', fetchedRecipes.length);
  console.log('fetchedTotal', fetchedTotal);
  console.log('recipes (server)', recipes.length);
  console.log('total (server)', total);
  console.log('isLoading from useRecipes:', isLoading);
  console.log('isFetching from useRecipes:', isFetching);
  console.log('currentMealType:', currentMealType);
  console.log('currentKitchens:', currentKitchens);
  console.log('currentDietTags:', currentDietTags);
  console.log('currentSorting:', currentSorting);
  console.log('currentByTime:', currentByTime);
  console.log('selectedIngredients:', selectedIngredients);
  console.log('currentSearchQuery:', currentSearchQuery);
  console.log('hasActiveFilters:', hasActiveFilters());
  console.log('displayTotal logic:', {
    fetchedTotal,
    total,
    result: displayTotal,
  });
  console.log('displayRecipes logic:', {
    fetchedRecipesLength: fetchedRecipes.length,
    fetchedTotal,
    recipesLength: recipes.length,
    result: displayRecipes.length,
  });
  console.log('==================');

  // Аккумулируем рецепты при увеличении страницы
  useEffect(() => {
    if (currentPage > 1) {
      // setAccumulatedRecipes((prev: any[]) => { // This line was removed as per the new_code
      //   const ids = new Set(prev.map((r) => r.id));
      //   const newOnes = displayRecipes.filter((r: any) => !ids.has(r.id));
      //   return [...prev, ...newOnes];
      // });
    } else {
      // setAccumulatedRecipes(displayRecipes); // This line was removed as per the new_code
    }
  }, [displayRecipes, currentPage]);

  // Кнопка "Показать ещё"
  const handleShowMore = async () => {
    setIsLoadingMore(true);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(currentPage + 1));
    router.replace(`?${newParams.toString()}`, { scroll: false });

    setTimeout(() => {
      setIsLoadingMore(false);
    }, 500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
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
          <motion.div
            className="mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="text-center mb-8" variants={itemVariants}>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('titleDescription')}
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              className="w-full max-w-4xl mx-auto mb-6"
              variants={itemVariants}
            >
              <SearchBar
                placeholder={t('searchPlaceholder')}
                className="w-full"
                onSearch={() => {}}
              />
            </motion.div>

            {/* Filters Toggle */}
            <motion.div
              className="w-full max-w-4xl mx-auto"
              variants={itemVariants}
            >
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
                <AnimatePresence>
                  {isFiltersExpanded && (
                    <motion.div
                      className="p-6"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RecipeFilters
                        initialTags={initialTags}
                        locale={locale}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {displayError ? (
              <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    {t('errorLoading')}
                  </h3>
                  <p className="text-red-600">{t('errorLoadingDescription')}</p>
                </div>
              </div>
            ) : displayIsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <RecipeCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {/* Отладочная информация для SearchPageClient */}
                {console.log('SearchPageClient props:', {
                  initialRecipes: displayRecipes.length,
                  initialTotal: displayTotal,
                  shouldShowNoRecipes: isNothing,
                  shouldShowSimilar: isSimilar,
                })}
                <SearchPageClient
                  initialRecipes={displayRecipes}
                  initialTotal={displayTotal}
                  locale={locale}
                />
                {/* Load More Button */}
                <AnimatePresence>
                  {displayRecipes.length < displayTotal && (
                    <motion.div
                      className="text-center mt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        onClick={handleShowMore}
                        disabled={displayIsLoading || isLoadingMore}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        size="lg"
                      >
                        {isLoadingMore ? (
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
                      <motion.p
                        className="text-sm text-gray-500 mt-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {t('showingCount', {
                          current: displayRecipes.length,
                          total: displayTotal,
                        })}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading Progress Bar */}
                <AnimatePresence>
                  {isLoadingMore && (
                    <motion.div
                      className="w-full max-w-4xl mx-auto mt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 4 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1 rounded-full animate-pulse"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
