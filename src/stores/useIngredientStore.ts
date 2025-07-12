import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ingredient, IngredientCategory } from '@/types/recipe';

interface IngredientStore {
  selectedIngredients: Ingredient[];
  groupedCategories: IngredientCategory[];
  lastUpdated: number | null;
  language: string | null; // Добавляем язык
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: number) => void;
  clearIngredients: () => void;
  hasIngredient: (id: number) => boolean;
  setGroupedCategories: (
    categories: IngredientCategory[],
    lang: string
  ) => void; // язык в сеттер
  isCacheStale: (lang: string) => boolean; // язык в проверке stale
}

export const useIngredientStore = create<IngredientStore>()(
  persist(
    (set, get) => ({
      selectedIngredients: [],
      groupedCategories: [],
      lastUpdated: null,
      language: null,
      addIngredient: (ingredient) => {
        const current = get().selectedIngredients;
        if (!current.find((i) => i.id === ingredient.id)) {
          set({ selectedIngredients: [...current, ingredient] });
        }
      },
      removeIngredient: (id) =>
        set({
          selectedIngredients: get().selectedIngredients.filter(
            (i) => i.id !== id
          ),
        }),
      clearIngredients: () => set({ selectedIngredients: [] }),
      hasIngredient: (id) => get().selectedIngredients.some((i) => i.id === id),
      setGroupedCategories: (categories, lang) =>
        set({
          groupedCategories: categories,
          lastUpdated: Date.now(),
          language: lang,
        }),
      isCacheStale: (lang) => {
        const last = get().lastUpdated;
        const currentLang = get().language;
        if (!last) return true;
        if (currentLang !== lang) return true; // если язык поменялся — stale
        return Date.now() - last > 3 * 24 * 60 * 60 * 1000;
      },
    }),
    {
      name: 'ingredient-store',
      partialize: (state) => ({
        selectedIngredients: state.selectedIngredients,
        groupedCategories: state.groupedCategories,
        lastUpdated: state.lastUpdated,
        language: state.language,
      }),
    }
  )
);
