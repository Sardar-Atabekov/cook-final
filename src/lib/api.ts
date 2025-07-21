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
    const response = await api.post('/auth/signup', { email, password, name });
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

    // Если есть поиск по тексту, передаём только его
    if (options.search && options.search.trim().length > 0) {
      params.search = options.search.trim();
      params.ingredientIds = ingredientIds.join(',');
    } else if (ingredientIds.length > 0) {
      params.ingredients = ingredientIds.join(',');
    }

    const response = await api.get('/recipes/recipes', { params });
    return response.data; // { recipes, total, hasMore }
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
    try {
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

      console.log('API SSR: Fetching recipes', { params: params.toString() });

      const response = await fetch(`${baseUrl}recipes/recipes?${params}`, {
        next: { revalidate: 5 * 60 * 1000 }, // Кэшируем на 10 минут
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API SSR: Recipes response', {
        count: data?.recipes?.length || 0,
      });
      return data;
    } catch (error) {
      console.error('API SSR: Error fetching recipes', error);
      throw error;
    }
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
    try {
      console.log('API: Fetching recipe', { id, ingredientIds });
      const response = await api.get(`/recipes/recipe/${id}`, {
        params: { ingredientIds: ingredientIds.join(',') },
      });
      console.log('API: Recipe response', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching recipe', { id, error });
      throw error;
    }
  },

  // SSR версия для получения рецепта
  getRecipeSSR: async (id: string) => {
    try {
      console.log('API SSR: Fetching recipe', { id });
      const response = await fetch(`${baseUrl}recipes/recipe/${id}`, {
        next: { revalidate: 5 * 60 * 1000 }, // Кэшируем на 5 минут
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API SSR: Recipe response', { id, hasData: !!data });
      return data;
    } catch (error) {
      console.error('API SSR: Error fetching recipe', { id, error });
      throw error;
    }
  },
  getAllTags: async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  // SSR версия с кешированием
  getAllTagsSSR: async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching SSR tags:', error);
      throw error;
    }
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
