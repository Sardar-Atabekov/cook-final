'use client';

import React, { useMemo, useCallback } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Filter,
  X,
  Clock,
  Globe,
  Utensils,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useFiltersStore } from '@/stores/useFiltersStore';

interface RecipeFiltersProps {
  initialTags?: unknown[];
  locale: string;
}

export function RecipeFilters({
  initialTags = [],
  locale,
}: RecipeFiltersProps) {
  const t = useTranslations('ux.filters');
  const { tags, isLoading, error } = useTags(locale, initialTags);

  // Используем store напрямую
  const {
    mealType,
    country: kitchens,
    dietTags,
    sorting,
    byTime,
    setMealType,
    setCountry,
    setDietTags,
    setSorting,
    setByTime,
    clearFilters,
    hasActiveFilters,
  } = useFiltersStore();

  // Универсальный способ получить mealTypes, kitchens, diets
  let mealTypes: any[] = [];
  let countries: any[] = [];
  let diets: any[] = [];
  if (Array.isArray(tags)) {
    mealTypes = tags.filter((t: any) => t.type === 'meal_type');
    countries = tags.filter((t: any) => t.type === 'kitchen');
    diets = tags.filter((t: any) => t.type === 'diet');
  } else if (tags && typeof tags === 'object' && !Array.isArray(tags)) {
    mealTypes = (tags as any)?.mealTypes || [];
    countries = (tags as any)?.kitchens || [];
    diets = (tags as any)?.diets || [];
  } else {
    mealTypes = [];
    countries = [];
    diets = [];
  }

  // const sortingOptions = useMemo(
  //   () => [
  //     { label: t('allSorting'), value: 'all', icon: Sparkles },
  //     { label: t('popular'), value: 'popular', icon: TrendingUp },
  //     { label: t('random'), value: 'random', icon: Sparkles },
  //     { label: t('raitings'), value: 'raitings', icon: TrendingUp },
  //     { label: t('ingCount'), value: 'ingCount', icon: Utensils },
  //     { label: t('byTime'), value: 'byTime', icon: Clock },
  //   ],
  //   [t]
  // );

  // const byTimeOptions = useMemo(
  //   () => [
  //     { label: t('byTime'), value: 'all', icon: Clock },
  //     { label: t('byMinutes', { count: 15 }), value: '15', icon: Clock },
  //     { label: t('byMinutes', { count: 30 }), value: '30', icon: Clock },
  //     { label: t('byMinutes', { count: 45 }), value: '45', icon: Clock },
  //     { label: t('byHours', { count: 1 }), value: '60', icon: Clock },
  //     { label: t('byHours', { count: 2 }), value: '120', icon: Clock },
  //     { label: t('byHours', { count: 3 }), value: '180', icon: Clock },
  //   ],
  //   [t]
  // );

  // hasActiveFilters is now managed by the store
  // const hasActiveFilters =
  //   mealType !== 'all' ||
  //   kitchens !== 'all' ||
  //   dietTags !== 'all' ||
  //   sorting !== 'all' ||
  //   byTime !== 'all';

  if (isLoading && tags.length === 0) {
    return (
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mr-3">
            <Filter className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Фильтры</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
              <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-red-500 text-sm bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl border border-red-200/50 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center">
          <X className="h-5 w-5 mr-2" />
          Ошибка загрузки фильтров: {error.message}
        </div>
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
      {/* Filter Container */}
      <div className="backdrop-blur-sm rounded-2xl p-6">
        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Meal Type Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Utensils className="h-4 w-4 mr-2 text-blue-500" />
              {t('mealType')}
            </label>
            <Select
              value={mealType}
              onValueChange={(value) => setMealType(value)}
            >
              <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-2 hover:border-blue-300 transition-all duration-300 rounded-xl focus:ring-4 focus:ring-blue-500/10">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl">
                <SelectItem value="all">{t('allMealTypes')}</SelectItem>
                {mealTypes.length === 0 && (
                  <SelectItem value="none" disabled>
                    {t('noMealTypesAvailable')}
                  </SelectItem>
                )}
                {mealTypes.map((type: any) => (
                  <SelectItem
                    key={type.id}
                    value={type.id?.toString?.() ?? String(type.id)}
                  >
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
            whileHover={{ y: -2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-green-500" />
              {t('kitchen')}
            </label>
            <Select
              value={kitchens}
              onValueChange={(value) => setCountry(value)}
            >
              <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-2 hover:border-green-300 transition-all duration-300 rounded-xl focus:ring-4 focus:ring-green-500/10">
                <SelectValue placeholder="Выберите кухню" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl">
                <SelectItem value="all">{t('allCountries')}</SelectItem>
                {countries.length === 0 && (
                  <SelectItem value="none" disabled>
                    {t('noCountriesAvailable')}
                  </SelectItem>
                )}
                {countries.map((type: any) => (
                  <SelectItem
                    key={type.id}
                    value={type.id?.toString?.() ?? String(type.id)}
                  >
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
            whileHover={{ y: -2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
              {t('diet')}
            </label>
            <Select
              value={dietTags}
              onValueChange={(value) => setDietTags(value)}
            >
              <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-2 hover:border-purple-300 transition-all duration-300 rounded-xl focus:ring-4 focus:ring-purple-500/10">
                <SelectValue placeholder="Выберите диету" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl">
                <SelectItem value="all">{t('allDiets')}</SelectItem>
                {diets.length === 0 && (
                  <SelectItem value="none" disabled>
                    {t('noDietsAvailable')}
                  </SelectItem>
                )}
                {diets.map((type: any) => (
                  <SelectItem
                    key={type.id}
                    value={type.id?.toString?.() ?? String(type.id)}
                  >
                    {t(type.slug)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Time Filter */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-red-500" />
              {t('time')}
            </label>
            <Select value={byTime} onValueChange={(value) => setByTime(value)}>
              <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-2 hover:border-red-300 transition-all duration-300 rounded-xl focus:ring-4 focus:ring-red-500/10">
                <SelectValue placeholder="Время" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl">
                {byTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div> */}

          {/* Sorting Filter */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
              {t('sorting')}
            </label>
            <Select
              value={sorting}
              onValueChange={(value) => setSorting(value)}
            >
              <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-2 hover:border-orange-300 transition-all duration-300 rounded-xl focus:ring-4 focus:ring-orange-500/10">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-xl">
                {sortingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>  */}
        </div>

        {/* Clear Filters Button */}
        <AnimatePresence>
          {hasActiveFilters() && (
            <motion.div
              className="mt-4 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 border-red-300 rounded-xl transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                {t('clearAllFilters')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters() && (
          <motion.div
            className="mt-2 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.7 }}
          >
            {mealType !== 'all' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 rounded-full px-3 py-1"
                >
                  <Utensils className="h-3 w-3 mr-1" />
                  {mealTypes.find((t: any) => String(t.id) === mealType)
                    ?.slug || mealType}
                </Badge>
              </motion.div>
            )}
            {kitchens !== 'all' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 rounded-full px-3 py-1"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  {countries.find((t: any) => String(t.id) === kitchens)
                    ?.slug || kitchens}
                </Badge>
              </motion.div>
            )}
            {dietTags !== 'all' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 rounded-full px-3 py-1"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {diets.find((t: any) => String(t.id) === dietTags)?.slug ||
                    dietTags}
                </Badge>
              </motion.div>
            )}
            {/* {sorting !== 'all' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300 rounded-full px-3 py-1"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {sortingOptions.find((o) => o.value === sorting)?.label ||
                    sorting}
                </Badge>
              </motion.div>
            )}
            {byTime !== 'all' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 rounded-full px-3 py-1"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {byTimeOptions.find((o) => o.value === byTime)?.label ||
                    byTime}
                </Badge>
              </motion.div>
            )} */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
