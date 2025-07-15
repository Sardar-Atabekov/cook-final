import { useState, useEffect, useCallback } from 'react';
import { userRecipesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Recipe } from '@/lib/api';

export function useSavedRecipes() {
  const { token } = useAuthStore();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка сохранённых рецептов с сервера
  useEffect(() => {
    if (!token) {
      setSavedRecipes([]);
      return;
    }
    setLoading(true);
    userRecipesApi
      .getSavedRecipes(token)
      .then((data) => setSavedRecipes(data.recipes || data))
      .catch(() => setSavedRecipes([]))
      .finally(() => setLoading(false));
  }, [token]);

  const isRecipeSaved = useCallback(
    (id: string | number) => {
      return savedRecipes.some((r) => r.id === id || r.id === String(id));
    },
    [savedRecipes]
  );

  const saveRecipe = async (id: string | number) => {
    if (!token) return;
    await userRecipesApi.saveRecipe(token, String(id));
    // После успешного сохранения — обновляем список
    const data = await userRecipesApi.getSavedRecipes(token);
    setSavedRecipes(data.recipes || data);
  };

  const unsaveRecipe = async (id: string | number) => {
    if (!token) return;
    await userRecipesApi.unsaveRecipe(token, String(id));
    // После успешного удаления — обновляем список
    const data = await userRecipesApi.getSavedRecipes(token);
    setSavedRecipes(data.recipes || data);
  };

  const toggleSaveRecipe = async (id: string | number) => {
    if (isRecipeSaved(id)) {
      await unsaveRecipe(id);
    } else {
      await saveRecipe(id);
    }
  };

  return {
    savedRecipes,
    isRecipeSaved,
    saveRecipe,
    unsaveRecipe,
    toggleSaveRecipe,
    loading,
  };
}
