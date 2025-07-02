import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChefHat, Trash2, Clock } from 'lucide-react';
import { usePantry } from '@/hooks/usePantry';
import { cn } from '@/lib/utils';

interface PantryDrawerProps {
  children: React.ReactNode;
}

export function PantryDrawer({ children }: PantryDrawerProps) {
  const { pantryItems, removeFromPantry, clearPantry, isPantryEmpty } =
    usePantry();
  const [isOpen, setIsOpen] = useState(false);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} дн назад`;
  };

  // Группируем элементы по рецептам
  const groupedItems = pantryItems.reduce(
    (acc, item) => {
      const key = item.recipeTitle || 'Другие ингредиенты';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, typeof pantryItems>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Кладовая
            {!isPantryEmpty && (
              <Badge variant="secondary" className="ml-2">
                {pantryItems.length}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isPantryEmpty ? (
            <div className="text-center py-8">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Кладовая пуста
              </h3>
              <p className="text-gray-600 text-sm">
                Приготовьте блюдо, чтобы добавить ингредиенты в кладовую
              </p>
            </div>
          ) : (
            <>
              {/* Действия с кладовой */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearPantry}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Очистить все
                </Button>
              </div>

              <Separator />

              {/* Список ингредиентов по группам */}
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([groupName, items]) => (
                  <div key={groupName} className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {groupName}
                    </h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={`${item.ingredientId}-${item.addedAt.getTime()}`}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {item.ingredientName}
                            </span>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(item.addedAt)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromPantry(item.ingredientId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Статистика */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700">
                  <strong>{pantryItems.length}</strong> ингредиентов в кладовой
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Готовых к использованию в новых рецептах
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
