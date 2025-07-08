import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@radix-ui/react-collapsible';
import { Button } from './ui/button';
import {
  ChevronDown,
  ShoppingBasket,
  Leaf,
  Apple,
  Drumstick,
  Pizza,
  Sprout,
  Wheat,
  Fish,
} from 'lucide-react';
import type { IngredientCategory, Ingredient } from '@/types/recipe';
import { useTranslations } from 'next-intl';

interface IngredientCategoryProps {
  category: IngredientCategory;
  ingredients: Ingredient[];
  selectedIngredientIds: number[];
  isLoading: boolean;
  defaultOpen?: boolean;
  onToggleIngredient: (ingredient: Ingredient) => void;
}

function SkeletonBlock() {
  return <div className="animate-pulse bg-gray-200 rounded h-8 w-full mb-2" />;
}

const categoryIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
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

export function IngredientCategory({
  category,
  ingredients,
  selectedIngredientIds,
  isLoading,
  defaultOpen = false,
  onToggleIngredient,
}: IngredientCategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);
  const t = useTranslations('ux.sidebar');

  const selectedCount = useMemo(
    () =>
      ingredients.filter((ingredient) =>
        selectedIngredientIds.includes(ingredient.id)
      ).length,
    [ingredients, selectedIngredientIds]
  );

  const IconComponent = categoryIcons[category.name] || ShoppingBasket;
  const colorClass = categoryColors[category.name] || 'text-gray-500';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-3 h-auto bg-gray-50 hover:bg-gray-100"
          aria-expanded={isOpen}
        >
          <div className="flex items-start gap-3 w-full text-left">
            <IconComponent
              className={cn('w-5 h-5 flex-shrink-0 mt-0.5', colorClass)}
            />
            <span className="font-medium break-words whitespace-normal w-full block">
              {category.name}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">
              {isLoading ? (
                <SkeletonBlock />
              ) : (
                `${selectedCount}/${ingredients.length}`
              )}
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
      <CollapsibleContent className="mt-1">
        {isLoading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <SkeletonBlock key={i} />
            ))}
          </>
        ) : (
          <div
            className={cn(
              'flex flex-wrap gap-2 overflow-hidden transition-all',
              !showAll && 'max-h-[72px]'
            )}
          >
            {ingredients.map((ingredient) => (
              <Button
                key={ingredient.id}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-auto px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-800',
                  'hover:bg-blue-50 transition-colors',
                  'whitespace-normal break-words text-left text-wrap max-w-full',
                  selectedIngredientIds.includes(ingredient.id) &&
                    'bg-blue-100 text-blue-700 border-blue-400'
                )}
                onClick={() => onToggleIngredient(ingredient)}
              >
                <span className="block break-words">{ingredient.name}</span>
              </Button>
            ))}
          </div>
        )}

        {!isLoading && ingredients.length > 6 && (
          <Button
            variant="link"
            size="sm"
            className="text-blue-600 p-0 h-auto mt-2"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? t('showLess') : t('showMore')}
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
