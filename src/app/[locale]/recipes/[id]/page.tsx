import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { recipeApi } from '@/lib/api';
import { RecipePageClient } from './RecipePageClient';

interface RecipePageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
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
      description: recipe.description || `Рецепт приготовления ${recipe.title}`,
      images: recipe.imageUrl ? [{ url: recipe.imageUrl }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description: recipe.description || `Рецепт приготовления ${recipe.title}`,
      images: recipe.imageUrl ? [recipe.imageUrl] : [],
    },
  };
}

async function getRecipeData(id: string, locale: string) {
  const recipe = await recipeApi.getRecipeSSR(id, locale);
  return recipe;
}

async function getSimilarRecipes(recipe: any, locale) {
  if (!recipe) return null;
  return recipeApi.getRecipesSSR(
    [],
    {
      offset: 0,
      limit: 4,
      mealType: recipe.mealType || 'all',
      country: recipe.country || 'all',
      dietTags: 'all',
    },
    locale
  );
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id, locale } = await params;
  const recipe = await getRecipeData(id, locale);
  if (!recipe || !recipe.id) {
    notFound();
  }
  const similarRecipes = await getSimilarRecipes(recipe);
  return (
    <RecipePageClient
      initialRecipe={recipe}
      initialSimilarRecipes={similarRecipes}
      locale={locale}
      isLoading={false}
    />
  );
}
