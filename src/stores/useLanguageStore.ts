/* eslint-disable prettier/prettier */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageStore {
  language: string;
  version: number;
  setLanguage: (lang: string) => void;
  getStorage?: any;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'en',
      version: 0,
      setLanguage: (lang) =>
        set((state) => ({
          language: lang,
          version: state.version + 1,
        })),
    }),
    {
      name: 'language-store',
      getStorage: () => localStorage,
    }
  )
);
