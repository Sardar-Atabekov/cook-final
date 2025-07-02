import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function RecipeCard({
  recipe,
  onClick,
  onSave,
  isSaved,
}: RecipeCardProps) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const formatPrepTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {onSave && (
          <button
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full transition-colors',
              isSaved
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
          </button>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          {recipe.matchPercentage !== undefined && (
            <Badge
              className={cn(
                'text-white text-xs font-medium',
                getMatchColor(recipe.matchPercentage)
              )}
            >
              {recipe.matchPercentage}% Match
            </Badge>
          )}
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {formatPrepTime(recipe.prepTime)}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {recipe.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {recipe.description}
        </p>

        <div className="text-sm">
          {recipe.missingIngredients && recipe.missingIngredients.length > 0 ? (
            <>
              <span className="text-gray-500">Missing: </span>
              <span className="text-red-500">
                {recipe.missingIngredients.join(', ')}
              </span>
            </>
          ) : (
            <span className="text-green-600">✓ You have all ingredients!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
