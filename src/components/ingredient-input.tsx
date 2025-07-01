'use client';

import React, { useState, useRef, useMemo, forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, X, Search } from 'lucide-react';
import type { Ingredient } from '@/types/recipe';
import { useIngredientStore } from '@/stores/useIngredientStore';

interface IngredientInputProps {
  onSearch?: () => void;
}

export const IngredientInput = forwardRef<
  HTMLInputElement,
  IngredientInputProps
>(({ onSearch }, ref) => {
  const t = useTranslations('ux.input');
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { selectedIngredients, addIngredient, removeIngredient } =
    useIngredientStore();

  const { data: allIngredients = [] } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients'],
    queryFn: () => fetch('/api/ingredients').then((res) => res.json()),
  });

  const filteredIngredients = useMemo(
    () =>
      allIngredients.filter(
        (ingredient) =>
          ingredient.name.toLowerCase().includes(query.toLowerCase()) &&
          !selectedIngredients.find((selected) => selected.id === ingredient.id)
      ),
    [allIngredients, query, selectedIngredients]
  );

  const handleAddIngredient = (ingredient: Ingredient) => {
    addIngredient(ingredient);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveIngredient = (id: number) => {
    removeIngredient(id);
  };

  const handleSearch = () => {
    onSearch?.();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3 text-left">
          {t('label')}
        </label>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                ref={mergeRefs(inputRef, ref)}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (filteredIngredients.length > 0) {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredIngredients.length > 0) {
                    e.preventDefault();
                    handleAddIngredient(filteredIngredients[0]);
                  } else if (e.key === 'ArrowDown') {
                    setIsOpen(true);
                  }
                }}
                placeholder={t('placeholder')}
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
              <Plus
                className="h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 cursor-pointer"
                onClick={() => {
                  if (filteredIngredients.length > 0) {
                    handleAddIngredient(filteredIngredients[0]);
                  }
                }}
              />
            </div>
          </PopoverTrigger>

          {isOpen && query.trim() && (
            <PopoverContent className="w-full p-0 max-h-64 overflow-y-auto">
              <Command>
                <CommandList>
                  {filteredIngredients.length > 0 ? (
                    <CommandGroup>
                      {filteredIngredients.slice(0, 5).map((ingredient) => (
                        <CommandItem
                          key={ingredient.id}
                          onSelect={() => handleAddIngredient(ingredient)}
                          className="cursor-pointer"
                        >
                          <span>{ingredient.name}</span>
                          {ingredient.category && (
                            <span className="ml-auto text-xs text-slate-500 capitalize">
                              {ingredient.category}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : (
                    <CommandEmpty className="p-5">
                      {t('noResults')}
                    </CommandEmpty>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-slate-50 rounded-lg border border-slate-200">
          {selectedIngredients.map((ingredient) => (
            <Badge
              key={ingredient.id}
              className="bg-brand-blue text-white hover:bg-blue-700 px-3 py-1 text-sm"
            >
              <span>{ingredient.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 hover:bg-transparent hover:text-blue-200"
                onClick={() => handleRemoveIngredient(ingredient.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {selectedIngredients.length === 0 && (
            <span className="text-slate-400 text-sm flex items-center">
              {t('emptyHint')}
            </span>
          )}
        </div>
      </div>

      <Button
        onClick={handleSearch}
        disabled={selectedIngredients.length === 0}
        className="w-full bg-brand-blue text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search className="mr-2 h-5 w-5" />
        {t('searchButton')} ({selectedIngredients.length})
      </Button>
    </div>
  );
});

IngredientInput.displayName = 'IngredientInput';

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null && typeof ref === 'object') {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}
