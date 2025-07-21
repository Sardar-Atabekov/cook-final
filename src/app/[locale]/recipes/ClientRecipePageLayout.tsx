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
import { useTranslations } from 'next-intl';

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

  // Получаем текущие параметры из URL
  const currentSearchQuery = searchParams.get('q') || '';
  const currentMealType = searchParams.get('mealType') || 'all';
  const currentKitchens = searchParams.get('country') || 'all';
  const currentDietTags = searchParams.get('dietTags') || 'all';
  const currentSorting = searchParams.get('sorting') || 'all';
  const currentByTime = searchParams.get('byTime') || 'all';
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
    mealType: currentMealType === 'all' ? 'all' : currentMealType,
    kitchens: currentKitchens === 'all' ? 'all' : currentKitchens,
    dietTags: currentDietTags === 'all' ? 'all' : currentDietTags,
    sorting: currentSorting === 'all' ? 'all' : currentSorting,
    byTime: currentByTime === 'all' ? 'all' : currentByTime,
    page: currentPage,
  });

  // Используем данные из хука, если они есть, иначе используем начальные данные
  const displayRecipes = fetchedRecipes.length > 0 ? fetchedRecipes : recipes;
  const displayTotal = fetchedTotal || total;
  const displayIsLoading = isFetching || isLoading;
  const displayError = fetchError || error;

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

  // Обработка поиска
  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (query) newParams.set('q', query);
    else newParams.delete('q');
    newParams.delete('page');
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  // Обработка фильтров
  const handleFiltersChange = (newFilters: any) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (newFilters.mealType !== undefined)
      newParams.set('mealType', newFilters.mealType);
    if (newFilters.country !== undefined)
      newParams.set('country', newFilters.country);
    if (newFilters.dietTags !== undefined)
      newParams.set('dietTags', newFilters.dietTags);
    if (newFilters.sorting !== undefined)
      newParams.set('sorting', newFilters.sorting);
    if (newFilters.byTime !== undefined)
      newParams.set('byTime', newFilters.byTime);
    newParams.delete('page');
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

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
                onSearch={handleSearch}
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
                      {(currentMealType !== 'all' ||
                        currentKitchens !== 'all' ||
                        currentDietTags !== 'all' ||
                        currentSorting !== 'all' ||
                        currentByTime !== 'all') && (
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
            ) : displayIsLoading && displayRecipes.length === 0 ? (
              <div className="text-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">{t('loadingRecipes')}</p>
              </div>
            ) : (
              <>
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
