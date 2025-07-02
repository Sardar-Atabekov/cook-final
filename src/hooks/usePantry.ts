import { useState, useEffect } from 'react';

export interface PantryItem {
  ingredientId: number;
  ingredientName: string;
  addedAt: Date;
  recipeTitle?: string;
}

export function usePantry() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);

  // Загружаем кладовую из localStorage при инициализации
  useEffect(() => {
    const saved = localStorage.getItem('supercook-pantry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPantryItems(
          parsed.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }))
        );
      } catch (e) {
        console.error('Error loading pantry from localStorage:', e);
      }
    }
  }, []);

  // Сохраняем кладовую в localStorage при изменениях
  useEffect(() => {
    localStorage.setItem('supercook-pantry', JSON.stringify(pantryItems));
  }, [pantryItems]);

  const addToPantry = (
    ingredientId: number,
    ingredientName: string,
    recipeTitle?: string
  ) => {
    const newItem: PantryItem = {
      ingredientId,
      ingredientName,
      addedAt: new Date(),
      recipeTitle,
    };

    setPantryItems((prev) => {
      // Проверяем, нет ли уже такого ингредиента
      const exists = prev.some((item) => item.ingredientId === ingredientId);
      if (exists) {
        return prev; // Не добавляем дубликаты
      }
      return [...prev, newItem];
    });
  };

  const addMultipleToPantry = (
    ingredients: Array<{ id: number; name: string }>,
    recipeTitle?: string
  ) => {
    ingredients.forEach((ingredient) => {
      addToPantry(ingredient.id, ingredient.name, recipeTitle);
    });
  };

  const removeFromPantry = (ingredientId: number) => {
    setPantryItems((prev) =>
      prev.filter((item) => item.ingredientId !== ingredientId)
    );
  };

  const clearPantry = () => {
    setPantryItems([]);
  };

  const isPantryEmpty = pantryItems.length === 0;

  return {
    pantryItems,
    addToPantry,
    addMultipleToPantry,
    removeFromPantry,
    clearPantry,
    isPantryEmpty,
  };
}
