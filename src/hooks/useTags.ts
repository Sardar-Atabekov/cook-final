import { useState, useEffect, useCallback } from 'react';
import { recipeApi } from '@/lib/api';
import { useTagsStore } from '@/stores/useTagsStore';

const TAGS_CACHE_KEY = 'tags-cache-v1';
const TAGS_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 дней

function getCache(lang: string) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TAGS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed.lang === lang &&
      parsed.tags &&
      parsed.updatedAt &&
      Date.now() - parsed.updatedAt < TAGS_CACHE_TTL
    ) {
      return parsed.tags;
    }
    return null;
  } catch {
    return null;
  }
}

function setCache(lang: string, tags: any[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      TAGS_CACHE_KEY,
      JSON.stringify({ lang, tags, updatedAt: Date.now() })
    );
  } catch (e) {
    // ignore
  }
}

export function useTags(lang: string, initialTags?: any[]) {
  const tagsStore = useTagsStore();
  // Если initialTags есть и не пустой — используем их как источник правды
  // Если initialTags пустой, но store не пустой — используем store
  const [tags, setTags] = useState<any[]>(() => {
    if (initialTags && initialTags.length > 0) return initialTags;
    if (tagsStore.tags && tagsStore.tags.length > 0) return tagsStore.tags;
    if (typeof window !== 'undefined') {
      const cached = getCache(lang);
      if (cached) return cached;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(tags.length === 0);
  const [error, setError] = useState<null | Error>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const freshTags = await recipeApi.getAllTags();
      setTags(freshTags);
      setCache(lang, freshTags);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  // При монтировании или смене языка
  useEffect(() => {
    // Если initialTags есть и не пустой — не делаем запрос
    if (initialTags && initialTags.length > 0) {
      setTags(initialTags);
      setIsLoading(false);
      return;
    }
    // Если store не пустой — используем store
    if (tagsStore.tags && tagsStore.tags.length > 0) {
      setTags(tagsStore.tags);
      setIsLoading(false);
      return;
    }
    const cached = getCache(lang);
    if (cached) {
      setTags(cached);
      setIsLoading(false);
    } else {
      fetchTags();
    }
  }, [lang, fetchTags, initialTags, tagsStore.tags]);

  // Позволяет вручную обновить теги
  const refreshTags = fetchTags;

  return { tags, isLoading, error, refreshTags };
}
