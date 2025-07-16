import { create } from 'zustand';

interface RecipesState {
  recipes: any[];
  setRecipes: (recipes: any[]) => void;
  getRecipes: () => any[];
  resetRecipes: () => void;
}

export const useRecipesStore = create<RecipesState>((set, get) => ({
  recipes: [],
  setRecipes: (recipes) => set({ recipes }),
  getRecipes: () => get().recipes,
  resetRecipes: () => set({ recipes: [] }),
}));
