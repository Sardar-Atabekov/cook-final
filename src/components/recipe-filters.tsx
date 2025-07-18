'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
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

  const sortingOptions = [
    { label: t('allSorting'), value: 'all' },
    { label: t('popular'), value: 'popular' },
    { label: t('random'), value: 'random' },
    { label: t('raitings'), value: 'raitings' },
    { label: t('ingCount'), value: 'ingCount' },
    { label: t('byTime'), value: 'byTime' },
  ];

  const byTimeOptions = [
    { label: t('byTime'), value: 'all' },
    { label: t('byMinutes', { count: 15 }), value: '15' },
    { label: t('byMinutes', { count: 30 }), value: '30' },
    { label: t('byMinutes', { count: 45 }), value: '45' },
    { label: t('byHours', { count: 1 }), value: '60' },
    { label: t('byHours', { count: 2 }), value: '120' },
    { label: t('byHours', { count: 3 }), value: '180' },
  ];

  const handleChange = (newFilters: {
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
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mealType', 'all');
    params.set('country', 'all');
    params.set('dietTags', 'all');
    params.set('sorting', 'all');
    params.set('byTime', 'all');
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading && tags.length === 0) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse">
          <div className="h-9 bg-gray-200 rounded-md w-40"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-9 bg-gray-200 rounded-md w-40"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-9 bg-gray-200 rounded-md w-40"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Ошибка загрузки фильтров: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <Select
        value={mealType}
        onValueChange={(value) => handleChange({ mealType: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Meal Type" />
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
      <Select
        value={country}
        onValueChange={(value) => handleChange({ country: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Country" />
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
      <Select
        value={dietTags}
        onValueChange={(value) => handleChange({ dietTags: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Diet" />
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
      <Select
        value={sorting}
        onValueChange={(value) => handleChange({ sorting: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sorting" />
        </SelectTrigger>
        <SelectContent>
          {sortingOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={byTime}
        onValueChange={(value) => handleChange({ byTime: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="By Time" />
        </SelectTrigger>
        <SelectContent>
          {byTimeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={clearFilters}>
        {t('clearFilters')}
      </Button>
    </div>
  );
}
