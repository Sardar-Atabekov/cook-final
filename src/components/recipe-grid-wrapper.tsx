'use client';

import { RecipeGrid } from '@/components/recipe-grid';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { RecipeFilters } from '@/components/recipe-filters';
import { useState } from 'react';
import type { FilterState } from '@/components/recipe-filters';

interface RecipeGridWrapperProps {
  initialTags?: any[];
}

export function RecipeGridWrapper({
  initialTags = [],
}: RecipeGridWrapperProps) {
  const { selectedIngredients } = useIngredientStore();
  const [filters, setFilters] = useState<FilterState>({
    mealType: 'all',
    country: 'all',
    dietTags: 'all',
  });

  return (
    <div className="flex-1">
      {/* Фильтры */}
      <div className="mb-6">
        <RecipeFilters
          filters={filters}
          onFiltersChange={setFilters}
          initialTags={initialTags}
        />
      </div>

      <RecipeGrid selectedIngredients={selectedIngredients} filters={filters} />
    </div>
  );
}
