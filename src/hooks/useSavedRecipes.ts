import { useAuthStore } from '@/stores/useAuthStore';
import { userRecipesApi } from '@/lib/api';

export function useSavedRecipes() {
  const { token } = useAuthStore();

  // Проверка сохранён ли рецепт на сервере
  const isRecipeSavedServer = async (id: string | number) => {
    if (!token) return false;
    try {
      const data = await userRecipesApi.getSavedRecipes(token);
      const recipes = data.recipes || data;
      return recipes.some((r: any) => r.id === id || r.id === String(id));
    } catch {
      return false;
    }
  };

  // Сохранить рецепт на сервере
  const saveRecipeServer = async (id: string | number) => {
    if (!token) return;
    await userRecipesApi.saveRecipe(token, String(id));
  };

  // Удалить рецепт на сервере
  const unsaveRecipeServer = async (id: string | number) => {
    if (!token) return;
    await userRecipesApi.unsaveRecipe(token, String(id));
  };

  // Тоггл на сервере
  const toggleSaveRecipeServer = async (id: string | number) => {
    if (!token) return;
    const saved = await isRecipeSavedServer(id);
    if (saved) {
      await userRecipesApi.unsaveRecipe(token, String(id));
    } else {
      await userRecipesApi.saveRecipe(token, String(id));
    }
  };

  return {
    isRecipeSavedServer,
    saveRecipeServer,
    unsaveRecipeServer,
    toggleSaveRecipeServer,
  };
}
