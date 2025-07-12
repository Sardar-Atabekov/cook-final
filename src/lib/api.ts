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
  dietTags?: string[];
  page?: number;
  limit?: number;
}

// export const recipeApi = {
//   searchRecipes: async (
//     ingredients: string[],
//     filters: SearchFilters = {}
//   ): Promise<{
//     recipes: Recipe[];
//     total: number;
//     page: number;
//     totalPages: number;
//   }> => {
//     // Mock API delay
//   },

//   getRecipe: async (id: string): Promise<Recipe> => {
//     await new Promise((resolve) => setTimeout(resolve, 500));
//     const recipe = mockRecipes.find((r) => r.id === id);
//     if (!recipe) throw new Error('Recipe not found');
//     return recipe;
//   },

//   getSuggestedRecipes: async (): Promise<Recipe[]> => {
//     await new Promise((resolve) => setTimeout(resolve, 600));
//     const hour = new Date().getHours();
//     let mealType = 'lunch';

//     if (hour >= 6 && hour < 11) mealType = 'breakfast';
//     else if (hour >= 17 && hour < 22) mealType = 'dinner';

//     return mockRecipes
//       .filter((recipe) => recipe.mealType === mealType)
//       .slice(0, 4);
//   },
// };

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

  getById: async (id: string) => {
    const response = await api.get(`/ingredients/${id}`);
    return response.data;
  },

  getAllCategories: async () => {
    const response = await api.get(`/ingredients/categories`);
    return response.data;
  },

  getGroupedIngredients: async (lang: string) => {
    const response = await api.get(`/ingredients/grouped`, {
      params: { lang },
    });
    return response.data;
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
      dietTags: string[];
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
    } else if (ingredientIds.length > 0) {
      params.ingredients = ingredientIds.join(',');
    }

    console.log('params', params);
    const response = await api.get('/recipes/recipes', { params });
    return response.data; // { recipes, total, hasMore }
  },

  getSuggestedRecipes: async (lang: string): Promise<Recipe[]> => {
    const hour = new Date().getHours();
    let mealType = 'lunch';

    if (hour >= 6 && hour < 11) mealType = 'breakfast';
    else if (hour >= 17 && hour < 22) mealType = 'dinner';
    const response = await api.get(`/recipes`, {
      params: { lang },
    });
    return response.data
      .filter((recipe: { mealType: string }) => recipe.mealType === mealType)
      .slice(0, 4);
  },

  getRecipe: async (id: string, ingredientIds: number[]) => {
    const response = await api.get(`/recipes/recipes/${id}`, {
      params: { ingredientIds },
    });
    return response.data;
  },
};
