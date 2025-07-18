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
  Cherry,
  Grape,
  Nut,
  Milk,
  Beef,
  Bird,
  Soup,
  Candy,
  Coffee,
  Wine,
  Droplets,
  Zap,
  Flower,
  Carrot,
  Sandwich,
  Pill,
  Snowflake,
  Salad,
  Soup as SoupIcon,
  Wheat as WheatIcon,
  Globe,
  Utensils,
  Cookie,
  Layers,
  Flame,
  Bottle,
  Croissant,
  Pickaxe,
  Popcorn,
  Flame as FlameIcon,
  Heart,
  Sparkles,
  Shell,
  Egg,
  Soup as SoupIcon2,
  Wheat as Grain,
  Milk as DairyIcon,
  Carrot as RootIcon,
  Bread,
  Sprout as SproutIcon,
  Snowflake as FrozenIcon,
} from 'lucide-react';
import type { IngredientCategory, Ingredient } from '@/types/recipe';
import { useTranslations } from 'next-intl';
import React from 'react';

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

// Маппинг названий файлов к иконкам Lucide
const categoryIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'All cuisines.png': Globe,
  'vegetables.png': Leaf,
  'mushrooms.png': Sprout,
  'fruits.png': Apple,
  'berries.png': Cherry,
  'dried_fruit.png': Grape,
  'seeds.png': Nut,
  'cheese.png': Pizza,
  'dairy_no_cheese.png': Milk,
  'vegan_vegetarian.png': Sprout,
  'pork.png': Drumstick,
  'game_and_fowl.png': Bird,
  'canned_meat.png': Beef,
  'fish.png': Fish,
  'canned_fish.png': Fish,
  'seafood.png': Shell,
  'spices.png': Zap,
  'sugar_and_sweeteners.png': Candy,
  'essences.png': Droplets,
  'baking_flours.png': Wheat,
  'baking_and_grains.png': Grain,
  'porridge.png': WheatIcon,
  'Legumes.png': Nut,
  'past.png': Utensils,
  'oils.png': Droplets,
  'salads.png': Salad,
  'condiments.png': Wine,
  'canned_veggies.png': Leaf,
  'sauces.png': Soup,
  'soups_and_stews.png': SoupIcon,
  'jams.png': Cherry,
  'desserts_and_snacks.png': Cookie,
  'alcohol.png': Wine,
  'beverages.png': Coffee,
  'hot_drinks.png': Coffee,
  'spreads.png': Layers,
  'nuts.png': Nut,
  'dairy.png': DairyIcon,
  'charcuterie.png': Beef,
  'sandwiches.png': Sandwich,
  'lactose_free.png': Heart,
  'meats.png': Drumstick,
  'seasonings.png': Sparkles,
  'edible_flowers.png': Flower,
  'root_veggies.png': Carrot,
  'pasta_and_rice.png': Utensils,
  'Breads___Breading-7.png': Sandwich,
  'Leafy_Greens___Cabbages-88.png': SproutIcon,
  'supplements.png': Pill,
  'frozen veggies.png': FrozenIcon,
};

// Цвета для категорий
const categoryColors: Record<string, string> = {
  'All cuisines.png': 'text-purple-500',
  'vegetables.png': 'text-green-500',
  'mushrooms.png': 'text-amber-600',
  'fruits.png': 'text-red-500',
  'berries.png': 'text-purple-600',
  'dried_fruit.png': 'text-orange-500',
  'seeds.png': 'text-amber-700',
  'cheese.png': 'text-yellow-500',
  'dairy_no_cheese.png': 'text-blue-300',
  'vegan_vegetarian.png': 'text-green-600',
  'pork.png': 'text-pink-500',
  'game_and_fowl.png': 'text-red-600',
  'canned_meat.png': 'text-red-700',
  'fish.png': 'text-blue-500',
  'canned_fish.png': 'text-blue-600',
  'seafood.png': 'text-teal-500',
  'spices.png': 'text-orange-600',
  'sugar_and_sweeteners.png': 'text-pink-400',
  'essences.png': 'text-indigo-500',
  'baking_flours.png': 'text-amber-500',
  'baking_and_grains.png': 'text-yellow-600',
  'porridge.png': 'text-amber-600',
  'Legumes.png': 'text-green-700',
  'past.png': 'text-gray-500',
  'oils.png': 'text-yellow-400',
  'salads.png': 'text-green-400',
  'condiments.png': 'text-brown-500',
  'canned_veggies.png': 'text-green-600',
  'sauces.png': 'text-red-400',
  'soups_and_stews.png': 'text-orange-500',
  'jams.png': 'text-red-600',
  'desserts_and_snacks.png': 'text-pink-500',
  'alcohol.png': 'text-purple-600',
  'beverages.png': 'text-blue-400',
  'hot_drinks.png': 'text-brown-600',
  'spreads.png': 'text-amber-500',
  'nuts.png': 'text-amber-700',
  'dairy.png': 'text-blue-300',
  'charcuterie.png': 'text-red-700',
  'sandwiches.png': 'text-yellow-600',
  'lactose_free.png': 'text-green-500',
  'meats.png': 'text-red-600',
  'seasonings.png': 'text-orange-600',
  'edible_flowers.png': 'text-pink-600',
  'root_veggies.png': 'text-orange-500',
  'pasta_and_rice.png': 'text-yellow-500',
  'Breads___Breading-7.png': 'text-amber-600',
  'Leafy_Greens___Cabbages-88.png': 'text-green-500',
  'supplements.png': 'text-blue-600',
  'frozen veggies.png': 'text-cyan-500',
};

export const IngredientCategory = React.memo(function IngredientCategory({
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

  // Получаем иконку по названию файла, если не найдена - используем ShoppingBasket
  const IconComponent = categoryIcons[category.icon] || ShoppingBasket;
  const colorClass = categoryColors[category.icon] || 'text-gray-500';

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
});
