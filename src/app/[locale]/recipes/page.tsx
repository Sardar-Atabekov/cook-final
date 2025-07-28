import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ingredientsApi, recipeApi } from '@/lib/api';
import { getTranslations } from 'next-intl/server';
import ClientRecipePageLayout from './ClientRecipePageLayout';
// Не импортирую клиентские компоненты и хуки здесь

// Кэшируем страницу на 7 дней для ускорения загрузки
export const revalidate = 604800;

interface SearchPageProps {
  params: { locale: string };
  searchParams: {
    q?: string;
    ingredients?: string;
    mealType?: string;
    country?: string;
    dietTags?: string;
    sorting?: string;
    byTime?: string;
    page?: string;
  };
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

  // Получаем теги фильтров на сервере (SSR/SSG)
  let initialTags = [];
  try {
    initialTags = await recipeApi.getAllTagsSSR();
  } catch (e) {
    console.error('Failed to load filter tags:', e);
    initialTags = [];
  }

  // Парсим параметры поиска
  const searchQuery = resolvedParams.q?.trim() || '';
  // ingredientIds и ingredients больше не нужны
  // const ingredientIds = ...
  const mealType = resolvedParams.mealType || 'all';
  const kitchens = resolvedParams.country || 'all';
  const dietTags = resolvedParams.dietTags || 'all';
  const sorting = resolvedParams.sorting || 'all';
  const byTime = resolvedParams.byTime || 'all';

  // Получаем рецепты для SSR (поиск и фильтрация на сервере)
  let recipes = [];
  let total = 0;
  const isLoading = false;
  let error = null;
  try {
    const filters = {
      offset: (page - 1) * 20,
      limit: 20,
      mealType: mealType === 'all' ? '' : mealType,
      kitchens: kitchens === 'all' ? '' : kitchens,
      dietTags: dietTags === 'all' ? '' : dietTags,
      sorting: sorting === 'all' ? '' : sorting,
      byTime: byTime === 'all' ? '' : byTime,
      search: searchQuery || undefined,
    };
    // ingredientIds больше не передаём
    const result = await recipeApi.getRecipes(
      [], // пустой массив ингредиентов
      filters,
      locale
    );
    recipes = result.recipes || [];
    total = result.total || 0;
    console.log('Server: recipes loaded', {
      recipes: recipes.length,
      total,
      searchQuery,
      mealType,
      kitchens,
      dietTags,
      filters: filters,
    });
  } catch (e) {
    error = e instanceof Error ? e : new Error('Failed to load recipes');
    recipes = [];
    total = 0;
    console.log('Server: error loading recipes', e);
  }

  return (
    <ClientRecipePageLayout
      searchQuery={searchQuery}
      mealType={mealType}
      kitchens={kitchens}
      dietTags={dietTags}
      sorting={sorting}
      byTime={byTime}
      recipes={recipes}
      total={total}
      isLoading={isLoading}
      error={error}
      initialGroupedCategories={initialGroupedCategories}
      initialTags={initialTags}
      locale={locale}
      page={page}
    />
  );
}
