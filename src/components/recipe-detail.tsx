import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, ChefHat, ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/types';

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onCookDish: (recipe: Recipe) => void;
}

export function RecipeDetail({
  recipe,
  isOpen,
  onClose,
  onCookDish,
}: RecipeDetailProps) {
  if (!recipe) return null;

  const handleCookDish = () => {
    onCookDish(recipe);
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 pr-4">
              {recipe.title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-700 leading-relaxed">
            {recipe.description}
          </DialogDescription>

          {/* Recipe Image */}
          <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop`;
              }}
            />
          </div>

          {/* Recipe Stats */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">{recipe.prepTime} мин</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm">{recipe.servings} порций</span>
            </div>
            <Badge className={getDifficultyColor(recipe.difficulty)}>
              <ChefHat className="w-3 h-3 mr-1" />
              {recipe.difficulty}
            </Badge>
            {recipe.matchPercentage && (
              <Badge variant="secondary">
                Совпадение: {recipe.matchPercentage}%
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Separator />

        {/* Ingredients */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Ингредиенты</h3>
          <div className="grid gap-2">
            {recipe.recipeIngredients?.map((recipeIngredient, index) => (
              <div
                key={index}
                className={cn(
                  'flex justify-between items-center p-3 rounded-lg border',
                  recipeIngredient.required
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                )}
              >
                <span className="font-medium text-gray-900">
                  {recipeIngredient.ingredient?.name ||
                    `Ингредиент ${recipeIngredient.ingredientId}`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {recipeIngredient.amount}
                  </span>
                  {recipeIngredient.required && (
                    <Badge variant="outline" className="text-xs">
                      Обязательно
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {recipe.missingIngredients &&
            recipe.missingIngredients.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Недостающие ингредиенты:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.missingIngredients.map((ingredient, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-yellow-700 border-yellow-300"
                    >
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </div>

        <Separator />

        {/* Instructions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Инструкции</h3>
          <div className="space-y-3">
            {recipe.instructions?.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed pt-1">
                  {instruction}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleCookDish}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Готовить это блюдо
          </Button>

          {recipe.sourceUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(recipe.sourceUrl, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Оригинальный рецепт
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
