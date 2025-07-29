export interface RecipeIngredient {
  recipe_id?: number;
  recipeId?: number;
  line: string;
  matched_name?: string;
  matchedName?: string;
  ingredient_id?: number;
  ingredientId?: number;
  created_at?: string;
  createdAt?: string;
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

  // Также создаем массив названий для дополнительной проверки
  const userIngredientNames = userIngredients.map((ing) =>
    ing.name.toLowerCase().trim()
  );

  // Ингредиенты, которые есть по умолчанию у каждого
  const defaultIngredients = [
    'соль',
    'перец',
    'вода',
    'salt',
    'pepper',
    'water',
  ];

  // Разделяем ингредиенты на имеющиеся и отсутствующие
  const ownedIngredients: RecipeIngredient[] = [];
  const missingIngredients: RecipeIngredient[] = [];

  recipeIngredients.forEach((ri) => {
    let isOwned = false;

    // Проверяем по ID (пробуем разные варианты названий поля)
    const ingredientId = ri.ingredient_id || ri.ingredientId;
    if (ingredientId && userIngredientIds.includes(ingredientId)) {
      isOwned = true;
    }

    // Проверяем по названию (если не нашли по ID)
    if (!isOwned && ri.line) {
      const recipeIngredientName = ri.line.toLowerCase().trim();
      const matchedByName = userIngredientNames.some(
        (userName) =>
          recipeIngredientName.includes(userName) ||
          userName.includes(recipeIngredientName)
      );

      if (matchedByName) {
        isOwned = true;
      }
    }

    // Проверяем по matched_name/matchedName (если есть)
    const matchedName = ri.matched_name || ri.matchedName;
    if (!isOwned && matchedName) {
      const matchedNameLower = matchedName.toLowerCase().trim();
      const matchedByName = userIngredientNames.some(
        (userName) =>
          matchedNameLower.includes(userName) ||
          userName.includes(matchedNameLower)
      );

      if (matchedByName) {
        isOwned = true;
      }
    }

    // Проверяем, является ли ингредиент одним из стандартных (соль, перец, вода)
    if (!isOwned) {
      const ingredientText = (ri.line || matchedName || '')
        .toLowerCase()
        .trim();
      const isDefaultIngredient = defaultIngredients.some((defaultIngredient) =>
        ingredientText.includes(defaultIngredient)
      );

      if (isDefaultIngredient) {
        isOwned = true;
      }
    }

    if (isOwned) {
      ownedIngredients.push(ri);
    } else {
      missingIngredients.push(ri);
    }
  });

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
