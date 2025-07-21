import { useState, useEffect, useCallback, useRef } from 'react';
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
  const {
    getTags,
    setTags: setTagsStore,
    isCacheStale,
    setCurrentLocale,
  } = useTagsStore();

  // Мгновенно берём из initialTags или store
  const storeTags = getTags(lang);
  const [tags, setTags] = useState<any[]>(() => {
    if (initialTags && initialTags.length > 0) return initialTags;
    if (storeTags && storeTags.length > 0) return storeTags;
    if (typeof window !== 'undefined') {
      const cached = getCache(lang);
      if (cached) return cached;
    }
    return [];
  });

  // isLoading только если нет initialTags и store пуст
  const [isLoading, setIsLoading] = useState(
    !(initialTags && initialTags.length > 0) &&
      (!storeTags || storeTags.length === 0)
  );
  const [error, setError] = useState<null | Error>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const freshTags = await recipeApi.getAllTags(lang);
      setTags(freshTags);
      setTagsStore(freshTags, lang);
      setCache(lang, freshTags);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [lang, setTagsStore]);

  // Используем useRef для отслеживания инициализации
  const isInitialized = useRef(false);

  useEffect(() => {
    setCurrentLocale(lang);

    // Предотвращаем повторную инициализацию
    if (isInitialized.current) return;

    // Если initialTags есть и не пустой — не делаем запрос
    if (initialTags && initialTags.length > 0) {
      setTags(initialTags);
      setTagsStore(initialTags, lang);
      setIsLoading(false);
      isInitialized.current = true;
      return;
    }

    // Если store не пустой — используем store
    if (storeTags && storeTags.length > 0) {
      setTags(storeTags);
      setIsLoading(false);
      isInitialized.current = true;
      // Проверяем, не устарел ли кэш (но не блокируем рендер)
      if (isCacheStale(lang)) {
        fetchTags();
      }
      return;
    }

    // Если есть кэш в localStorage
    const cached = getCache(lang);
    if (cached) {
      setTags(cached);
      setTagsStore(cached, lang);
      setIsLoading(false);
      isInitialized.current = true;
      // Обновляем на свежие данные в фоне
      fetchTags();
    } else {
      fetchTags();
      isInitialized.current = true;
    }
  }, [lang]); // Убираем все зависимости кроме lang

  // Позволяет вручную обновить теги
  const refreshTags = fetchTags;

  return { tags, isLoading, error, refreshTags };
}
