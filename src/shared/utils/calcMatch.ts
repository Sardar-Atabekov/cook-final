export interface RecipeIngredient {
  recipe_id: number;
  line: string;
  matched_name?: string;
  ingredient_id?: number;
  created_at: string;
}

export interface UserIngredient {
  id: number;
  name: string;
  // другие поля...
}

export interface MatchResult {
  ownedIngredients: RecipeIngredient[];
  missingIngredients: RecipeIngredient[];
  matchPercentage: number;
  totalIngredients: number;
  ownedCount: number;
}

export function calculateIngredientMatch(
  recipeIngredients: RecipeIngredient[],
  userIngredients: UserIngredient[]
): MatchResult {
  // Получаем id выбранных пользователем ингредиентов
  const userIngredientIds = userIngredients.map((ing) => ing.id);

  // Разделяем ингредиенты на имеющиеся и отсутствующие
  const ownedIngredients = recipeIngredients.filter(
    (ri) => ri.ingredient_id && userIngredientIds.includes(ri.ingredient_id)
  );

  const missingIngredients = recipeIngredients.filter(
    (ri) => !ri.ingredient_id || !userIngredientIds.includes(ri.ingredient_id)
  );

  // Считаем процент совпадения
  const totalIngredients = recipeIngredients.length;
  const ownedCount = ownedIngredients.length;
  const matchPercentage =
    totalIngredients > 0
      ? Math.round((ownedCount / totalIngredients) * 100)
      : 0;

  return {
    ownedIngredients,
    missingIngredients,
    matchPercentage,
    totalIngredients,
    ownedCount,
  };
}
