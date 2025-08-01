import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ingredient, IngredientCategory } from '@/types/recipe';

interface IngredientStore {
  selectedIngredients: Ingredient[];
  selectedIds: number[];
  groupedCategories: IngredientCategory[];
  lastUpdated: number | null;
  language: string | null;
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: number) => void;
  clearIngredients: () => void;
  hasIngredient: (id: number) => boolean;
  setSelectedIds: (ids: number[]) => void;
  getSelectedIds: () => number[];
  setGroupedCategories: (
    categories: IngredientCategory[],
    lang: string
  ) => void;
  isCacheStale: (lang: string) => boolean;
  clearIngredientsOnLanguageChange: (newLang: string) => void;
}

export const useIngredientStore = create<IngredientStore>()(
  persist(
    (set, get) => ({
      selectedIngredients: [],
      selectedIds: [],
      groupedCategories: [],
      lastUpdated: null,
      language: null,
      addIngredient: (ingredient) => {
        const current = get().selectedIngredients;
        if (!current.find((i) => i.id === ingredient.id)) {
          const newIngredients = [...current, ingredient];
          set({
            selectedIngredients: newIngredients,
            selectedIds: [...get().selectedIds, ingredient.id],
          });
        }
      },
      removeIngredient: (id) => {
        const newIngredients = get().selectedIngredients.filter(
          (i) => i.id !== id
        );
        const newIds = get().selectedIds.filter((x) => x !== id);
        set({
          selectedIngredients: newIngredients,
          selectedIds: newIds,
        });
      },
      clearIngredients: () => {
        set({ selectedIngredients: [], selectedIds: [] });
      },
      hasIngredient: (id) => {
        const ingredients = get().selectedIngredients;
        return ingredients.some((i) => i.id === id);
      },
      setSelectedIds: (ids) => {
        // Получаем все текущие ингредиенты из groupedCategories
        const allIngredients = get()
          .groupedCategories.flatMap((cat) => cat.ingredients)
          .filter(Boolean);

        // Убираем дубликаты по id, оставляя только первое вхождение
        const uniqueIngredients = allIngredients.filter(
          (ingredient, index, self) =>
            index === self.findIndex((i) => i.id === ingredient.id)
        );

        // Находим объекты ингредиентов по id, избегая дубликатов
        const newSelectedIngredients = uniqueIngredients.filter((ing) =>
          ids.includes(ing.id)
        );

        set({ selectedIds: ids, selectedIngredients: newSelectedIngredients });
      },
      getSelectedIds: () => get().selectedIds,
      setGroupedCategories: (categories, lang) => {
        const currentLang = get().language;

        // Если язык изменился, очищаем выбранные ингредиенты
        if (currentLang && currentLang !== lang) {
          set({
            groupedCategories: categories,
            lastUpdated: Date.now(),
            language: lang,
            selectedIngredients: [],
            selectedIds: [],
          });
        } else {
          set({
            groupedCategories: categories,
            lastUpdated: Date.now(),
            language: lang,
          });
        }
      },
      isCacheStale: (lang) => {
        const last = get().lastUpdated;
        const currentLang = get().language;
        if (!last) return true;
        if (currentLang !== lang) return true; // если язык поменялся — stale
        return Date.now() - last > 7 * 24 * 60 * 60 * 1000; // 7 дней
      },
      clearIngredientsOnLanguageChange: (newLang) => {
        const currentLang = get().language;
        if (currentLang && currentLang !== newLang) {
          set({
            selectedIngredients: [],
            selectedIds: [],
            language: newLang,
          });
        } else if (!currentLang) {
          // Если язык еще не установлен, просто устанавливаем его
          set({ language: newLang });
        }
      },
    }),
    {
      name: 'ingredient-store',
      partialize: (state) => ({
        selectedIngredients: state.selectedIngredients,
        selectedIds: state.selectedIds,
        groupedCategories: state.groupedCategories,
        lastUpdated: state.lastUpdated,
        language: state.language,
      }),
    }
  )
);
