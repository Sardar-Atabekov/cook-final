import { create } from 'zustand';

interface TagsState {
  tags: any[];
  setTags: (tags: any[]) => void;
  getTags: () => any[];
  resetTags: () => void;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
  getTags: () => get().tags,
  resetTags: () => set({ tags: [] }),
}));
