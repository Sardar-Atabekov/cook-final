import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FiltersState {
  mealType: string;
  country: string;
  dietTags: string;
  sorting: string;
  byTime: string;
  searchText: string;

  // Actions
  setMealType: (mealType: string) => void;
  setCountry: (country: string) => void;
  setDietTags: (dietTags: string) => void;
  setSorting: (sorting: string) => void;
  setByTime: (byTime: string) => void;
  setSearchText: (searchText: string) => void;
  setFilters: (filters: {
    mealType?: string;
    country?: string;
    dietTags?: string;
    sorting?: string;
    byTime?: string;
    searchText?: string;
  }) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      // Initial state
      mealType: 'all',
      country: 'all',
      dietTags: 'all',
      sorting: 'all',
      byTime: 'all',
      searchText: '',

      // Actions
      setMealType: (mealType: string) => set({ mealType }),
      setCountry: (country: string) => set({ country }),
      setDietTags: (dietTags: string) => set({ dietTags }),
      setSorting: (sorting: string) => set({ sorting }),
      setByTime: (byTime: string) => set({ byTime }),
      setSearchText: (searchText: string) => set({ searchText }),

      setFilters: (filters) =>
        set((state) => ({
          ...state,
          ...filters,
        })),

      clearFilters: () =>
        set({
          mealType: 'all',
          country: 'all',
          dietTags: 'all',
          sorting: 'all',
          byTime: 'all',
          searchText: '',
        }),

      hasActiveFilters: () => {
        const state = get();
        return (
          state.mealType !== 'all' ||
          state.country !== 'all' ||
          state.dietTags !== 'all' ||
          state.sorting !== 'all' ||
          state.byTime !== 'all' ||
          state.searchText.trim() !== ''
        );
      },
    }),
    {
      name: 'filters-storage',
      partialize: (state) => ({
        mealType: state.mealType,
        country: state.country,
        dietTags: state.dietTags,
        sorting: state.sorting,
        byTime: state.byTime,
        searchText: state.searchText,
      }),
    }
  )
);
