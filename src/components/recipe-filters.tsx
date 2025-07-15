'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { recipeApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export interface FilterState {
  mealType: string;
  country: string;
  dietTags: string; // dietTags — строка, а не массив
}

interface Tag {
  id: number;
  name: string;
  tag: string;
  slug: string;
  type: 'meal_type' | 'kitchen' | 'diet';
}

interface RecipeFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  initialTags?: Tag[]; // Добавляем поддержку начальных тегов
}

export function RecipeFilters({
  filters,
  onFiltersChange,
  initialTags = [],
}: RecipeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: tags = initialTags,
    isLoading,
    error,
  } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => recipeApi.getAllTags(),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 дней
    retry: 3,
    // Используем начальные данные если они есть
    initialData: initialTags.length > 0 ? initialTags : undefined,
  });

  const mealTypes = useMemo(
    () =>
      Array.isArray(tags) ? tags.filter((t) => t.type === 'meal_type') : [],
    [tags]
  );

  const countries = useMemo(
    () => (Array.isArray(tags) ? tags.filter((t) => t.type === 'kitchen') : []),
    [tags]
  );

  const diets = useMemo(
    () => (Array.isArray(tags) ? tags.filter((t) => t.type === 'diet') : []),
    [tags]
  );

  const clearFilters = () => {
    onFiltersChange({
      mealType: 'all',
      country: 'all',
      dietTags: 'all',
    });
  };

  const activeFiltersCount =
    (filters.mealType && filters.mealType !== 'all' ? 1 : 0) +
    (filters.country && filters.country !== 'all' ? 1 : 0) +
    (filters.dietTags && filters.dietTags !== 'all' ? 1 : 0);

  // Показываем состояние загрузки только если нет начальных данных
  if (isLoading && initialTags.length === 0) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse">
          <div className="h-9 bg-gray-200 rounded-md w-40"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-9 bg-gray-200 rounded-md w-40"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-9 bg-gray-200 rounded-md w-40"></div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Ошибка загрузки фильтров: {error.message}
      </div>
    );
  }

  const actions = [
    {
      label: 'Quick',
      value: 'quick',
    },
    {
      label: 'Popular',
      value: 'popular',
    },
    {
      label: 'Random',
      value: 'random',
    },
    {
      label: 'Suggested',
      value: 'suggested',
    },
  ];
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Desktop Filters */}
      <div className="hidden md:flex items-center space-x-4">
        <Select
          value={filters.mealType || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, mealType: value })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Meal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Meal Types</SelectItem>
            {mealTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.country || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, country: value })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id.toString()}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dietTags || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              dietTags: value,
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Diet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Diets</SelectItem>
            {diets.map((diet) => (
              <SelectItem key={diet.id} value={diet.id.toString()}>
                {diet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.country || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, country: value })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action.value} value={action.value}>
                {action.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Recipes</SheetTitle>
              <SheetDescription>
                Narrow down your recipe search with these filters.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Meal Type
                </label>
                <Select
                  value={filters.mealType || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, mealType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meal Types</SelectItem>
                    {mealTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Country
                </label>
                <Select
                  value={filters.country || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, country: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem
                        key={country.id}
                        value={country.id.toString()}
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Diet</label>
                <Select
                  value={filters.dietTags || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      dietTags: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select diet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Diets</SelectItem>
                    {diets.map((diet) => (
                      <SelectItem key={diet.id} value={diet.id.toString()}>
                        {diet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full bg-transparent"
              >
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
