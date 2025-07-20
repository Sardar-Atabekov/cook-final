import { Suspense } from 'react';
import { recipeApi } from '@/lib/api';
import { SuggestedClient } from './SuggestedClient';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LIMIT = 6; // Increased for better UX
const TIMEOUT_MS = 10000; // 10 seconds timeout

// Known meal type IDs
const MEAL_TYPE_IDS = {
  breakfast: '2',
  lunch: '3',
  dinner: '7',
} as const;

interface SuggestedPageProps {
  params: { locale: string };
}

// Utility function to fetch with timeout
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = TIMEOUT_MS
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );

  return Promise.race([promise, timeoutPromise]);
}

// Optimized parallel data fetching with error handling
async function fetchMealData(locale: string) {
  const fetchTasks = [
    // Random recipes
    recipeApi.getRecipes(
      [],
      { offset: 0, limit: LIMIT, mealType: '', country: '', dietTags: '' },
      locale
    ),
    // Breakfast
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
    // Lunch
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
    // Dinner
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
  ];

  // Use Promise.allSettled instead of Promise.all for better error handling
  const results = await Promise.allSettled(
    fetchTasks.map((task) => fetchWithTimeout(task, TIMEOUT_MS))
  );

  return {
    randomRecipes: results[0].status === 'fulfilled' ? results[0].value : null,
    breakfastResponse:
      results[1].status === 'fulfilled' ? results[1].value : null,
    lunchResponse: results[2].status === 'fulfilled' ? results[2].value : null,
    dinnerResponse: results[3].status === 'fulfilled' ? results[3].value : null,
    errors: results
      .map((result, index) =>
        result.status === 'rejected' ? { index, error: result.reason } : null
      )
      .filter(Boolean),
  };
}

export default async function SuggestedPage({ params }: SuggestedPageProps) {
  const { locale } = await params;

  try {
    const {
      randomRecipes,
      breakfastResponse,
      lunchResponse,
      dinnerResponse,
      errors,
    } = await fetchMealData(locale);

    // Log any partial failures
    if (errors.length > 0) {
      console.warn('Some recipe requests failed:', errors);
    }

    // Extract recipes with fallbacks
    const breakfastRecipes = breakfastResponse?.recipes || [];
    const lunchRecipes = lunchResponse?.recipes || [];
    const dinnerRecipes = dinnerResponse?.recipes || [];
    const randomRecipesList = randomRecipes?.recipes || [];

    // Check if we have at least some data
    const hasAnyData = [
      breakfastRecipes,
      lunchRecipes,
      dinnerRecipes,
      randomRecipesList,
    ].some((array) => array.length > 0);

    if (!hasAnyData) {
      return <SuggestedPageError locale={locale} variant="no-data" />;
    }

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
    return <SuggestedPageError locale={locale} variant="error" />;
  }
}

// Enhanced loading skeleton component with staggered animation
function SuggestedPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div
              className="h-12 w-12 bg-slate-200 rounded-full animate-pulse mr-3"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="h-8 w-64 bg-slate-200 rounded animate-pulse"
              style={{ animationDelay: '100ms' }}
            />
          </div>
          <div
            className="h-6 w-96 bg-slate-200 rounded animate-pulse mx-auto mb-6"
            style={{ animationDelay: '200ms' }}
          />

          {/* Tabs skeleton */}
          <div className="flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-slate-200 rounded animate-pulse"
                style={{ animationDelay: `${300 + i * 100}ms` }}
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
              style={{ animationDelay: `${600 + i * 100}ms` }}
            >
              <div className="w-full h-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4" />
                <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-full" />
                <div className="flex justify-between pt-2">
                  <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16" />
                  <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional sections skeleton */}
        <div className="mt-16">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="bg-white rounded-lg shadow-sm border border-slate-200 animate-pulse"
                    >
                      <div className="w-full h-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-lg" />
                      <div className="p-3">
                        <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced error component with retry functionality
function SuggestedPageError({
  locale,
  variant = 'error',
}: {
  locale: string;
  variant?: 'error' | 'no-data' | 'timeout';
}) {
  const handleRetry = () => {
    window.location.reload();
  };

  const getErrorContent = () => {
    switch (variant) {
      case 'no-data':
        return {
          title: 'No Recipes Available',
          description:
            "We couldn't find any recipes at the moment. This might be temporary.",
          icon: (
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          ),
        };
      case 'timeout':
        return {
          title: 'Loading Timeout',
          description:
            'The request is taking too long. Please check your connection and try again.',
          icon: <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4" />,
        };
      default:
        return {
          title: 'Something went wrong',
          description:
            "We couldn't load the suggested recipes. Please try again.",
          icon: <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />,
        };
    }
  };

  const { title, description, icon } = getErrorContent();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          {icon}
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{title}</h1>
          <p className="text-slate-600 mb-6">{description}</p>
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </div>

          {/* Helpful links */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-3">
              Or try these alternatives:
            </p>
            <div className="flex flex-col space-y-2">
              <a
                href={`/${locale}/recipes`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Browse All Recipes
              </a>
              <a
                href={`/${locale}/`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
