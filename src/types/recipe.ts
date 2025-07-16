export interface Ingredient {
  categoryName: any;
  toLowerCase(): unknown;
  toLowerCase(): string;
  id: number;
  name: string;
  unit?: string;
  category?: unknown;
}

export interface IngredientCategory {
  ingredients: Ingredient[];
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface RecipeIngredient {
  id: number;
  recipeId: number;
  ingredientId: number;
  amount: string;
  required: boolean;
  ingredient: Ingredient;
  matchedName?: string;
  line?: string;
}

export interface Recipe {
  recipeIngredients: any;
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  country?: string;
  sourceUrl?: string;
  cookingTime?: number;
  servings?: number;
  calories?: number;
  instructions?: string[];
  rating?: string;
  ratingCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[];
  tags: Tag[];
  matchPercentage?: number;
  missingIngredients?: string[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface Country {
  id: number;
  name: string;
  code?: string;
}

export interface SearchFilters {
  ingredients: number[];
  country?: string;
  type?: string;
  sortBy?: string;
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}
