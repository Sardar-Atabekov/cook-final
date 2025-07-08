'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RecipeCard } from '@/components/recipe-card';
import { Skeleton } from '@/components/ui/skeleton';
import { recipeApi } from '@/lib/api';
import { Clock, Sunrise, Sun, Moon } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useIngredientStore } from '@/stores/useIngredientStore';

type TimeInfo = {
  period: string;
  greeting: string;
  message: string;
  icon: React.ElementType;
  color: string;
};

function getTimeOfDayInfo(hour: number): TimeInfo {
  if (hour >= 6 && hour < 11) {
    return {
      period: 'breakfast',
      greeting: 'Good Morning!',
      message: 'Start your day with these delicious breakfast recipes',
      icon: Sunrise,
      color: 'text-yellow-600',
    };
  } else if (hour >= 11 && hour < 17) {
    return {
      period: 'lunch',
      greeting: 'Good Afternoon!',
      message: 'Perfect lunch recipes to fuel your day',
      icon: Sun,
      color: 'text-blue-600',
    };
  } else {
    return {
      period: 'dinner',
      greeting: 'Good Evening!',
      message: 'Unwind with these satisfying dinner recipes',
      icon: Moon,
      color: 'text-blue-600',
    };
  }
}

export default function SuggestedPage() {
  const { selectedIngredients: ingredients } = useIngredientStore();
  const locale = useLocale();

  const { data: suggestedRecipes, isLoading } = useQuery({
    queryKey: ['suggested-recipes'],
    queryFn: recipeApi.getSuggestedRecipes,
  });

  const [timeInfo, setTimeInfo] = useState<TimeInfo | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setTimeInfo(getTimeOfDayInfo(hour));
  }, []);

  if (!timeInfo) {
    return <div className="text-center py-12">Loading suggestions...</div>;
  }

  const TimeIcon = timeInfo.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full bg-gray-100 ${timeInfo.color}`}>
            <TimeIcon className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {timeInfo.greeting}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{timeInfo.message}</p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Perfect for {timeInfo.period}</span>
        </div>
      </div>

      {/* Suggested Recipes */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : suggestedRecipes && suggestedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              userIngredients={ingredients}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Suggestions Available
          </h2>
          <p className="text-gray-600">
            We couldn't find any recipes for this time of day. Try browsing all
            recipes instead.
          </p>
        </div>
      )}

      {/* Additional Suggestions */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Want More Personalized Suggestions?
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Add ingredients you have at home to get recipes tailored just for you
        </p>
        <div className="text-center">
          <a
            href={`/${locale}/`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Ingredients
          </a>
        </div>
      </div>
    </div>
  );
}
