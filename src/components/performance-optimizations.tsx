'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import { Recipe, IngredientCategory } from '@/types/recipe';

// Мемоизированный компонент карточки рецепта для оптимизации рендеринга
export const MemoizedRecipeCard = memo(function MemoizedRecipeCard({
  recipe,
  onClick,
  onSave,
  isSaved,
}: {
  recipe: Recipe;
  onClick: () => void;
  onSave: () => void;
  isSaved: boolean;
}) {
  return (
    <div onClick={onClick} className="cursor-pointer">
      {/* Компонент карточки рецепта */}
    </div>
  );
});

// Хук для дебаунса поискового запроса
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Хук для виртуализации больших списков ингредиентов
export function useVirtualizedList(
  items: any[],
  containerHeight: number,
  itemHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.startIndex, visibleRange.endIndex)
      .map((item, index) => ({
        ...item,
        index: visibleRange.startIndex + index,
        top: (visibleRange.startIndex + index) * itemHeight,
      }));
  }, [items, visibleRange, itemHeight]);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) =>
      setScrollTop(e.currentTarget.scrollTop),
  };
}
