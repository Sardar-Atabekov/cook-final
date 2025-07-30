import { describe, it, expect, beforeEach } from 'vitest';
import { useIngredientStore } from './useIngredientStore';

describe('useIngredientStore', () => {
  beforeEach(() => {
    // Очищаем store перед каждым тестом
    useIngredientStore.setState({
      selectedIngredients: [],
      selectedIds: [],
      groupedCategories: [],
      lastUpdated: null,
      language: null,
    });
  });

  it('should add ingredient without duplicates', () => {
    const ingredient1 = { id: 1, name: 'Tomato' };
    const ingredient2 = { id: 1, name: 'Tomato' }; // Тот же id

    useIngredientStore.getState().addIngredient(ingredient1);
    useIngredientStore.getState().addIngredient(ingredient2);

    const state = useIngredientStore.getState();
    expect(state.selectedIngredients).toHaveLength(1);
    expect(state.selectedIds).toHaveLength(1);
    expect(state.selectedIds).toContain(1);
  });

  it('should remove ingredient correctly', () => {
    const ingredient = { id: 1, name: 'Tomato' };

    useIngredientStore.getState().addIngredient(ingredient);
    expect(useIngredientStore.getState().selectedIds).toContain(1);

    useIngredientStore.getState().removeIngredient(1);
    expect(useIngredientStore.getState().selectedIds).not.toContain(1);
    expect(useIngredientStore.getState().selectedIngredients).toHaveLength(0);
  });

  it('should clear ingredients on language change', () => {
    const ingredient = { id: 1, name: 'Tomato' };

    // Сначала устанавливаем начальный язык
    useIngredientStore.setState({ language: 'ru' });

    // Добавляем ингредиент
    useIngredientStore.getState().addIngredient(ingredient);
    expect(useIngredientStore.getState().selectedIds).toHaveLength(1);

    // Меняем язык
    useIngredientStore.getState().clearIngredientsOnLanguageChange('en');

    expect(useIngredientStore.getState().selectedIds).toHaveLength(0);
    expect(useIngredientStore.getState().selectedIngredients).toHaveLength(0);
    expect(useIngredientStore.getState().language).toBe('en');
  });

  it('should set selected ids without duplicates', () => {
    const categories = [
      {
        id: 1,
        name: 'Vegetables',
        ingredients: [
          { id: 1, name: 'Tomato' },
          { id: 2, name: 'Cucumber' },
        ],
      },
      {
        id: 2,
        name: 'Fruits',
        ingredients: [
          { id: 1, name: 'Tomato' }, // Дубликат
          { id: 3, name: 'Apple' },
        ],
      },
    ];

    // Устанавливаем категории
    useIngredientStore.getState().setGroupedCategories(categories, 'en');

    // Устанавливаем выбранные ids
    useIngredientStore.getState().setSelectedIds([1, 2, 3]);

    const state = useIngredientStore.getState();
    expect(state.selectedIds).toHaveLength(3);
    expect(state.selectedIngredients).toHaveLength(3); // Без дубликатов
    expect(state.selectedIngredients.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it('should clear ingredients when setting grouped categories with different language', () => {
    const ingredient = { id: 1, name: 'Tomato' };

    // Сначала устанавливаем начальный язык
    useIngredientStore.setState({ language: 'ru' });

    // Добавляем ингредиент
    useIngredientStore.getState().addIngredient(ingredient);
    expect(useIngredientStore.getState().selectedIds).toHaveLength(1);

    // Устанавливаем категории с новым языком
    const categories = [{ id: 1, name: 'Vegetables', ingredients: [] }];
    useIngredientStore.getState().setGroupedCategories(categories, 'en');

    expect(useIngredientStore.getState().selectedIds).toHaveLength(0);
    expect(useIngredientStore.getState().selectedIngredients).toHaveLength(0);
    expect(useIngredientStore.getState().language).toBe('en');
  });
});
