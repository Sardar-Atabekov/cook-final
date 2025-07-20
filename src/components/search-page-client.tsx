'use client';

import { useTranslations } from 'next-intl';
import { SearchRecipeCard } from './search-recipe-card';
import { RecipeCardSkeleton } from './loading-spinner';
import {
  Search as SearchIcon,
  Filter,
  ChefHat,
  Sparkles,
  TrendingUp,
  Clock,
  Globe,
  Utensils,
} from 'lucide-react';
import type { Recipe } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface SearchPageClientProps {
  initialRecipes: Recipe[];
  initialTotal: number;
  locale: string;
}

export function SearchPageClient({
  initialRecipes,
  initialTotal,
  locale,
}: SearchPageClientProps) {
  const t = useTranslations('search');
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  // Получаем параметры поиска для отображения
  const searchQuery = searchParams.get('q') || '';
  const mealType = searchParams.get('mealType') || 'all';
  const country = searchParams.get('country') || 'all';
  const dietTags = searchParams.get('dietTags') || 'all';
  const sorting = searchParams.get('sorting') || 'all';
  const byTime = searchParams.get('byTime') || 'all';

  const hasActiveFilters =
    mealType !== 'all' ||
    country !== 'all' ||
    dietTags !== 'all' ||
    sorting !== 'all' ||
    byTime !== 'all';

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  if (initialRecipes.length === 0) {
    return (
      <motion.div
        className="text-center py-20 flex flex-col items-center justify-center min-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <SearchIcon className="w-16 h-16 text-gray-400" />
        </motion.div>

        <motion.h3
          className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {searchQuery ? 'Рецепты не найдены' : 'Начните поиск рецептов'}
        </motion.h3>

        <motion.p
          className="text-gray-600 mb-6 max-w-lg mx-auto text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {searchQuery
            ? `По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить параметры поиска или использовать другие ключевые слова.`
            : 'Используйте поиск и фильтры, чтобы найти идеальный рецепт для вашего настроения и доступных ингредиентов.'}
        </motion.p>

        {hasActiveFilters && (
          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-gray-600 font-medium">
              💡 Попробуйте сбросить фильтры или изменить параметры поиска для
              получения большего количества результатов
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex-1"
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
    >
      {/* Results Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {searchQuery
                  ? `Результаты поиска: "${searchQuery}"`
                  : 'Все рецепты'}
              </motion.h1>

              <div className="flex items-center space-x-6 text-gray-600">
                <motion.span
                  className="flex items-center bg-blue-50 px-3 py-1 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <ChefHat className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-medium">
                    Найдено {initialTotal} рецептов
                  </span>
                </motion.span>

                {hasActiveFilters && (
                  <motion.span
                    className="flex items-center bg-purple-50 px-3 py-1 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Filter className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="font-medium">Фильтры применены</span>
                  </motion.span>
                )}
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {mealType !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 rounded-full px-3 py-1"
                  >
                    <Utensils className="h-3 w-3 mr-1" />
                    {mealType}
                  </Badge>
                )}
                {country !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 rounded-full px-3 py-1"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    {country}
                  </Badge>
                )}
                {dietTags !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 rounded-full px-3 py-1"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {dietTags}
                  </Badge>
                )}
                {sorting !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300 rounded-full px-3 py-1"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {sorting}
                  </Badge>
                )}
                {byTime !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 rounded-full px-3 py-1"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {byTime}
                  </Badge>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Results Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
        variants={itemVariants}
      >
        <AnimatePresence>
          {initialRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              whileHover={{ y: -5 }}
            >
              <SearchRecipeCard recipe={recipe} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No More Results */}
      {initialRecipes.length > 0 && initialRecipes.length >= initialTotal && (
        <motion.div
          className="text-center py-12 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 max-w-lg mx-auto border border-gray-200/50 shadow-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="w-8 h-8 text-blue-600" />
            </motion.div>

            <p className="text-gray-700 font-medium mb-2">
              Показаны все найденные рецепты ({initialTotal})
            </p>

            {hasActiveFilters && (
              <p className="text-sm text-gray-500">
                💡 Попробуйте изменить фильтры для получения большего количества
                результатов
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
