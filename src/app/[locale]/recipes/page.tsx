import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ingredientsApi, recipeApi } from '@/lib/api';
import { IngredientSidebar } from '@/components/ingredient-sidebar';
import { RecipeGridWrapper } from '@/components/recipe-grid-wrapper';
import { getTranslations } from 'next-intl/server';

// Кэшируем страницу на 7 дней для ускорения загрузки
export const revalidate = 7 * 24 * 60 * 60;

interface RecipesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
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
}: RecipesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const paramsResolved = await searchParams;
  const t = await getTranslations({ locale, namespace: 'recipes' });

  const ingredients = paramsResolved.ingredients;

  let title = t('defaultTitle');
  let description = t('defaultDescription');

  if (ingredients) {
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

export default async function RecipesPage({
  params,
  searchParams,
}: RecipesPageProps) {
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

  // Парсим параметры
  const ingredientIds = resolvedParams.ingredients
    ? resolvedParams.ingredients
        .split(',')
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id))
    : [];

  if (ingredientIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <IngredientSidebar
            className="block sticky top-0 h-screen"
            initialGroupedCategories={initialGroupedCategories}
          />
          <main className="flex-1 h-full overflow-y-auto p-6 mb-10">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Выберите ингредиенты
              </h1>
              <p className="text-gray-600">
                Пожалуйста, выберите ингредиенты для поиска рецептов
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <IngredientSidebar
          className="block sticky top-0 h-screen"
          initialGroupedCategories={initialGroupedCategories}
        />
        <main className="flex-1 h-full overflow-y-auto p-6 mb-10">
          <RecipeGridWrapper initialTags={initialTags} />
        </main>
      </div>
    </div>
  );
}
