import { useState, useEffect } from 'react';

export function useSelectedIngredients() {
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);

  // Загружаем выбранные ингредиенты из localStorage при инициализации
  useEffect(() => {
    const saved = localStorage.getItem('supercook-selected-ingredients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedIngredients(parsed);
        }
      } catch (e) {
        console.error(
          'Error loading selected ingredients from localStorage:',
          e
        );
      }
    }
  }, []);

  // Сохраняем выбранные ингредиенты в localStorage при изменениях
  useEffect(() => {
    localStorage.setItem(
      'supercook-selected-ingredients',
      JSON.stringify(selectedIngredients)
    );
  }, [selectedIngredients]);

  const toggleIngredient = (ingredientId: number) => {
    setSelectedIngredients((prev) => {
      if (prev.includes(ingredientId)) {
        return prev.filter((id) => id !== ingredientId);
      } else {
        return [...prev, ingredientId];
      }
    });
  };

  const addIngredient = (ingredientId: number) => {
    setSelectedIngredients((prev) => {
      if (!prev.includes(ingredientId)) {
        return [...prev, ingredientId];
      }
      return prev;
    });
  };

  const removeIngredient = (ingredientId: number) => {
    setSelectedIngredients((prev) => prev.filter((id) => id !== ingredientId));
  };

  const clearIngredients = () => {
    setSelectedIngredients([]);
  };

  return {
    selectedIngredients,
    setSelectedIngredients,
    toggleIngredient,
    addIngredient,
    removeIngredient,
    clearIngredients,
  };
}
