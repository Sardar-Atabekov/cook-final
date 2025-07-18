import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { id: string; email: string; name: string };

interface AuthStore {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
