'use client';

import { RecipeGrid } from '@/components/recipe-grid';
import { useIngredientStore } from '@/stores/useIngredientStore';

export function RecipeGridWrapper() {
  const { selectedIngredients } = useIngredientStore();
  return <RecipeGrid selectedIngredients={selectedIngredients} />;
}
