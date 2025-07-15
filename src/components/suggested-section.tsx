import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RecipeCard } from '@/components/recipe-card';
import type { RecipeWithIngredients } from '@/types/recipe';

interface SuggestedSectionProps {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  recipes: RecipeWithIngredients[];
  isLoading?: boolean;
  onRecipeClick?: (recipe: RecipeWithIngredients) => void;
}

export function SuggestedSection({
  title,
  icon,
  colorClass,
  recipes,
  isLoading = false,
  onRecipeClick,
}: SuggestedSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center mb-4">
        <span className={`mr-2 ${colorClass}`}>{icon}</span>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <Badge variant="outline" className="ml-2">
          {recipes.length}
        </Badge>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse h-40"
            />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.slice(0, 2).map((recipe) => (
            <div
              key={recipe.id}
              className="mb-4 last:mb-0"
              onClick={() => onRecipeClick?.(recipe)}
            >
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">No recipes available</p>
      )}
    </section>
  );
}
