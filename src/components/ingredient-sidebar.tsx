/* eslint-disable prettier/prettier */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useIngredientsSearch } from '@/hooks/useIngredients';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  ChevronDown,
  X,
  ShoppingBasket,
  Leaf,
  Apple,
  Drumstick,
  Pizza,
  Sprout,
  Wheat,
  Fish,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IngredientCategory, Ingredient } from '@/types/recipe';
import { ingredientsApi } from '@/lib/api';
const categoryIcons: Record<string, any> = {
  'Pantry Essentials': ShoppingBasket,
  'Vegetables & Greens': Leaf,
  Fruits: Apple,
  Meats: Drumstick,
  'Dairy & Eggs': Pizza,
  'Herbs & Spices': Sprout,
  'Grains & Cereals': Wheat,
  Seafood: Fish,
};

const categoryColors: Record<string, string> = {
  'Pantry Essentials': 'text-orange-500',
  'Vegetables & Greens': 'text-green-500',
  Fruits: 'text-red-500',
  Meats: 'text-red-600',
  'Dairy & Eggs': 'text-yellow-500',
  'Herbs & Spices': 'text-green-600',
  'Grains & Cereals': 'text-amber-600',
  Seafood: 'text-blue-500',
};

interface IngredientCategoryProps {
  category: IngredientCategory;
  selectedIngredients: number[];
  onToggleIngredient: (id: number) => void;
}

function IngredientCategory({
  category,
  selectedIngredients,
  onToggleIngredient,
}: IngredientCategoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { data: ingredients = [] } = useQuery({
    queryKey: ['/api/ingredients/list', { categoryId: category.id }],
    queryFn: () => ingredientsApi.getIngredients(category.id),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/ingredients/categories'],
    queryFn: () => ingredientsApi.getByCategoryAll(),
  });

  const selectedCount = ingredients.filter((ingredient: any) =>
    selectedIngredients.includes(ingredient.id)
  ).length;

  const IconComponent = categoryIcons[category.name] || ShoppingBasket;
  const colorClass = categoryColors[category.name] || 'text-gray-500';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-3 h-auto bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex items-center">
            <IconComponent className={cn('w-5 h-5 mr-3', colorClass)} />
            <span className="font-medium">{category.name}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">
              {selectedCount}/{ingredients.length}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 pl-4">
        <div className="grid grid-cols-2 gap-2">
          {ingredients
            .slice(0, showAll ? ingredients.length : 6)
            .map((ingredient: any) => (
              <Button
                key={ingredient.id}
                variant="ghost"
                size="sm"
                className={cn(
                  'justify-start text-left h-auto p-2 text-sm hover:bg-blue-50 transition-colors',
                  selectedIngredients.includes(ingredient.id) &&
                    'bg-blue-100 text-blue-700'
                )}
                onClick={() => onToggleIngredient(ingredient.id)}
              >
                {ingredient.name}
              </Button>
            ))}
        </div>
        {ingredients.length > 6 && (
          <Button
            variant="link"
            size="sm"
            className="text-blue-600 p-0 h-auto mt-2"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `+${ingredients.length - 6} More`}
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface IngredientSidebarProps {
  className?: string;
  selectedIngredients: number[];
  onIngredientsChange: (ingredients: number[]) => void;
}

export function IngredientSidebar({
  className,
  selectedIngredients,
  onIngredientsChange,
}: IngredientSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => ingredientsApi.getByCategoryAll(),
  });

  const { data: allIngredients = [] } = useQuery({
    queryKey: ['/api/ingredients'],
    queryFn: () => ingredientsApi.getIngredients(),
  });

  const toggleIngredient = (ingredientId: number) => {
    const newIngredients = selectedIngredients.includes(ingredientId)
      ? selectedIngredients.filter((id) => id !== ingredientId)
      : [...selectedIngredients, ingredientId];
    onIngredientsChange(newIngredients);
  };

  const removeIngredient = (ingredientId: number) => {
    onIngredientsChange(
      selectedIngredients.filter((id) => id !== ingredientId)
    );
  };

  const getIngredientName = (id: number) => {
    const ingredient = allIngredients.find((ing: any) => ing.id === id);
    return ingredient?.name || `Ingredient ${id}`;
  };

  const { data: searchResults = [] } = useIngredientsSearch(searchQuery);

  return (
    <aside
      className={cn(
        'w-80 min-w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto h-screen',
        className
      )}
    >
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Ingredients
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          We assume you have: salt, pepper, water
        </div>

        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Search Results</h3>
            <div className="grid grid-cols-2 gap-2">
              {searchResults.map((ingredient: any) => (
                <Button
                  key={ingredient.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start text-left h-auto p-2 text-sm hover:bg-blue-100',
                    selectedIngredients.includes(ingredient.id) &&
                      'bg-blue-100 text-blue-700'
                  )}
                  onClick={() => toggleIngredient(ingredient.id)}
                >
                  {ingredient.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Ingredient Categories */}
        <div className="space-y-4">
          {categoriesLoading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : (
            categories.map((category: any) => (
              <IngredientCategory
                key={category.id}
                category={category}
                selectedIngredients={selectedIngredients}
                onToggleIngredient={toggleIngredient}
              />
            ))
          )}
        </div>

        {/* Selected Ingredients Summary */}
        {selectedIngredients.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Selected Ingredients ({selectedIngredients.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredientId) => (
                <Badge
                  key={ingredientId}
                  variant="default"
                  className="bg-blue-600 text-white flex items-center"
                >
                  {getIngredientName(ingredientId)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0 hover:text-gray-200"
                    onClick={() => removeIngredient(ingredientId)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
