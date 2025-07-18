/* eslint-disable prettier/prettier */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LanguageStore {
  language: string | undefined;
  version: number;
  setLanguage: (lang: string) => void;
  getStorage?: any;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: undefined,
      version: 0,
      setLanguage: (lang) =>
        set((state) => ({
          language: lang,
          version: state.version + 1,
        })),
    }),
    {
      name: 'language-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
