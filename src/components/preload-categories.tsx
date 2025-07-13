'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ingredientsApi } from '@/lib/api';
import { useIngredientStore } from '@/stores/useIngredientStore';

// Компонент для предзагрузки категорий в фоне
export function PreloadCategories() {
  const locale = useLocale();
  const { isCacheStale } = useIngredientStore();

  useEffect(() => {
    // Предзагружаем категории если кэш устарел
    if (isCacheStale(locale)) {
      ingredientsApi.getGroupedIngredients(locale).catch(console.error);
    }
  }, [locale, isCacheStale]);

  return null; // Не рендерим ничего
}
