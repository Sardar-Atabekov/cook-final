'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Heart,
  Star,
  ChefHat,
  MapPin,
  Users,
  Zap,
  ExternalLink,
} from 'lucide-react';
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
    if (percentage >= 90) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (percentage >= 80) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (percentage >= 70)
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-orange-500 to-orange-600';
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
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Link href={`/${locale}/recipes/${recipe.id}`}>
        <Card className="overflow-hidden cursor-pointer h-full flex flex-col border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl">
          {/* Image wrapper */}
          <div className="relative w-full h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {!imageError ? (
              <Image
                src={recipe.imageUrl || '/images/placeholder.svg'}
                alt={recipe.title}
                fill
                className={cn(
                  'object-cover transition-all duration-500 group-hover:scale-110',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <ChefHat className="h-12 w-12 text-gray-400" />
                </motion.div>
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
                className="absolute top-3 left-3 z-10"
              >
                <Badge
                  className={cn(
                    'text-white text-xs font-bold rounded-full shadow-lg px-3 py-1',
                    getMatchColor(Number(recipe.matchPercentage))
                  )}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {t('match', { percentage: recipe.matchPercentage })}
                </Badge>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex space-x-2 z-10">
              {/* External link button */}
              {(recipe.sourceUrl || recipe.source_url) && (
                <motion.a
                  href={recipe.sourceUrl || recipe.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-all duration-300 shadow-lg bg-white/90 text-gray-600 hover:bg-white hover:scale-110 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              )}

              {/* Save button */}
              {onSave && (
                <motion.button
                  className={cn(
                    'p-2 rounded-full transition-all duration-300 shadow-lg',
                    isSaved
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                      : 'bg-white/90 text-gray-600 hover:bg-white hover:scale-110 backdrop-blur-sm'
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSave();
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
                </motion.button>
              )}

              {/* Default save button (if no onSave prop) */}
              {!onSave && (
                <motion.button
                  className={cn(
                    'p-2 rounded-full transition-all duration-300 shadow-lg',
                    isSaved
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                      : 'bg-white/90 text-gray-600 hover:bg-white hover:scale-110 backdrop-blur-sm'
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('clicked');
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
                </motion.button>
              )}
            </div>

            {/* Recipe info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center bg-black/30 px-2 py-1 rounded-full">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatPrepTime(Number(recipe.prepTime))}
                </div>
                <div className="flex items-center bg-black/30 px-2 py-1 rounded-full">
                  <Star className="mr-1 h-3 w-3 text-yellow-400 fill-current" />
                  <span className="font-medium">
                    {typeof recipe.rating === 'number' && !isNaN(recipe.rating)
                      ? recipe.rating.toFixed(1)
                      : '0.0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <CardContent className="p-5 flex flex-col flex-1">
            <motion.h3
              className="font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 text-lg leading-tight"
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {recipe.title}
            </motion.h3>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {recipe.description}
            </p>

            {/* Recipe metadata */}
            <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
              {recipe.country && (
                <motion.div
                  className="flex items-center bg-gray-100 px-2 py-1 rounded-full"
                  whileHover={{ scale: 1.05 }}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {recipe.country}
                </motion.div>
              )}
              {recipe.mealType && (
                <motion.div
                  className="flex items-center bg-gray-100 px-2 py-1 rounded-full"
                  whileHover={{ scale: 1.05 }}
                >
                  <ChefHat className="w-3 h-3 mr-1" />
                  {recipe.mealType}
                </motion.div>
              )}
            </div>

            {/* Missing ingredients */}
            <div className="text-sm mt-auto">
              {recipe.missingIngredients &&
              recipe.missingIngredients.length > 0 ? (
                <>
                  <div className="text-xs text-gray-600 mb-2 font-medium flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    {t('missing')}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.missingIngredients
                      .slice(0, 3)
                      .map((ingredient, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Badge
                            variant="secondary"
                            className="px-2 py-1 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-xs border-0 font-medium"
                          >
                            {ingredient.ingredient?.name}
                          </Badge>
                        </motion.div>
                      ))}
                    {recipe.missingIngredients.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs border-0 font-medium"
                      >
                        +{recipe.missingIngredients.length - 3} {t('more')}
                      </Badge>
                    )}
                  </div>
                </>
              ) : recipe.matchPercentage === '100' ? (
                <motion.span
                  className="text-green-600 font-medium flex items-center bg-green-50 px-3 py-2 rounded-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  {t('hasAllIngredients')}
                </motion.span>
              ) : (
                <motion.span
                  className="text-red-600 font-medium flex items-center bg-red-50 px-3 py-2 rounded-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  {t('notAllIngredients')}
                </motion.span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
