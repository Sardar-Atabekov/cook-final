'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/lib/api';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface SearchRecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

const SearchRecipeCardComponent = ({
  recipe,
  onClick,
  onSave,
  isSaved = false,
}: SearchRecipeCardProps) => {
  const t = useTranslations('recipes');
  const formatPrepTime = (minutes: number | string) => {
    const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes;
    if (!mins || isNaN(mins)) return '—';
    if (mins < 60) return t('cookingTime', { time: mins });
    const hours = Math.floor(mins / 60);
    const remainingMinutes = mins % 60;
    return remainingMinutes > 0
      ? t('cookingTimeHours', { hours, minutes: remainingMinutes })
      : t('cookingTimeOnlyHours', { hours });
  };

  const getMatchColor = (percentage: string | number) => {
    const num =
      typeof percentage === 'string' ? parseInt(percentage) : percentage;
    if (num >= 90) return 'bg-green-500';
    if (num >= 80) return 'bg-green-400';
    if (num >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const locale = useLocale();
  const [imgError, setImgError] = useState(false);

  console.log(recipe);
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col">
      <Link href={`/${locale}/recipes/${recipe.id}`}>
        {/* Image wrapper */}
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={
              imgError
                ? '/images/placeholder.svg'
                : recipe.imageUrl || '/images/placeholder.svg'
            }
            alt={recipe.title ? recipe.title : t('noTitle')}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
          {recipe.matchPercentage !== undefined && (
            <Badge
              className={cn(
                'text-white text-xs font-medium absolute rounded-full top-3 left-3',
                getMatchColor(recipe.matchPercentage)
              )}
            >
              {t('match', { percentage: recipe.matchPercentage })}
            </Badge>
          )}
          {onSave && (
            <button
              className={cn(
                'absolute top-3 right-3 p-2 rounded-full transition-colors',
                isSaved
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave();
              }}
            >
              <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
            </button>
          )}
          {recipe.sourceUrl && (
            <Link
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-all duration-200 shadow-lg hover:scale-105 bg-white/90 text-gray-700 hover:bg-white`}
            >
              <ExternalLink className={`h-4 w-4`} />
            </Link>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {formatPrepTime(recipe.cookingTime || recipe.prepTime || 0)}
            </div>
            <div className="flex items-center">
              <Star className="mr-1 h-3 w-3 text-yellow-400 fill-current" />
              <span>
                {typeof recipe.rating === 'number' && !isNaN(recipe.rating)
                  ? recipe.rating.toFixed(1)
                  : '0.0'}
              </span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {recipe.title}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {recipe.description}
          </p>

          <div className="text-sm mt-auto">
            {recipe.matchPercentage &&
            parseInt(recipe.matchPercentage) > 0 &&
            parseInt(recipe.matchPercentage) < 100 ? (
              <span className="text-orange-600">
                ✓{' '}
                {t('missing', {
                  count: recipe.missingIngredients?.length ?? 0,
                })}
              </span>
            ) : parseInt(recipe.matchPercentage ?? '0') === 100 ? (
              <span className="text-green-600">✓ {t('hasAllIngredients')}</span>
            ) : (
              <span className="text-red-600">✗ {t('notAllIngredients')}</span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export const SearchRecipeCard = React.memo(SearchRecipeCardComponent);
