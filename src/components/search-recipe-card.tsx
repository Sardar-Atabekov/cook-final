'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/lib/api';

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
  const formatPrepTime = (minutes: number | string) => {
    const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes;
    if (!mins || isNaN(mins)) return '—';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMinutes = mins % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getMatchColor = (percentage: string | number) => {
    const num =
      typeof percentage === 'string' ? parseInt(percentage) : percentage;
    if (num >= 90) return 'bg-green-500';
    if (num >= 80) return 'bg-green-400';
    if (num >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      {/* Image wrapper */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={recipe.imageUrl || '/images/placeholder.svg'}
          alt={recipe.title}
          fill
          className="object-cover"
        />
        {recipe.matchPercentage !== undefined && (
          <Badge
            className={cn(
              'text-white text-xs font-medium absolute rounded-full top-3 left-3',
              getMatchColor(recipe.matchPercentage)
            )}
          >
            {recipe.matchPercentage}% Match
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
          {recipe.missingIngredients && recipe.missingIngredients.length > 0 ? (
            <>
              <div className="text-xs text-gray-600 mb-1">
                Missing ingredients:
              </div>
              <div className="flex flex-wrap gap-1">
                {recipe.missingIngredients
                  .slice(0, 3)
                  .map((ingredient: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-2 py-1 bg-orange-100 text-orange-800 text-xs"
                    >
                      {ingredient.matchedName || ingredient}
                    </Badge>
                  ))}
                {recipe.missingIngredients.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs"
                  >
                    +{recipe.missingIngredients.length - 3} more
                  </Badge>
                )}
              </div>
            </>
          ) : recipe.matchPercentage === '100' ? (
            <span className="text-green-600">✓ You have all ingredients!</span>
          ) : (
            <span className="text-red-600">
              ✗ You don't have all ingredients!
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SearchRecipeCard = React.memo(SearchRecipeCardComponent);
