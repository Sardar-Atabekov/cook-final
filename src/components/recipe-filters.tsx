'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useMemo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTags } from '@/hooks/useTags';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecipeFiltersProps {
  initialTags?: any[];
  locale: string;
}

export function RecipeFilters({
  initialTags = [],
  locale,
}: RecipeFiltersProps) {
  const t = useTranslations('ux.filters');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tags, isLoading, error } = useTags(locale, initialTags);
  const [isExpanded, setIsExpanded] = useState(false);

  const mealType = searchParams.get('mealType') || 'all';
  const country = searchParams.get('country') || 'all';
  const dietTags = searchParams.get('dietTags') || 'all';
  const sorting = searchParams.get('sorting') || 'all';
  const byTime = searchParams.get('byTime') || 'all';

  const mealTypes = useMemo(
    () =>
      Array.isArray(tags) ? tags.filter((t) => t.type === 'meal_type') : [],
    [tags]
  );
  const countries = useMemo(
    () => (Array.isArray(tags) ? tags.filter((t) => t.type === 'kitchen') : []),
    [tags]
  );
  const diets = useMemo(
    () => (Array.isArray(tags) ? tags.filter((t) => t.type === 'diet') : []),
    [tags]
  );

  const sortingOptions = useMemo(
    () => [
      { label: t('allSorting'), value: 'all' },
      { label: t('popular'), value: 'popular' },
      { label: t('random'), value: 'random' },
      { label: t('raitings'), value: 'raitings' },
      { label: t('ingCount'), value: 'ingCount' },
      { label: t('byTime'), value: 'byTime' },
    ],
    [t]
  );

  const byTimeOptions = useMemo(
    () => [
      { label: t('byTime'), value: 'all' },
      { label: t('byMinutes', { count: 15 }), value: '15' },
      { label: t('byMinutes', { count: 30 }), value: '30' },
      { label: t('byMinutes', { count: 45 }), value: '45' },
      { label: t('byHours', { count: 1 }), value: '60' },
      { label: t('byHours', { count: 2 }), value: '120' },
      { label: t('byHours', { count: 3 }), value: '180' },
    ],
    [t]
  );

  const handleChange = useCallback(
    (newFilters: {
      mealType?: string;
      country?: string;
      dietTags?: string;
      sorting?: string;
      byTime?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newFilters.mealType !== undefined)
        params.set('mealType', newFilters.mealType);
      if (newFilters.country !== undefined)
        params.set('country', newFilters.country);
      if (newFilters.dietTags !== undefined)
        params.set('dietTags', newFilters.dietTags);
      if (newFilters.sorting !== undefined)
        params.set('sorting', newFilters.sorting);
      if (newFilters.byTime !== undefined)
        params.set('byTime', newFilters.byTime);
      params.delete('page');
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mealType', 'all');
    params.set('country', 'all');
    params.set('dietTags', 'all');
    params.set('sorting', 'all');
    params.set('byTime', 'all');
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const hasActiveFilters =
    mealType !== 'all' ||
    country !== 'all' ||
    dietTags !== 'all' ||
    sorting !== 'all' ||
    byTime !== 'all';

  if (isLoading && tags.length === 0) {
    return (
      <motion.div
        className="flex flex-wrap items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="animate-pulse"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Ошибка загрузки фильтров: {error.message}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
        >
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Фильтры</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Активны
            </Badge>
          )}
        </motion.div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Очистить
              </Button>
            </motion.div>
          )}

          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </motion.button>
        </div>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Meal Type Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип блюда
              </label>
              <Select
                value={mealType}
                onValueChange={(value) => handleChange({ mealType: value })}
              >
                <SelectTrigger className="w-full bg-white border-2 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allMealTypes')}</SelectItem>
                  {mealTypes.length === 0 && (
                    <SelectItem value="" disabled>
                      {t('noMealTypesAvailable')}
                    </SelectItem>
                  )}
                  {mealTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {t(type.slug)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Country Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Кухня
              </label>
              <Select
                value={country}
                onValueChange={(value) => handleChange({ country: value })}
              >
                <SelectTrigger className="w-full bg-white border-2 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="Выберите кухню" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCountries')}</SelectItem>
                  {countries.length === 0 && (
                    <SelectItem value="" disabled>
                      {t('noCountriesAvailable')}
                    </SelectItem>
                  )}
                  {countries.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {t(type.slug)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Diet Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Диета
              </label>
              <Select
                value={dietTags}
                onValueChange={(value) => handleChange({ dietTags: value })}
              >
                <SelectTrigger className="w-full bg-white border-2 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="Выберите диету" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allDiets')}</SelectItem>
                  {diets.length === 0 && (
                    <SelectItem value="" disabled>
                      {t('noDietsAvailable')}
                    </SelectItem>
                  )}
                  {diets.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {t(type.slug)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Sorting Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сортировка
              </label>
              <Select
                value={sorting}
                onValueChange={(value) => handleChange({ sorting: value })}
              >
                <SelectTrigger className="w-full bg-white border-2 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  {sortingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Time Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время приготовления
              </label>
              <Select
                value={byTime}
                onValueChange={(value) => handleChange({ byTime: value })}
              >
                <SelectTrigger className="w-full bg-white border-2 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="Время" />
                </SelectTrigger>
                <SelectContent>
                  {byTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            className="mt-4 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {mealType !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Тип:{' '}
                {mealTypes.find((t) => t.id.toString() === mealType)?.slug ||
                  mealType}
              </Badge>
            )}
            {country !== 'all' && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Кухня:{' '}
                {countries.find((t) => t.id.toString() === country)?.slug ||
                  country}
              </Badge>
            )}
            {dietTags !== 'all' && (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800"
              >
                Диета:{' '}
                {diets.find((t) => t.id.toString() === dietTags)?.slug ||
                  dietTags}
              </Badge>
            )}
            {sorting !== 'all' && (
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800"
              >
                Сортировка:{' '}
                {sortingOptions.find((o) => o.value === sorting)?.label ||
                  sorting}
              </Badge>
            )}
            {byTime !== 'all' && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Время:{' '}
                {byTimeOptions.find((o) => o.value === byTime)?.label || byTime}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
