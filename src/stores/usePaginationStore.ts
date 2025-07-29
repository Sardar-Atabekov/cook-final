import { create } from 'zustand';

interface PaginationState {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  resetPage: () => void;
}

export const usePaginationStore = create<PaginationState>((set) => ({
  currentPage: 1,
  setCurrentPage: (page: number) => set({ currentPage: page }),
  resetPage: () => set({ currentPage: 1 }),
}));
