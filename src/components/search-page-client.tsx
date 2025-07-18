'use client';

import { useTranslations } from 'next-intl';
import { SearchRecipeCard } from './search-recipe-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon } from 'lucide-react';
import type { Recipe } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const RecipeSkeleton = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
    return () => setVisible(false);
  }, []);
  return (
    <div
      className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {Array.from({ length: 20 }).map((_, idx) => (
          <div key={idx} className="space-y-3">
            <Skeleton className="h-52 w-full rounded-lg bg-gray-300 animate-pulse" />
            <Skeleton className="h-5 w-3/4 bg-gray-300 animate-pulse" />
            <Skeleton className="h-5 w-1/2 bg-gray-300 animate-pulse" />
            <Skeleton className="h-4 w-full bg-gray-300 animate-pulse" />
            <Skeleton className="h-4 w-2/3 bg-gray-300 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

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

  if (initialRecipes.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col items-center justify-center">
        <SearchIcon className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t('noRecipesFound')}
        </h3>
        <p className="text-gray-600 mb-2">{t('noRecipesFoundSearch')}</p>
        <p className="text-gray-500 text-sm">{t('noRecipesFoundHint')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('searchResultsTitle')}
          </h1>
          <p className="text-gray-600">
            {t('searchResultsCount', { count: initialTotal })}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {initialRecipes.map((recipe) => (
          <SearchRecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
