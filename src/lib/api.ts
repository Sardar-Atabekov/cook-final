import { Ingredient, RecipeIngredient } from '@/types/recipe';
import axios from 'axios';

export const baseUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_SERVER
    : 'http://localhost:5000/api/';

const api = axios.create({
  baseURL: baseUrl,
});

export interface Recipe {
  description: string;
  cookTime: number;
  rating: unknown;
  prepTime: string;
  nutrition: unknown;
  id: string;
  title: string;
  cookingTime: number;
  country: string;
  mealType: string;
  dietTags: string[];
  ingredients: string[];
  steps: string[];
  loading?: boolean;
  servings: number;
  difficulty: string;
  imageUrl: string;
  instructions: string[];
  sourceUrl?: string;
  source_url?: string; // Добавляем альтернативное название поля
  recipeIngredients: RecipeIngredient[];
  matchPercentage?: string;
  missingIngredients?: RecipeIngredient[];
}

export interface SearchFilters {
  mealType?: string;
  country?: string;
  dietTags?: string;
  page?: number;
  limit?: number;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/signup', {
      email,
      password,
      username: name,
    });
    return response.data;
  },

  googleAuth: async (code: string) => {
    const response = await api.post('auth/google/callback', { code });
    return response.data;
  },

  googleAuthUrl: async () => {
    const response = await api.get('auth/google/url');
    return response.data;
  },
};

export const ingredientsApi = {
  async getIngredients(
    categoryId?: number,
    search?: string
  ): Promise<Ingredient[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (search) params.append('search', search);
    const response = await api.get(`/ingredients/list?${params}`);
    return response.data;
  },

  getGroupedIngredients: async (lang: string) => {
    // Используем fetch с кэшированием для ускорения загрузки
    const response = await fetch(`${baseUrl}ingredients/grouped?lang=${lang}`, {
      next: { revalidate: 7 * 24 * 60 * 60 }, // Кэшируем на 7 дней
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

export const recipeApi = {
  getRecipes: async (
    ingredientIds: number[],
    options: {
      offset: number;
      limit: number;
      mealType: string;
      kitchens: string;
      dietTags: string;
      sorting?: string;
      byTime?: string;
      search?: string;
    },
    lang: string
  ) => {
    const params: any = {
      lang,
      offset: options.offset,
      limit: options.limit,
      mealType: options.mealType,
      kitchens: options.kitchens,
      dietTags: options.dietTags,
    };

    // Добавляем новые фильтры
    if (options.sorting && options.sorting.trim()) {
      params.sorting = options.sorting.trim();
    }
    if (options.byTime && options.byTime.trim()) {
      params.byTime = options.byTime.trim();
    }

    // Всегда передаем ингредиенты, если они есть
    if (ingredientIds.length > 0) {
      params.ingredients = ingredientIds.join(',');
    }

    // Если есть поиск по тексту, добавляем его
    if (options.search && options.search.trim().length > 0) {
      params.search = options.search.trim();
    }

    // Специальная обработка для английского языка
    if (lang === 'en') {
      // Убеждаемся, что все параметры передаются корректно
      if (!params.mealType) params.mealType = '';
      if (!params.kitchens) params.kitchens = '';
      if (!params.dietTags) params.dietTags = '';
      if (!params.sorting) params.sorting = '';
      if (!params.byTime) params.byTime = '';

      // Убеждаемся, что ингредиенты передаются корректно
      if (!params.ingredients && !params.ingredientIds) {
        params.ingredients = '';
      }
    }

    // Специальное логирование для английского языка
    if (lang === 'en') {
      console.log('🇬🇧 English API Request:', {
        lang,
        ingredientIds,
        search: options.search,
        params,
        url: `${baseUrl}recipes/recipes`,
        baseUrl,
        fullUrl: `${baseUrl}recipes/recipes?${new URLSearchParams(params).toString()}`,
      });
    }

    try {
      const response = await api.get('/recipes/recipes', { params });
      const data = response.data;

      // Специальное логирование для английского языка
      if (lang === 'en') {
        console.log('🇬🇧 English API Response:', {
          recipesCount: data?.recipes?.length || 0,
          total: data?.total || 0,
          hasMore: data?.hasMore || false,
          status: response.status,
        });
      }

      return data;
    } catch (error: any) {
      // Специальное логирование ошибок для английского языка
      if (lang === 'en') {
        console.error('🇬🇧 English API Error:', {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
          params,
        });
      }
      throw error;
    }
  },

  // SSR версия для получения рецептов
  getRecipesSSR: async (
    ingredientIds: number[],
    options: {
      offset: number;
      limit: number;
      mealType: string;
      kitchens: string;
      dietTags: string;
      sorting?: string;
      byTime?: string;
      search?: string;
    },
    lang: string
  ) => {
    const params = new URLSearchParams({
      lang,
      offset: options.offset.toString(),
      limit: options.limit.toString(),
      mealType: options.mealType,
      kitchens: options.kitchens,
      dietTags: options.dietTags,
    });

    // Добавляем новые фильтры
    if (options.sorting && options.sorting.trim()) {
      params.append('sorting', options.sorting.trim());
    }
    if (options.byTime && options.byTime.trim()) {
      params.append('byTime', options.byTime.trim());
    }

    // Если есть поиск по тексту, передаём только его
    if (options.search && options.search.trim().length > 0) {
      params.append('search', options.search.trim());
      params.append('ingredientIds', ingredientIds.join(','));
    } else if (ingredientIds.length > 0) {
      params.append('ingredients', ingredientIds.join(','));
    }

    const response = await fetch(`${baseUrl}recipes/recipes?${params}`, {
      next: { revalidate: 5 * 60 * 1000 }, // Кэшируем на 10 минут
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  },

  getSuggestedRecipes: async (lang: string): Promise<Recipe[]> => {
    const hour = new Date().getHours();
    let mealType = 'lunch';

    if (hour >= 6 && hour < 11) mealType = 'breakfast';
    else if (hour >= 17 && hour < 22) mealType = 'dinner';
    const response = await api.get(`/recipes/recipes`, {
      params: { lang },
    });
    return response.data
      .filter((recipe: { mealType: string }) => recipe.mealType === mealType)
      .slice(0, 4);
  },

  getRecipe: async (id: string, ingredientIds: number[]) => {
    const response = await api.get(`/recipes/recipe/${id}`, {
      params: { ingredientIds: ingredientIds.join(',') },
    });
    return response.data;
  },

  // SSR версия для получения рецепта
  getRecipeSSR: async (id: string) => {
    const response = await fetch(`${baseUrl}recipes/recipe/${id}`, {
      next: { revalidate: 5 * 60 * 1000 }, // Кэшируем на 5 минут
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },
  getAllTags: async () => {
    const response = await api.get(`/recipes/tags`);
    const data = response.data;

    // Новая структура API возвращает объект с категориями
    if (data.mealTypes || data.kitchens || data.diets) {
      // Преобразуем в плоский массив для обратной совместимости
      const allTags = [
        ...(data.mealTypes || []),
        ...(data.kitchens || []),
        ...(data.diets || []),
      ];
      return allTags;
    }

    // Fallback для старой структуры
    return data.tags || data;
  },

  // SSR версия с кешированием
  getAllTagsSSR: async () => {
    const response = await fetch(`${baseUrl}recipes/tags`, {
      next: { revalidate: 7 * 24 * 60 * 60 }, // Кэшируем на 7 дней
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Новая структура API возвращает объект с категориями
    if (data.mealTypes || data.kitchens || data.diets) {
      // Преобразуем в плоский массив для обратной совместимости
      const allTags = [
        ...(data.mealTypes || []),
        ...(data.kitchens || []),
        ...(data.diets || []),
      ];
      return allTags;
    }

    // Fallback для старой структуры
    return data.tags || data;
  },
};

export const userRecipesApi = {
  getSavedRecipes: async (token: string) => {
    const response = await api.get('/user/saved-recipes', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  saveRecipe: async (token: string, recipeId: string) => {
    const response = await api.post(
      '/user/save-recipe',
      { recipeId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
  unsaveRecipe: async (token: string, recipeId: string) => {
    const response = await api.delete(`/user/save-recipe/${recipeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getCookedRecipes: async (token: string) => {
    const response = await api.get('/user/cooked-recipes', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  saveCookedRecipe: async (token: string, recipeId: string) => {
    const response = await api.post(
      '/user/save-cooked-recipe',
      { recipeId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  unsaveCookedRecipe: async (token: string, recipeId: string) => {
    const response = await api.delete(`/user/save-cooked-recipe/${recipeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default api;
