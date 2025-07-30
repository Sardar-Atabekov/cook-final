import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RecipeCard } from '@/components/recipe-card';
import type { RecipeWithIngredients } from '@/types/recipe';
import type { Recipe } from '@/lib/api';

// Function to convert RecipeWithIngredients to Recipe
function toRecipe(recipe: RecipeWithIngredients | null): Recipe | null {
  if (!recipe) return null;

  try {
    return {
      description: recipe.description || '',
      cookTime: (recipe as any).cookTime || 0,
      rating: recipe.rating || 0,
      prepTime: (recipe as any).prepTime || '',
      nutrition: (recipe as any).nutrition || {},
      id: String(recipe.id),
      title: recipe.title || 'Untitled Recipe',
      cookingTime: recipe.cookingTime || 0,
      country: recipe.country || '',
      mealType: (recipe as any).mealType || recipe.type || '',
      dietTags: (recipe as any).dietTags || [],
      ingredients: (recipe.ingredients || []).map(
        (i) => i.ingredient?.name || ''
      ),
      steps: (recipe as any).steps || recipe.instructions || [],
      loading: false,
      servings: (recipe as any).servings || 1,
      difficulty: (recipe as any).difficulty || '',
      imageUrl: recipe.imageUrl || '',
      instructions: recipe.instructions || [],
      sourceUrl: recipe.sourceUrl,
      recipeIngredients: recipe.ingredients || [],
      matchPercentage: recipe.matchPercentage
        ? String(recipe.matchPercentage)
        : undefined,
      missingIngredients: recipe.missingIngredients as any,
    };
  } catch (error) {
    console.error('Error converting recipe:', error);
    return null;
  }
}

interface SuggestedSectionProps {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  recipes: RecipeWithIngredients[];
  isLoading?: boolean;
  noRecipesText?: string;
}

export function SuggestedSection({
  title,
  icon,
  colorClass,
  recipes,
  isLoading = false,
  noRecipesText,
}: SuggestedSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center mb-4">
        <span className={`mr-2 ${colorClass}`}>{icon}</span>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <Badge variant="outline" className="ml-2">
          {recipes.length}
        </Badge>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse h-32"
            />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.slice(0, 2).map((recipe) => {
            const convertedRecipe = toRecipe(recipe);
            if (!convertedRecipe) return null;

            return (
              <div key={recipe.id} className="mb-4 last:mb-0">
                <RecipeCard recipe={convertedRecipe} />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">
          {noRecipesText || 'No recipes available'}
        </p>
      )}
    </section>
  );
}
