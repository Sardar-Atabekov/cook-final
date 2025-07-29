import { recipeApi } from '@/lib/api';
import { SuggestedClient } from './SuggestedClient';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SuggestedPageError from './error';

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
      { offset: 0, limit: LIMIT, mealType: '', kitchens: '', dietTags: '' },
      locale
    ),
    // Breakfast
    recipeApi.getRecipes(
      [],
      {
        offset: 0,
        limit: LIMIT,
        mealType: MEAL_TYPE_IDS.breakfast,
        kitchens: '',
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
        kitchens: '',
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
        kitchens: '',
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
      <SuggestedClient
        locale={locale}
        initialBreakfast={breakfastRecipes}
        initialLunch={lunchRecipes}
        initialDinner={dinnerRecipes}
        initialRandom={randomRecipesList}
      />
    );
  } catch (error) {
    console.error('Error loading suggested recipes:', error);
    return <SuggestedPageError locale={locale} variant="error" />;
  }
}
