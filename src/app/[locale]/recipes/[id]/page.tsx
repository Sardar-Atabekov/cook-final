import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { recipeApi } from '@/lib/api';
import { RecipePageClient } from './RecipePageClient';
import { getTranslations } from 'next-intl/server';

interface RecipePageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'recipe' });
  const recipe = await recipeApi.getRecipeSSR(id);
  if (!recipe) {
    return {
      title: t('notFound'),
      description: t('notFoundDescription'),
    };
  }
  return {
    title: `${recipe.title} - ${t('title')}`,
    description:
      recipe.description ||
      t('titleDescription', {
        title: recipe.title,
        time: recipe.prepTime || recipe.cookTime,
      }),
    keywords: `${recipe.title}, ${t('recipe')}, ${recipe.country}, ${recipe.mealType}, ${t('keywords')}`,
    openGraph: {
      title: recipe.title,
      description:
        recipe.description ||
        t('titleDescription', {
          title: recipe.title,
          time: recipe.prepTime || recipe.cookTime,
        }),
      images: recipe.imageUrl ? [{ url: recipe.imageUrl }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description:
        recipe.description ||
        t('titleDescription', {
          title: recipe.title,
          time: recipe.prepTime || recipe.cookTime,
        }),
      images: recipe.imageUrl ? [recipe.imageUrl] : [],
    },
  };
}

async function getRecipeData(id: string) {
  const recipe = await recipeApi.getRecipeSSR(id);
  return recipe;
}

async function getSimilarRecipes(recipe: any, locale: string) {
  if (!recipe) return null;
  return recipeApi.getRecipesSSR(
    [],
    {
      offset: 0,
      limit: 4,
      mealType: recipe.mealType || 'all',
      kitchens: recipe.kitchens || 'all',
      dietTags: recipe.diets || 'all',
    },
    locale
  );
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id, locale } = await params;
  const recipe = await getRecipeData(id);
  if (!recipe || !recipe.id) {
    notFound();
  }
  const similarRecipes = await getSimilarRecipes(recipe, locale);
  return (
    <RecipePageClient
      initialRecipe={recipe}
      initialSimilarRecipes={similarRecipes}
      locale={locale}
      isLoading={false}
    />
  );
}
