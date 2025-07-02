import { useState, useEffect } from 'react';

export interface SavedRecipe {
  id: number;
  title: string;
  savedAt: Date;
}

export function useSavedRecipes() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  // Загружаем сохраненные рецепты из localStorage при инициализации
  useEffect(() => {
    const saved = localStorage.getItem('supercook-saved-recipes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedRecipes(
          parsed.map((recipe: any) => ({
            ...recipe,
            savedAt: new Date(recipe.savedAt),
          }))
        );
      } catch (e) {
        console.error('Error loading saved recipes from localStorage:', e);
      }
    }
  }, []);

  // Сохраняем рецепты в localStorage при изменениях
  useEffect(() => {
    localStorage.setItem(
      'supercook-saved-recipes',
      JSON.stringify(savedRecipes)
    );
  }, [savedRecipes]);

  const saveRecipe = (id: number, title: string) => {
    setSavedRecipes((prev) => {
      if (prev.some((recipe) => recipe.id === id)) {
        return prev; // Уже сохранен
      }
      return [...prev, { id, title, savedAt: new Date() }];
    });
  };

  const unsaveRecipe = (id: number) => {
    setSavedRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
  };

  const isRecipeSaved = (id: number) => {
    return savedRecipes.some((recipe) => recipe.id === id);
  };

  const toggleSaveRecipe = (id: number, title: string) => {
    if (isRecipeSaved(id)) {
      unsaveRecipe(id);
    } else {
      saveRecipe(id, title);
    }
  };

  return {
    savedRecipes,
    saveRecipe,
    unsaveRecipe,
    isRecipeSaved,
    toggleSaveRecipe,
  };
}
