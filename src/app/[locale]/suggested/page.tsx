import { Suspense } from 'react';
import { recipeApi } from '@/lib/api';
import { SuggestedClient } from './SuggestedClient';

const LIMIT = 6;

// Known meal type IDs
const MEAL_TYPE_IDS = {
  breakfast: '2',
  lunch: '3',
  dinner: '7',
} as const;

interface SuggestedPageProps {
  params: { locale: string };
}

export default async function SuggestedPage({ params }: SuggestedPageProps) {
  const { locale } = params;

  try {
    // Parallel data fetching for better performance
    const [randomRecipes, breakfastResponse, lunchResponse, dinnerResponse] =
      await Promise.all([
        recipeApi.getRecipes(
          [],
          { offset: 0, limit: LIMIT, mealType: '', country: '', dietTags: '' },
          locale
        ),
        recipeApi.getRecipes(
          [],
          {
            offset: 0,
            limit: LIMIT,
            mealType: MEAL_TYPE_IDS.breakfast,
            country: '',
            dietTags: '',
          },
          locale
        ),
        recipeApi.getRecipes(
          [],
          {
            offset: 0,
            limit: LIMIT,
            mealType: MEAL_TYPE_IDS.lunch,
            country: '',
            dietTags: '',
          },
          locale
        ),
        recipeApi.getRecipes(
          [],
          {
            offset: 0,
            limit: LIMIT,
            mealType: MEAL_TYPE_IDS.dinner,
            country: '',
            dietTags: '',
          },
          locale
        ),
      ]);

    // Extract recipes from responses
    const breakfastRecipes = breakfastResponse?.recipes || [];
    const lunchRecipes = lunchResponse?.recipes || [];
    const dinnerRecipes = dinnerResponse?.recipes || [];
    const randomRecipesList = randomRecipes?.recipes || [];

    return (
      <Suspense fallback={<SuggestedPageSkeleton />}>
        <SuggestedClient
          locale={locale}
          initialBreakfast={breakfastRecipes}
          initialLunch={lunchRecipes}
          initialDinner={dinnerRecipes}
          initialRandom={randomRecipesList}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading suggested recipes:', error);
    return <SuggestedPageError locale={locale} />;
  }
}

// Loading skeleton component
function SuggestedPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-slate-200 rounded-full animate-pulse mr-3" />
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-6 w-96 bg-slate-200 rounded animate-pulse mx-auto mb-6" />

          {/* Tabs skeleton */}
          <div className="flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-slate-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Recipes grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse"
            >
              <div className="w-full h-48 bg-slate-200 rounded-t-xl" />
              <div className="p-4">
                <div className="h-4 bg-slate-200 rounded mb-2" />
                <div className="h-3 bg-slate-200 rounded mb-4" />
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-16" />
                  <div className="h-3 bg-slate-200 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error component
function SuggestedPageError({ locale }: { locale: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h1>
        <p className="text-slate-600 mb-4">
          We couldn't load the suggested recipes. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
