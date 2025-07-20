'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, Star, ChefHat, MapPin } from 'lucide-react';
import type { Recipe } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  priority?: boolean;
}

export function RecipeCard({
  recipe,
  onClick,
  onSave,
  isSaved,
  priority = false,
}: RecipeCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('recipes');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const formatPrepTime = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return '—';
    if (minutes < 60) return t('cookingTime', { time: minutes });
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? t('cookingTimeHours', { hours, minutes: remainingMinutes })
      : t('cookingTimeOnlyHours', { hours });
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/${locale}/recipes/${recipe.id}`}>
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col border-0 bg-white shadow-sm hover:shadow-2xl">
          {/* Image wrapper */}
          <div className="relative w-full h-48 overflow-hidden bg-gray-100">
            {!imageError ? (
              <Image
                src={recipe.imageUrl || '/images/placeholder.svg'}
                alt={recipe.title}
                fill
                className={cn(
                  'object-cover transition-all duration-300 group-hover:scale-105',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                <ChefHat className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {/* Loading skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%]" />
            )}

            {/* Match percentage badge */}
            {recipe.matchPercentage !== undefined && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge
                  className={cn(
                    'text-white text-xs font-medium absolute rounded-full top-3 left-3 shadow-lg',
                    getMatchColor(Number(recipe.matchPercentage))
                  )}
                >
                  {t('match', { percentage: recipe.matchPercentage })}
                </Badge>
              </motion.div>
            )}

            {/* Save button */}
            {onSave && (
              <motion.button
                className={cn(
                  'absolute top-3 right-3 p-2 rounded-full transition-all duration-300 shadow-lg',
                  isSaved
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white/90 text-gray-600 hover:bg-white hover:scale-110'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSave();
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
              </motion.button>
            )}

            {/* Recipe info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatPrepTime(Number(recipe.prepTime))}
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
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4 flex flex-col flex-1">
            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-lg">
              {recipe.title}
            </h3>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {recipe.description}
            </p>

            {/* Recipe metadata */}
            <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
              {recipe.country && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {recipe.country}
                </div>
              )}
              {recipe.mealType && (
                <div className="flex items-center">
                  <ChefHat className="w-3 h-3 mr-1" />
                  {recipe.mealType}
                </div>
              )}
            </div>

            {/* Missing ingredients */}
            <div className="text-sm mt-auto">
              {recipe.missingIngredients &&
              recipe.missingIngredients.length > 0 ? (
                <>
                  <div className="text-xs text-gray-600 mb-2 font-medium">
                    {t('missing')}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.missingIngredients
                      .slice(0, 3)
                      .map((ingredient, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-2 py-1 bg-orange-100 text-orange-800 text-xs border-0"
                        >
                          {ingredient.ingredient?.name}
                        </Badge>
                      ))}
                    {recipe.missingIngredients.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs border-0"
                      >
                        {t('moreMissing', {
                          count: recipe.missingIngredients.length - 3,
                        })}
                      </Badge>
                    )}
                  </div>
                </>
              ) : recipe.matchPercentage === '100' ? (
                <span className="text-green-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  {t('hasAllIngredients')}
                </span>
              ) : (
                <span className="text-red-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  {t('notAllIngredients')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
