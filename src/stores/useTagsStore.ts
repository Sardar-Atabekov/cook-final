import { create } from 'zustand';

// Стабильная ссылка на пустой массив
const EMPTY_ARRAY: any[] = [];

interface TagsState {
  tagsByLocale: { [locale: string]: any[] };
  lastUpdatedByLocale: { [locale: string]: number };
  currentLocale: string | null;
  setTags: (tags: any[], locale: string) => void;
  getTags: (locale: string) => any[];
  isCacheStale: (locale: string) => boolean;
  resetTags: (locale?: string) => void;
  setCurrentLocale: (locale: string) => void;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tagsByLocale: {},
  lastUpdatedByLocale: {},
  currentLocale: null,
  setTags: (tags, locale) =>
    set((state) => ({
      tagsByLocale: { ...state.tagsByLocale, [locale]: tags },
      lastUpdatedByLocale: {
        ...state.lastUpdatedByLocale,
        [locale]: Date.now(),
      },
      currentLocale: locale,
    })),
  getTags: (locale) => {
    const tags = get().tagsByLocale[locale];
    return tags || EMPTY_ARRAY;
  },
  isCacheStale: (locale) => {
    const last = get().lastUpdatedByLocale[locale];
    if (!last) return true;
    return Date.now() - last > 7 * 24 * 60 * 60 * 1000; // 7 дней
  },
  resetTags: (locale) => {
    if (!locale) {
      set({ tagsByLocale: {}, lastUpdatedByLocale: {} });
    } else {
      set((state) => {
        const tagsByLocale = { ...state.tagsByLocale };
        const lastUpdatedByLocale = { ...state.lastUpdatedByLocale };
        delete tagsByLocale[locale];
        delete lastUpdatedByLocale[locale];
        return { tagsByLocale, lastUpdatedByLocale };
      });
    }
  },
  setCurrentLocale: (locale) => set({ currentLocale: locale }),
}));
