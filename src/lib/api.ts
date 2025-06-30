import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/",
  timeout: 10000,
});

// Mock data for development
const mockRecipes = [
  {
    id: "1",
    title: "Creamy Mushroom Pasta",
    image: "/images/placeholder.svg?height=200&width=300",
    cookingTime: 25,
    matchPercentage: 85,
    missingIngredients: ["heavy cream"],
    country: "Italy",
    mealType: "dinner",
    dietTags: ["vegetarian"],
    ingredients: [
      "pasta",
      "mushrooms",
      "garlic",
      "onion",
      "heavy cream",
      "parmesan",
    ],
    steps: [
      "Cook pasta according to package instructions",
      "Sauté mushrooms and garlic in olive oil",
      "Add cream and simmer until thickened",
      "Toss with pasta and serve with parmesan",
    ],
  },
  {
    id: "2",
    title: "Chicken Stir Fry",
    image: "/images/placeholder.svg?height=200&width=300",
    cookingTime: 15,
    matchPercentage: 92,
    missingIngredients: [],
    country: "China",
    mealType: "lunch",
    dietTags: ["gluten-free"],
    ingredients: [
      "chicken breast",
      "bell peppers",
      "soy sauce",
      "garlic",
      "ginger",
    ],
    steps: [
      "Cut chicken into strips",
      "Heat oil in wok",
      "Stir fry chicken until cooked",
      "Add vegetables and sauce",
    ],
  },
  {
    id: "3",
    title: "Avocado Toast",
    image: "/images/placeholder.svg?height=200&width=300",
    cookingTime: 5,
    matchPercentage: 100,
    missingIngredients: [],
    country: "USA",
    mealType: "breakfast",
    dietTags: ["vegan", "healthy"],
    ingredients: ["bread", "avocado", "lime", "salt", "pepper"],
    steps: [
      "Toast bread until golden",
      "Mash avocado with lime juice",
      "Spread on toast",
      "Season with salt and pepper",
    ],
  },
  {
    id: "4",
    title: "Beef Tacos",
    image: "/images/placeholder.svg?height=200&width=300",
    cookingTime: 20,
    matchPercentage: 75,
    missingIngredients: ["tortillas", "cheese"],
    country: "Mexico",
    mealType: "dinner",
    dietTags: [],
    ingredients: [
      "ground beef",
      "onion",
      "garlic",
      "cumin",
      "tortillas",
      "cheese",
      "lettuce",
    ],
    steps: [
      "Brown ground beef with onions",
      "Add spices and cook until fragrant",
      "Warm tortillas",
      "Assemble tacos with toppings",
    ],
  },
];

export interface Recipe {
  description: string;
  cookTime: number;
  servings: number;
  difficulty: string;
  rating: any;
  prepTime: string;
  nutrition: any;
  id: string;
  title: string;
  image: string;
  cookingTime: number;
  matchPercentage: number;
  missingIngredients: string[];
  country: string;
  mealType: string;
  dietTags: string[];
  ingredients: string[];
  steps: string[];
  loading?: boolean;
}

export interface SearchFilters {
  mealType?: string;
  country?: string;
  dietTags?: string[];
  page?: number;
  limit?: number;
}

export const recipeApi = {
  searchRecipes: async (
    ingredients: string[],
    filters: SearchFilters = {}
  ): Promise<{
    recipes: Recipe[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let filteredRecipes = mockRecipes;

    // Filter by meal type
    if (filters.mealType && filters.mealType !== "all") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.mealType === filters.mealType
      );
    }

    // Filter by country
    if (filters.country && filters.country !== "all") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.country === filters.country
      );
    }

    // Filter by diet tags
    if (filters.dietTags && filters.dietTags.length > 0) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        filters.dietTags!.some((tag) => recipe.dietTags.includes(tag))
      );
    }

    // Calculate match percentage based on ingredients
    if (ingredients.length > 0) {
      filteredRecipes = filteredRecipes.map((recipe) => {
        const matchingIngredients = recipe.ingredients.filter((ingredient) =>
          ingredients.some((userIngredient) =>
            ingredient.toLowerCase().includes(userIngredient.toLowerCase())
          )
        );
        const matchPercentage = Math.round(
          (matchingIngredients.length / recipe.ingredients.length) * 100
        );
        const missingIngredients = recipe.ingredients.filter(
          (ingredient) =>
            !ingredients.some((userIngredient) =>
              ingredient.toLowerCase().includes(userIngredient.toLowerCase())
            )
        );

        return {
          ...recipe,
          matchPercentage,
          missingIngredients,
        };
      });

      // Sort by match percentage
      filteredRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      recipes: filteredRecipes.slice(startIndex, endIndex),
      total: filteredRecipes.length,
      page,
      totalPages: Math.ceil(filteredRecipes.length / limit),
    };
  },

  getRecipe: async (id: string): Promise<Recipe> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const recipe = mockRecipes.find((r) => r.id === id);
    if (!recipe) throw new Error("Recipe not found");
    return recipe;
  },

  getSuggestedRecipes: async (): Promise<Recipe[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const hour = new Date().getHours();
    let mealType = "lunch";

    if (hour >= 6 && hour < 11) mealType = "breakfast";
    else if (hour >= 17 && hour < 22) mealType = "dinner";

    return mockRecipes
      .filter((recipe) => recipe.mealType === mealType)
      .slice(0, 4);
  },

  getIngredientSuggestions: async (query: string): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const allIngredients = [
      "chicken breast",
      "beef",
      "pork",
      "salmon",
      "tuna",
      "eggs",
      "milk",
      "cheese",
      "butter",
      "yogurt",
      "cream",
      "tomatoes",
      "onion",
      "garlic",
      "bell peppers",
      "mushrooms",
      "spinach",
      "lettuce",
      "rice",
      "pasta",
      "bread",
      "flour",
      "oats",
      "olive oil",
      "soy sauce",
      "salt",
      "pepper",
      "cumin",
      "paprika",
      "avocado",
      "lime",
      "lemon",
      "apple",
      "banana",
    ];

    return allIngredients
      .filter((ingredient) =>
        ingredient.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  signup: async (email: string, password: string, name: string) => {
    const response = await api.post("/auth/signup", { email, password, name });
    return response.data;
  },
};
