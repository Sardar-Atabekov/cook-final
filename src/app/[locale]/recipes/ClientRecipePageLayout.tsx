'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IngredientSidebar } from '@/components/ingredient-sidebar';
import { SearchBar } from '@/components/search-bar';
import { RecipeFilters } from '@/components/recipe-filters';
import { SearchPageClient } from '@/components/search-page-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from 'lucide-react';

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
  const handleShowMore = async () => {
    setIsLoadingMore(true);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(currentPage + 1));
    router.replace(`?${newParams.toString()}`, { scroll: false });

    // Имитация загрузки для лучшего UX
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
        ease: 'easeOut',
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
          <motion.div
            className="flex flex-col items-center gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Поиск по центру, 80% ширины, фильтры снизу, современный UX */}
            <motion.div
              className="w-full flex justify-center"
              variants={itemVariants}
            >
              <div className="w-full max-w-4xl flex justify-center">
                <div className="w-[90%] min-w-[250px] rounded-2xl p-1 flex items-center bg-white shadow-lg border border-gray-200">
                  <SearchBar
                    placeholder="Поиск рецептов..."
                    className="w-full text-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 border-0 shadow-none"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="w-full flex justify-center"
              variants={itemVariants}
            >
              <div className="w-full max-w-4xl flex justify-center">
                <div className="w-[90%] min-w-[250px] rounded-xl p-4 flex flex-col items-center gap-4 bg-white shadow-lg border border-gray-200">
                  <RecipeFilters initialTags={initialTags} locale={locale} />
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SearchPageClient
              initialRecipes={recipes}
              initialTotal={total}
              locale={locale}
            />
          </motion.div>

          {/* Кнопка "Показать ещё" */}
          <AnimatePresence>
            {accumulatedRecipes.length < total && (
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={handleShowMore}
                  disabled={isLoading || isLoadingMore}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      Показать ещё
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
                  Показано {accumulatedRecipes.length} из {total} рецептов
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Прогресс-бар загрузки */}
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
        </main>
      </div>
    </div>
  );
}
