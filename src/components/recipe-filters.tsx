'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  dietTags: string[];
}

interface Tag {
  id: number;
  name: string;
  tag: string;
  type: 'meal_type' | 'kitchen' | 'diet';
}

interface RecipeFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const sort = [
  { value: 'all', label: 'All' },
  { value: 'popular', label: 'Popular' },
  { value: 'new', label: 'New' },
  { value: 'random', label: 'Random' },
];
export function RecipeFilters({
  filters,
  onFiltersChange,
}: RecipeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => recipeApi.getAllTags(),
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

  const handleDietTagChange = (tag: string, checked: boolean) => {
    const newDietTags = checked
      ? [...filters.dietTags, tag]
      : filters.dietTags.filter((t) => t !== tag);

    onFiltersChange({ ...filters, dietTags: newDietTags });
  };

  const clearFilters = () => {
    onFiltersChange({
      mealType: 'all',
      country: 'all',
      dietTags: [],
    });
  };

  const activeFiltersCount =
    (filters.mealType && filters.mealType !== 'all' ? 1 : 0) +
    (filters.country && filters.country !== 'all' ? 1 : 0) +
    filters.dietTags.length;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Desktop Filters */}
      <div className="hidden md:flex items-center space-x-4">
        <Select
          value={filters.mealType}
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
              <SelectItem key={type.tag} value={type.tag}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.country}
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
              <SelectItem key={country.tag} value={country.tag}>
                {country.name}
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
                  value={filters.mealType}
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
                      <SelectItem key={type.tag} value={type.tag}>
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
                  value={filters.country}
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
                      <SelectItem key={country.tag} value={country.tag}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Diet Tags
                </label>
                <div className="space-y-3">
                  {diets.map((tag) => (
                    <div key={tag.tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.tag}
                        checked={filters.dietTags.includes(tag.tag)}
                        onCheckedChange={(checked) =>
                          handleDietTagChange(tag.tag, checked as boolean)
                        }
                      />
                      <label htmlFor={tag.tag} className="text-sm">
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
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
