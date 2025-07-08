'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart } from 'lucide-react';
import type { Recipe } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function RecipeCard({
  recipe,
  onClick,
  onSave,
  isSaved,
}: RecipeCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const formatPrepTime = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return '—';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <Link href={`/${locale}/recipes/${recipe.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col">
        {/* Image wrapper */}
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={recipe.imageUrl || '/images/placeholder.svg'}
            alt={recipe.title}
            fill
            className="object-cover"
          />

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
            {recipe.matchPercentage !== undefined && (
              <Badge
                className={cn(
                  'text-white text-xs font-medium',
                  getMatchColor(recipe.matchPercentage)
                )}
              >
                {recipe.matchPercentage}% Match
              </Badge>
            )}
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {formatPrepTime(recipe.prepTime)}
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {recipe.title}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {recipe.description}
          </p>

          <div className="text-sm mt-auto">
            {recipe.missingIngredients &&
            recipe.missingIngredients.length > 0 ? (
              <>
                <div className="text-xs text-gray-600 mb-1">
                  Missing ingredients:
                </div>
                <div className="flex flex-wrap gap-1">
                  {recipe.missingIngredients
                    .slice(0, 3)
                    .map((ingredient, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-2 py-1 bg-orange-100 text-orange-800 text-xs"
                      >
                        {ingredient}
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
            ) : (
              <span className="text-green-600">
                ✓ You have all ingredients!
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
