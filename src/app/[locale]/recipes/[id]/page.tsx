import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { recipeApi } from '@/lib/api';
import { RecipePageClient } from './RecipePageClient';

interface RecipePageProps {
  params: Promise<{ id: string; locale: string }>;
}

// Генерируем метаданные для SEO
export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const recipe = await recipeApi.getRecipeSSR(id);

    if (!recipe) {
      return {
        title: 'Рецепт не найден',
        description: 'К сожалению, этот рецепт не найден или был удален.',
      };
    }

    return {
      title: `${recipe.title} - Рецепт приготовления`,
      description:
        recipe.description ||
        `Подробный рецепт приготовления ${recipe.title}. Время приготовления: ${recipe.prepTime || recipe.cookTime} минут.`,
      keywords: `${recipe.title}, рецепт, ${recipe.country}, ${recipe.mealType}, кулинария, готовка`,
      openGraph: {
        title: recipe.title,
        description:
          recipe.description || `Рецепт приготовления ${recipe.title}`,
        images: recipe.imageUrl ? [{ url: recipe.imageUrl }] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: recipe.title,
        description:
          recipe.description || `Рецепт приготовления ${recipe.title}`,
        images: recipe.imageUrl ? [recipe.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Рецепт',
      description: 'Рецепт приготовления блюда',
    };
  }
}

async function getRecipeData(id: string) {
  try {
    console.log('SSR: Fetching recipe', { id });
    const recipe = await recipeApi.getRecipeSSR(id);
    console.log('SSR: Recipe data received', { id, hasData: !!recipe });
    return recipe;
  } catch (error) {
    console.error('SSR: Error fetching recipe', { id, error });
    return null;
  }
}

async function getSimilarRecipes(recipe: any) {
  try {
    if (!recipe) return null;

    console.log('SSR: Fetching similar recipes', {
      mealType: recipe.mealType,
      country: recipe.country,
    });

    const similarRecipes = await recipeApi.getRecipesSSR(
      [],
      {
        offset: 0,
        limit: 4,
        mealType: recipe.mealType || 'all',
        country: recipe.country || 'all',
        dietTags: 'all',
      },
      'ru'
    );

    console.log('SSR: Similar recipes received', {
      count: similarRecipes?.recipes?.length || 0,
    });

    return similarRecipes;
  } catch (error) {
    console.error('SSR: Error fetching similar recipes', error);
    return null;
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id, locale } = await params;

  console.log('SSR: Recipe page render', { id, locale });

  try {
    // Получаем данные рецепта на сервере
    const recipe = await getRecipeData(id);

    console.log('SSR: Recipe data received', {
      hasRecipe: !!recipe,
      recipeId: recipe?.id,
      recipeTitle: recipe?.title,
    });

    if (!recipe || !recipe.id) {
      console.log('SSR: Recipe not found, showing 404');
      notFound();
    }

    // Получаем похожие рецепты на сервере
    const similarRecipes = await getSimilarRecipes(recipe);

    console.log('SSR: All data fetched, rendering page', {
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      similarCount: similarRecipes?.recipes?.length || 0,
    });

    return (
      <RecipePageClient
        initialRecipe={recipe}
        initialSimilarRecipes={similarRecipes}
        locale={locale}
        isLoading={false}
      />
    );
  } catch (error) {
    console.error('SSR: Error in RecipePage', error);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка SSR</h1>
        <p className="text-gray-600">Произошла ошибка при загрузке рецепта</p>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
