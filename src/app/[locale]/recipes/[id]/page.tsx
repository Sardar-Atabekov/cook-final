'use client';

import { useParams, useLocale } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/lib/api';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { useLocalSavedRecipes } from '@/hooks/useLocalSavedRecipes';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  MapPin,
  ChefHat,
  Users,
  Check,
  X,
  Heart,
  Share2,
  BookOpen,
  Star,
  Timer,
  ChefHat as ChefHatIcon,
} from 'lucide-react';

export default function RecipePage() {
  const params = useParams();
  const { selectedIngredients: userIngredients } = useIngredientStore();
  const recipeId = params.id as string;
  const locale = useLocale();
  const t = useTranslations('recipe');
  const tCommon = useTranslations('common');
  const { toast } = useToast();
  const {
    isRecipeSaved,
    toggleSaveRecipe,
    loading: saving,
  } = useLocalSavedRecipes();
  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () =>
      recipeApi.getRecipe(
        recipeId,
        userIngredients.map((ingredient) => ingredient.id)
      ),
  });

  const handleSaveRecipe = async () => {
    await toggleSaveRecipe(recipe.id);
    toast({
      title: isRecipeSaved(recipe.id)
        ? tCommon('recipeSaved') || 'Рецепт сохранён'
        : tCommon('recipeRemoved') || 'Рецепт удалён',
      description: isRecipeSaved(recipe.id)
        ? tCommon('recipeSavedDescription') ||
          `"${recipe.title}" добавлен в избранные`
        : tCommon('recipeRemovedDescription') ||
          `"${recipe.title}" удалён из избранных`,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: tCommon('linkCopied') || 'Ссылка скопирована!' });
    } catch {
      toast({ title: tCommon('copyError') || 'Ошибка копирования' });
    }
  };

  if (isLoading) {
    return (
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !recipe) {
    return (
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <X className="h-12 w-12 text-red-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('notFound')}
          </h1>
          <p className="text-gray-600 mb-8">{t('notFoundDescription')}</p>
          <Button asChild>
            <Link href={`/${locale}/recipes`}>{t('backToRecipes')}</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  // Исправленная проверка наличия ингредиента у пользователя
  const hasIngredient = (ingredientId: number) =>
    userIngredients.some((userIng) => userIng.id === ingredientId);

  // Разделение ингредиентов
  const ownedIngredients = recipe.recipeIngredients.filter((ri: any) =>
    hasIngredient(ri.ingredientId)
  );
  const missingIngredients = recipe.recipeIngredients.filter(
    (ri: any) => !hasIngredient(ri.ingredientId)
  );

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

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Button variant="ghost" asChild className="mb-6 group">
          <Link href={`/${locale}/recipes`}>
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('backToRecipes')}
          </Link>
        </Button>
      </motion.div>

      {/* Recipe Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6 shadow-xl">
          <Image
            src={recipe.imageUrl || '/images/placeholder.svg'}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <motion.button
              onClick={handleShare}
              className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-all duration-200 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={handleSaveRecipe}
              disabled={saving}
              className={`p-2 rounded-full transition-all duration-200 shadow-lg ${
                isRecipeSaved(recipe.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                className={`h-4 w-4 ${isRecipeSaved(recipe.id) && 'fill-current'}`}
              />
            </motion.button>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {recipe.title}
            </motion.h1>
          </div>
        </div>

        {/* Recipe Info */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="font-medium">{recipe.prepTime} мин</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
            <MapPin className="h-5 w-5 text-green-500" />
            <span className="font-medium">{recipe.country}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
            <ChefHat className="h-5 w-5 text-purple-500" />
            <span className="font-medium">{recipe.mealType}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Users className="h-5 w-5 text-orange-500" />
            <span className="font-medium">4 порции</span>
          </div>
        </motion.div>

        {/* Match Status */}
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Совпадение ингредиентов
            </h3>
            <Badge
              className={`${
                recipe.matchPercentage >= 80
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : recipe.matchPercentage >= 60
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-red-100 text-red-800 border-red-200'
              } text-sm font-medium px-3 py-1`}
            >
              {recipe.matchPercentage}% совпадение
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            У вас есть{' '}
            <span className="font-semibold text-green-600">
              {recipe.recipeIngredients.length -
                recipe.missingIngredients.length}
            </span>{' '}
            из {recipe.recipeIngredients.length} ингредиентов
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="grid md:grid-cols-1 gap-8" variants={itemVariants}>
        {/* Ingredients */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <CardTitle className="flex items-center text-green-800">
              <ChefHatIcon className="h-5 w-5 mr-2" />
              Ингредиенты
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              {ownedIngredients.map((ingredient: any, index: number) => (
                <motion.li
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-green-800 font-medium">
                    {ingredient.line || ingredient.ingredient?.name}
                  </span>
                </motion.li>
              ))}
              {missingIngredients.map((ingredient: any, index: number) => (
                <motion.li
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: (ownedIngredients.length + index) * 0.1,
                  }}
                >
                  <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">
                    {ingredient.line || ingredient.ingredient?.name}
                  </span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Инструкции */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <CardTitle className="flex items-center text-blue-800">
                <Timer className="h-5 w-5 mr-2" />
                Инструкции по приготовлению
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ol className="space-y-4">
                {recipe.instructions.map(
                  (instruction: string, index: number) => (
                    <motion.li
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed">
                        {instruction}
                      </p>
                    </motion.li>
                  )
                )}
              </ol>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}
