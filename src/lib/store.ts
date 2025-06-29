import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

interface IngredientsState {
  ingredients: string[]
  addIngredient: (ingredient: string) => void
  removeIngredient: (ingredient: string) => void
  clearIngredients: () => void
}

interface AppState extends AuthState, IngredientsState {}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth state
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),

      // Ingredients state
      ingredients: [],
      addIngredient: (ingredient) =>
        set((state) => ({
          ingredients: state.ingredients.includes(ingredient) ? state.ingredients : [...state.ingredients, ingredient],
        })),
      removeIngredient: (ingredient) =>
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i !== ingredient),
        })),
      clearIngredients: () => set({ ingredients: [] }),
    }),
    {
      name: "recipe-finder-storage",
    },
  ),
)
