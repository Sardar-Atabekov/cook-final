import { create } from 'zustand';
import { Ingredient } from '@/types/recipe';
import { persist } from 'zustand/middleware';

interface IngredientStore {
  selectedIngredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (ingredientId: number) => void;
  clearIngredients: () => void;
  hasIngredient: (ingredientId: number) => boolean;
}

export const useIngredientStore = create<IngredientStore>()(
  persist(
    (set, get) => ({
      selectedIngredients: [],
      addIngredient: (ingredient) => {
        const current = get().selectedIngredients;
        if (!current.find((i) => i.id === ingredient.id)) {
          set({ selectedIngredients: [...current, ingredient] });
        }
      },
      removeIngredient: (ingredientId) =>
        set({
          selectedIngredients: get().selectedIngredients.filter(
            (i) => i.id !== ingredientId
          ),
        }),
      clearIngredients: () => set({ selectedIngredients: [] }),
      hasIngredient: (ingredientId) =>
        get().selectedIngredients.some((i) => i.id === ingredientId),
    }),
    {
      name: 'ingredient-store',
    }
  )
);
