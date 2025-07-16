import { create } from 'zustand';

interface SavedRecipesState {
  savedRecipeIds: number[];
  setSavedRecipeIds: (ids: number[]) => void;
  addSavedRecipeId: (id: number) => void;
  removeSavedRecipeId: (id: number) => void;
  resetSavedRecipeIds: () => void;
}

export const useSavedRecipesStore = create<SavedRecipesState>((set) => ({
  savedRecipeIds: [],
  setSavedRecipeIds: (ids) => set({ savedRecipeIds: ids }),
  addSavedRecipeId: (id) =>
    set((state) => ({ savedRecipeIds: [...state.savedRecipeIds, id] })),
  removeSavedRecipeId: (id) =>
    set((state) => ({
      savedRecipeIds: state.savedRecipeIds.filter((rid) => rid !== id),
    })),
  resetSavedRecipeIds: () => set({ savedRecipeIds: [] }),
}));
