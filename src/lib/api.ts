import { Ingredient, RecipeIngredient } from '@/types/recipe';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5005/api/',
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
    const response = await fetch(
      `http://localhost:5005/api/ingredients/grouped?lang=${lang}`,
      {
        next: { revalidate: 7 * 24 * 60 * 60 }, // Кэшируем на 7 дней
      }
    );

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
      country: string;
      dietTags: string;
      search?: string;
    },
    lang: string
  ) => {
    const params: any = {
      lang,
      offset: options.offset,
      limit: options.limit,
      mealType: options.mealType,
      country: options.country,
      dietTags: options.dietTags,
    };

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
      params: { ingredientIds },
    });
    return response.data;
  },
  getAllTags: async () => {
    try {
      const response = await api.get(`/recipes/tags`);
      return response.data.tags || response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  // SSR версия с кешированием
  getAllTagsSSR: async () => {
    try {
      const response = await fetch('http://localhost:5005/api/recipes/tags', {
        next: { revalidate: 7 * 24 * 60 * 60 }, // Кэшируем на 7 дней
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tags;
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
