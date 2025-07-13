import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ingredientsApi, recipeApi } from '@/lib/api';
import { IngredientSidebar } from '@/components/ingredient-sidebar';
import { SearchPageClient } from '@/components/search-page-client';
import { getTranslations } from 'next-intl/server';

// Кэшируем страницу на 1 час для ускорения загрузки
export const revalidate = 3600;

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    ingredients?: string;
    mealType?: string;
    country?: string;
    dietTags?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const paramsResolved = await searchParams;
  const t = await getTranslations({ locale, namespace: 'search' });

  const searchQuery = paramsResolved.q;
  const ingredients = paramsResolved.ingredients;

  let title = t('defaultTitle');
  let description = t('defaultDescription');

  if (searchQuery) {
    title = t('searchTitle', { query: searchQuery });
    description = t('searchDescription', { query: searchQuery });
  } else if (ingredients) {
    title = t('ingredientsTitle');
    description = t('ingredientsDescription');
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  const resolvedParams = await searchParams;

  // Валидация параметров
  const page = parseInt(resolvedParams.page || '1');
  if (page < 1 || page > 100) {
    notFound();
  }

  // Получаем категории ингредиентов на сервере (SSR/SSG)
  let initialGroupedCategories = [];
  try {
    initialGroupedCategories =
      await ingredientsApi.getGroupedIngredients(locale);
  } catch (e) {
    console.error('Failed to load ingredient categories:', e);
    initialGroupedCategories = [];
  }

  // Парсим параметры поиска
  const searchQuery = resolvedParams.q?.trim() || '';
  const ingredientIds = resolvedParams.ingredients
    ? resolvedParams.ingredients
        .split(',')
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id))
    : [];
  const mealType = resolvedParams.mealType || 'all';
  const country = resolvedParams.country || 'all';
  const dietTags = resolvedParams.dietTags
    ? resolvedParams.dietTags.split(',').filter((tag) => tag.trim())
    : [];

  // Получаем начальные рецепты для SSR (только для первой страницы)
  let initialRecipes = [];
  let totalRecipes = 0;

  if (page === 1 && (searchQuery || ingredientIds.length > 0)) {
    try {
      const filters = {
        offset: 0,
        limit: 20,
        mealType: mealType === 'all' ? '' : mealType,
        country: country === 'all' ? '' : country,
        dietTags,
        search: searchQuery || undefined,
      };

      const result = await recipeApi.getRecipes(
        searchQuery ? [] : ingredientIds,
        filters,
        locale
      );

      initialRecipes = result.recipes || [];
      totalRecipes = result.total || 0;
    } catch (e) {
      console.error('Failed to load initial recipes:', e);
      initialRecipes = [];
      totalRecipes = 0;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <IngredientSidebar
          className="block sticky top-0 h-screen"
          initialGroupedCategories={initialGroupedCategories}
        />
        <main className="flex-1 h-full overflow-y-auto p-6 mb-10">
          <SearchPageClient
            locale={locale}
            initialSearchQuery={searchQuery}
            initialIngredientIds={ingredientIds}
            initialMealType={mealType}
            initialCountry={country}
            initialDietTags={dietTags}
            initialPage={page}
            initialRecipes={initialRecipes}
            initialTotal={totalRecipes}
          />
        </main>
      </div>
    </div>
  );
}
